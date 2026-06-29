import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@repo/store/userAtom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const [error, setError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const name = params.get('name');

    if (token && userId && name) {
      setUser({ token, id: userId, name });
      navigate('/dashboard', { replace: true });
    } else {
      setError(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    }
  }, [navigate, setUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#030611] flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold text-rose-400">Authentication Failed</h2>
          <p className="text-slate-400 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030611] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 mt-4">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
