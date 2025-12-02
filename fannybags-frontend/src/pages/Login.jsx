import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-20 -left-40 w-80 h-80 bg-[#FF48B9] rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />
      <div className="absolute -bottom-40 right-20 w-96 h-96 bg-[#12CE6A] rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse animation-delay-2000" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="
          border border-gray-700
          rounded-2xl p-8 bg-black/50 
          backdrop-blur-sm
          shadow-2xl
          hover:border-gray-600
          transition-all duration-300
          animate-[fadeIn_0.6s_ease-out]
        ">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-block mb-4">
              <span className="text-4xl font-black bg-gradient-to-r from-[#FF48B9] via-purple-400 to-[#12CE6A] bg-clip-text text-transparent">
                FB
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-gray-400 text-sm">Jump back into the music investing game</p>
          </div>

          {error && (
            <div className="
              mb-6 p-4 
              bg-red-950/40 
              border border-red-800/60
              text-red-100 
              rounded-xl 
              text-sm
              backdrop-blur-sm
              animate-[fadeIn_0.3s_ease-out]
              shadow-lg shadow-red-900/20
            ">
              <span className="inline-block mr-2">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-semibold mb-2.5 text-gray-200 group-focus-within:text-[#FF48B9] transition-colors duration-200">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="
                    w-full px-4 py-3.5 
                    bg-black 
                    text-white 
                    border border-gray-700
                    rounded-xl
                    focus:outline-none 
                    focus:border-[#FF48B9]
                    focus:shadow-[0_0_20px_rgba(255,72,185,0.2)]
                    transition-all duration-300
                    text-sm
                  "
                  placeholder="you@example.com"
                  required
                />
                {focusedField === 'email' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF48B9]/10 to-transparent pointer-events-none" />
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-semibold mb-2.5 text-gray-200 group-focus-within:text-[#12CE6A] transition-colors duration-200">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="
                    w-full px-4 py-3.5 
                    bg-black 
                    text-white 
                    border border-gray-700
                    rounded-xl 
                    focus:outline-none 
                    focus:border-[#12CE6A]
                    focus:shadow-[0_0_20px_rgba(18,206,106,0.2)]
                    transition-all duration-300
                    text-sm
                  "
                  placeholder="••••••••"
                  required
                />
                {focusedField === 'password' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#12CE6A]/10 to-transparent pointer-events-none" />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3.5 
                bg-gradient-to-r from-[#FF48B9] to-[#12CE6A]
                text-black 
                rounded-xl 
                font-bold 
                text-base
                shadow-[0_10px_30px_rgba(255,72,185,0.3)]
                hover:shadow-[0_15px_40px_rgba(255,72,185,0.4)]
                hover:translate-y-[-2px]
                active:translate-y-[1px]
                active:shadow-[0_5px_15px_rgba(255,72,185,0.2)]
                transition-all duration-200
                disabled:opacity-60 
                disabled:cursor-not-allowed
                disabled:hover:shadow-[0_10px_30px_rgba(255,72,185,0.3)]
                disabled:hover:translate-y-0
                mt-8
              "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                ' Sign in'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-8 text-gray-400 text-sm">
            New to FannyBags?{' '}
            <button
              onClick={() => navigate('/register')}
              className="
                text-[#FF48B9] 
                hover:text-[#12CE6A]
                font-bold 
                transition-all duration-200
                hover:underline
                hover:underline-offset-2
              "
            >
              Create account
            </button>
          </p>
        </div>

        {/* Bottom accent */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p></p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}