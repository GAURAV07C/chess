import { useEffect, useRef, useState, useCallback } from 'react';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

type WebRTCState = {
  isMicOn: boolean;
  isConnecting: boolean;
  isOpponentConnected: boolean;
  toggleMic: () => Promise<void>;
};

export const useWebRTC = (
  gameId: string | null,
  socket: WebSocket | null,
  user: { id: string; name: string } | null,
  opponentId: string | null
): WebRTCState => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOpponentConnected, setIsOpponentConnected] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const opponentIdRef = useRef(opponentId);
  const startingRef = useRef(false);

  useEffect(() => {
    opponentIdRef.current = opponentId;
  }, [opponentId]);

  const sendSignal = useCallback(
    (type: string, payload: Record<string, unknown>) => {
      if (!socket || !opponentIdRef.current || !gameId) return;
      socket.send(
        JSON.stringify({
          type,
          payload: { ...payload, targetUserId: opponentIdRef.current, gameId },
        })
      );
    },
    [socket, gameId]
  );

  const resetState = useCallback(() => {
    setIsOpponentConnected(false);
    setIsMicOn(false);
  }, []);

  const destroyPeerConnection = useCallback(() => {
    if (pcRef.current) {
      try {
        pcRef.current.ontrack = null;
        pcRef.current.onicecandidate = null;
        pcRef.current.onconnectionstatechange = null;
        pcRef.current.close();
      } catch {
        // ignore
      }
      pcRef.current = null;
    }
  }, []);

  const destroyLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  }, []);

  const destroyAudioEl = useCallback(() => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.srcObject = null;
      audioElRef.current.load();
      audioElRef.current = null;
    }
  }, []);

  const hangUp = useCallback(() => {
    destroyPeerConnection();
    destroyLocalStream();
    destroyAudioEl();
    resetState();
  }, [destroyPeerConnection, destroyLocalStream, destroyAudioEl, resetState]);

  const createOrResetPeerConnection = useCallback(() => {
    destroyPeerConnection();
    destroyAudioEl();

    const handleIceCandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate && pcRef.current) {
        sendSignal('VOICE_ICE_CANDIDATE', { candidate: event.candidate });
      }
    };

    const handleTrack = (event: RTCTrackEvent) => {
      const stream = event.streams[0];
      if (!stream) return;
      if (!stream.getAudioTracks().length) return;

      if (audioElRef.current) {
        audioElRef.current.srcObject = stream;
      } else {
        const audioEl = new Audio();
        audioEl.srcObject = stream;
        audioElRef.current = audioEl;
      }
      audioElRef.current.play().catch(console.error);
      setIsOpponentConnected(true);
    };

    const handleStateChange = () => {
      if (
        pcRef.current &&
        (pcRef.current.connectionState === 'failed' || pcRef.current.connectionState === 'disconnected')
      ) {
        hangUp();
      }
    };

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;
    pc.onicecandidate = handleIceCandidate;
    pc.ontrack = handleTrack;
    pc.onconnectionstatechange = handleStateChange;

    return pc;
  }, [destroyAudioEl, destroyPeerConnection, hangUp, sendSignal]);

  const startCall = useCallback(async () => {
    if (startingRef.current) return;
    if (!opponentIdRef.current || !socket || !gameId) return;

    try {
      startingRef.current = true;
      setIsConnecting(true);
      setIsMicOn(false);

      destroyPeerConnection();
      destroyLocalStream();
      destroyAudioEl();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      const unlockAudio = () => {
        const el = new Audio();
        el.srcObject = stream;
        el.muted = true;
        el.play().catch(() => {});
      };
      unlockAudio();

      const pc = createOrResetPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal('VOICE_OFFER', { sdp: offer });
      setIsMicOn(true);
    } catch (err) {
      console.error('Voice start error:', err);
      destroyPeerConnection();
      destroyLocalStream();
      destroyAudioEl();
      resetState();
      throw err;
    } finally {
      setIsConnecting(false);
      startingRef.current = false;
    }
  }, [
    socket,
    gameId,
    createOrResetPeerConnection,
    sendSignal,
    destroyPeerConnection,
    destroyLocalStream,
    destroyAudioEl,
    resetState,
  ]);

  const handleOffer = useCallback(
    async (sdp: RTCSessionDescriptionInit) => {
      if (!socket || !gameId) return;
      try {
        destroyPeerConnection();
        destroyLocalStream();
        destroyAudioEl();
        resetState();

        const pc = createOrResetPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        let localStream: MediaStream | null = null;
        try {
          localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          localStreamRef.current = localStream;
          localStream.getTracks().forEach((track) => pc.addTrack(track, localStream as MediaStream));
        } catch (err) {
          console.error('Callee mic error:', err);
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal('VOICE_ANSWER', { sdp: answer });
        if (localStream) {
          setIsMicOn(true);
        }
      } catch (err) {
        console.error('Handle offer error:', err);
        hangUp();
      }
    },
    [
      socket,
      gameId,
      createOrResetPeerConnection,
      sendSignal,
      destroyPeerConnection,
      destroyLocalStream,
      destroyAudioEl,
      resetState,
      hangUp,
    ]
  );

  const handleAnswer = useCallback(
    async (sdp: RTCSessionDescriptionInit) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (err) {
        console.error('Handle answer error:', err);
        hangUp();
      }
    },
    [hangUp]
  );

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('ICE error:', err);
    }
  }, []);

  const stopCall = useCallback(() => {
    hangUp();
    sendSignal('VOICE_END', {});
  }, [hangUp, sendSignal]);

  const toggleMic = useCallback(async () => {
    if (isMicOn) {
      stopCall();
    } else {
      try {
        await startCall();
      } catch (err) {
        console.error('Failed to start call:', err);
      }
    }
  }, [isMicOn, stopCall, startCall]);

  useEffect(() => {
    if (!socket || !user || !gameId || !opponentId) return;

    const handler = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.payload?.gameId !== gameId) return;
        if (message.payload?.fromUserId !== opponentIdRef.current) return;

        switch (message.type) {
          case 'VOICE_OFFER':
            handleOffer(message.payload.sdp);
            break;
          case 'VOICE_ANSWER':
            handleAnswer(message.payload.sdp);
            break;
          case 'VOICE_ICE_CANDIDATE':
            handleIceCandidate(message.payload.candidate);
            break;
          case 'VOICE_END':
            hangUp();
            break;
        }
      } catch (e) {
        console.error('WebRTC signal parse error:', e);
      }
    };

    socket.addEventListener('message', handler);
    return () => {
      socket.removeEventListener('message', handler);
      hangUp();
    };
  }, [socket, user, gameId, opponentId, handleOffer, handleAnswer, handleIceCandidate, hangUp]);

  useEffect(() => {
    return () => {
      hangUp();
    };
  }, [hangUp]);

  return { isMicOn, isConnecting, isOpponentConnected, toggleMic };
};
