'use client';

import { useEffect, useRef, useState } from 'react';

export default function VideoChat({
  gameId,
  user,
  socket,
  opponentId,
}: {
  gameId: string;
  user: { id: string; token: string } | null;
  socket: WebSocket | null;
  opponentId: string | null;
}) {
  const myIdRef = useRef('');
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const userRef = useRef(user);
  const gameIdRef = useRef(gameId);
  const opponentIdRef = useRef(opponentId);
  const joinedRef = useRef(false);
  const isMicOnRef = useRef(isMicOn);
  isMicOnRef.current = isMicOn;

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    gameIdRef.current = gameId;
  }, [gameId]);

  useEffect(() => {
    opponentIdRef.current = opponentId;
  }, [opponentId]);

  async function createPeer(remoteUserId: string, mediaStream: MediaStream) {
    const currentSocket = socket;
    if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) return null;

    peerRef.current?.close();

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerRef.current = peer;

    mediaStream.getTracks().forEach((track) => {
      peer.addTrack(track, mediaStream);
    });

    peer.ontrack = (event) => {
      const audioEl = new Audio();
      audioEl.setAttribute('playsinline', '');
      audioEl.srcObject = event.streams[0];
      audioEl.play().catch(() => {});
    };

    peer.onicecandidate = (event) => {
      if (!event.candidate) return;

      currentSocket.send(
        JSON.stringify({
          type: 'ice-candidate',
          payload: {
            target: remoteUserId,
            candidate: event.candidate,
          },
        })
      );
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
        hangUp();
      }
    };

    return peer;
  }

  async function startCall() {
    const currentUser = userRef.current;
    const currentGameId = gameIdRef.current;
    const currentOpponentId = opponentIdRef.current;
    const currentSocket = socket;

    if (!currentUser || !currentGameId || !currentSocket || currentSocket.readyState !== WebSocket.OPEN) {
      return;
    }
    if (isMicOnRef.current) return;
    if (!currentOpponentId) return;

    try {
      setIsConnecting(true);

      let mediaStream = streamRef.current;

      if (!mediaStream) {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        streamRef.current = mediaStream;
      }

      const peer = createOrResetPeerConnection();
      if (!peer) return;

      mediaStream.getTracks().forEach((track) => peer.addTrack(track, mediaStream));

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      currentSocket.send(
        JSON.stringify({
          type: 'offer',
          payload: {
            target: currentOpponentId,
            offer,
          },
        })
      );

      setIsMicOn(true);
    } catch (e) {
      console.error('Voice start error:', e);
      hangUp();
    } finally {
      setIsConnecting(false);
    }
  }

  function createOrResetPeerConnection() {
    peerRef.current?.close();

    const currentSocket = socket;

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerRef.current = peer;

    peer.onicecandidate = async (event) => {
      if (!event.candidate || !currentSocket) return;
      console.log('[VideoChat] SENDING ICE candidate', {
        target: opponentIdRef.current,
        candidate: event.candidate.candidate,
      });
      currentSocket.send(
        JSON.stringify({
          type: 'ice-candidate',
          payload: {
            target: opponentIdRef.current,
            candidate: event.candidate,
          },
        })
      );
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
        hangUp();
      }
    };

    peer.ontrack = (event) => {
      const audioEl = new Audio();
      audioEl.setAttribute('playsinline', '');
      audioEl.srcObject = event.streams[0];
      audioEl.play().catch(() => {
        const onUserInteraction = () => {
          audioEl.play().catch(() => {});
          window.removeEventListener('click', onUserInteraction);
          window.removeEventListener('keydown', onUserInteraction);
          window.removeEventListener('touchstart', onUserInteraction);
        };
        window.addEventListener('click', onUserInteraction, { once: false });
        window.addEventListener('keydown', onUserInteraction, { once: false });
        window.addEventListener('touchstart', onUserInteraction, { once: false });
      });
    };

    return peer;
  }

  async function handleOffer(from: string, offer: RTCSessionDescriptionInit) {
    const currentSocket = socket;

    try {
      const peer = createOrResetPeerConnection();
      if (!peer || !currentSocket) return;

      await peer.setRemoteDescription(new RTCSessionDescription(offer));

      let localStream: MediaStream | null = null;

      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        streamRef.current = localStream;
        localStream.getTracks().forEach((track) => peer.addTrack(track, localStream as MediaStream));
      } catch (e) {
        console.error('Mic access denied:', e);
      }

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      currentSocket.send(
        JSON.stringify({
          type: 'answer',
          payload: {
            target: from,
            answer,
          },
        })
      );

      if (localStream) {
        setIsMicOn(true);
      }
    } catch (e) {
      console.error('Handle offer error:', e);
      hangUp();
    }
  }

  async function handleAnswer(sdp: RTCSessionDescriptionInit) {
    const pc = peerRef.current;
    if (!pc || !sdp) return;
    if (pc.signalingState === 'have-local-offer') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (e) {
        console.error('Handle answer error:', e);
        hangUp();
      }
    }
  }

  async function handleIceCandidate(candidate: RTCIceCandidateInit) {
    const pc = peerRef.current;
    if (!pc) return;

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.error('ICE error:', e);
    }
  }

  function hangUp() {
    peerRef.current?.close();
    peerRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsMicOn(false);
    setIsConnecting(false);
    joinedRef.current = false;
  }

  function stopCall() {
    const currentSocket = socket;
    if (currentSocket && currentSocket.readyState === WebSocket.OPEN && isMicOnRef.current) {
      currentSocket.send(
        JSON.stringify({
          type: 'offer',
          payload: {
            target: userRef.current?.id ?? '',
            offer: { type: 'bye' },
          },
        })
      );
    }
    hangUp();
  }

  async function toggleMic() {
    if (isMicOnRef.current) {
      stopCall();
    } else {
      await startCall();
    }
  }

  useEffect(() => {
    if (!user || !gameId || !socket) return;

    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'connected') {
          myIdRef.current = data.payload.userId;
        }

        if (data.type === 'room-users') {
          const users: string[] = data.payload.users;
          if (users.length === 0) return;

          const target = users[0];
          console.log('[VideoChat] RECEIVED room-users:', { myId: myIdRef.current, target, users });

          if (!streamRef.current) {
            try {
              const mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
              });
              streamRef.current = mediaStream;
              const peer = await createPeer(target, mediaStream);
              if (!peer) return;

              const offer = await peer.createOffer();
              await peer.setLocalDescription(offer);

              const outgoingOffer = {
                type: 'offer',
                payload: {
                  target,
                  offer,
                },
              };
              console.log('[VideoChat] SENDING offer:', outgoingOffer);
              socket.send(JSON.stringify(outgoingOffer));
            } catch (e) {
              console.error('Mic access denied:', e);
            }
          }
        }

        if (data.type === 'offer') {
          const { from, offer } = data.payload as {
            from: string;
            offer: RTCSessionDescriptionInit;
          };

          console.log('[VideoChat] RECEIVED offer from:', from, { sdpType: offer.type });

          await handleOffer(from, offer);
        }

        if (data.type === 'answer') {
          console.log('[VideoChat] RECEIVED answer:', data.payload.answer?.type);
          await handleAnswer(data.payload.answer);
        }

        if (data.type === 'ice-candidate') {
          console.log('[VideoChat] RECEIVED ICE candidate');
          await handleIceCandidate(data.payload.candidate);
        }

        if (data.type === 'user-left') {
          hangUp();
        }

        if (data.type === 'GAME_OVER' || data.type === 'GAME_ENDED' || data.type === 'EXIT_GAME') {
          hangUp();
        }
      } catch (e) {
        console.error('Signal parse error:', e);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
      hangUp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, gameId, socket]);

  if (!user || !socket) return null;

  return (
    <button
      onClick={toggleMic}
      disabled={isConnecting}
      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
        isMicOn
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
      }`}
    >
      {isConnecting ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Connecting...
        </span>
      ) : isMicOn ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full bg-emerald-400" />
          Mic On
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full bg-slate-500" />
          Mic Off
        </span>
      )}
    </button>
  );
}
