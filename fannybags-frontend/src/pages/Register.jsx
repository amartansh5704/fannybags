import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('investor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, role);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-32 -right-40 w-80 h-80 bg-[#12CE6A] rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" />
      <div className="absolute -bottom-32 -left-40 w-96 h-96 bg-[#FF48B9] rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse animation-delay-2000" />
      
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
              <span className="text-4xl font-black bg-gradient-to-r from-[#12CE6A] via-purple-400 to-[#FF48B9] bg-clip-text text-transparent">
                FB
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Join the movement</h1>
            <p className="text-gray-400 text-sm">Own the future of music investing</p>
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
            {/* Name Field */}
            <div className="group">
              <label className="block text-sm font-semibold mb-2.5 text-gray-200 group-focus-within:text-[#12CE6A] transition-colors duration-200">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
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
                  placeholder="John Doe"
                  required
                />
                {focusedField === 'name' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#12CE6A]/10 to-transparent pointer-events-none" />
                )}
              </div>
            </div>

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

            {/* Role Selection */}
            <div className="pt-2">
              <label className="block text-sm font-semibold mb-3.5 text-gray-200">I am a:</label>
              <div className="flex gap-3">
                <label className="
                  flex-1 flex items-center justify-center px-4 py-3
                  border border-gray-700 rounded-xl
                  cursor-pointer
                  transition-all duration-200
                  hover:border-gray-600
                  has-[:checked]:border-[#12CE6A]
                  has-[:checked]:bg-[#12CE6A]/10
                  has-[:checked]:shadow-[0_0_15px_rgba(18,206,106,0.15)]
                ">
                  <input
                    type="radio"
                    value="investor"
                    checked={role === 'investor'}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium"> Investor</span>
                </label>
                <label className="
                  flex-1 flex items-center justify-center px-4 py-3
                  border border-gray-700 rounded-xl
                  cursor-pointer
                  transition-all duration-200
                  hover:border-gray-600
                  has-[:checked]:border-[#FF48B9]
                  has-[:checked]:bg-[#FF48B9]/10
                  has-[:checked]:shadow-[0_0_15px_rgba(255,72,185,0.15)]
                ">
                  <input
                    type="radio"
                    value="artist"
                    checked={role === 'artist'}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium"> Artist</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3.5 
                bg-gradient-to-r from-[#12CE6A] to-[#00d97f]
                text-black 
                rounded-xl 
                font-bold 
                text-base
                shadow-[0_10px_30px_rgba(18,206,106,0.3)]
                hover:shadow-[0_15px_40px_rgba(18,206,106,0.4)]
                hover:translate-y-[-2px]
                active:translate-y-[1px]
                active:shadow-[0_5px_15px_rgba(18,206,106,0.2)]
                transition-all duration-200
                disabled:opacity-60 
                disabled:cursor-not-allowed
                disabled:hover:shadow-[0_10px_30px_rgba(18,206,106,0.3)]
                disabled:hover:translate-y-0
                mt-8
              "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                ' Create account'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-8 text-gray-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="
                text-[#12CE6A] 
                hover:text-[#FF48B9]
                font-bold 
                transition-all duration-200
                hover:underline
                hover:underline-offset-2
              "
            >
              Sign in
            </button>
          </p>
        </div>

        {/* Bottom accent */}
        <div className="mt-8 text-center text-xs text-gray-500">
          
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