import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full bg-fb-dark border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/')}>
            <span>Fanny</span>
            <span style={{ color: '#FF48B9' }}>Bags</span>
          </div>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/campaigns')}
                  className="text-gray-300 hover:text-white transition"
                >
                  Explore
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-300 hover:text-white transition"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-fb-pink text-white rounded hover:opacity-90 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-300 hover:text-white transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 bg-fb-pink text-white rounded hover:opacity-90 transition"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}