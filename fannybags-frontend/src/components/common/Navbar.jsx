// src/components/layout/Navbar.jsx
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { logout, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Base menu for authenticated users
  // Base menu for authenticated users
const baseMenuItems = [
  { id: 'explore', label: 'Explore', path: '/app/explore', allowed: true },
  { id: 'dashboard', label: 'Dashboard', path: '/app/dashboard', allowed: true },
  { id: 'wallet', label: 'Wallet', path: '/app/wallet', allowed: user?.role === 'investor' },
  { id: 'artist', label: 'My Profile', path: user ? `/artist/${user.id}` : '#', allowed: user?.role === 'artist' },

  // ⭐ NEW — Make Me Money (previous floating button)
  

  { id: 'logout', label: 'Logout', path: 'logout', allowed: isAuthenticated },
];


  // Menu for guests
  const guestItems = [
    { id: 'explore', label: 'Explore', path: '/app/explore' },
    { id: 'login', label: 'Login', path: '/login' },
    { id: 'signup', label: 'Sign Up', path: '/register' },
  ];

  const authedItems = baseMenuItems.filter((item) => item.allowed);
  const visibleItems = isAuthenticated ? authedItems : guestItems;

  // Figure out which tab is active based on URL
  const activeItem = (() => {
    if (isAuthenticated) {
      const found = authedItems.find((item) =>
        item.path !== 'logout' &&
        location.pathname.startsWith(
          item.id === 'artist' ? '/artist' : item.path
        )
      );
      return found || authedItems[0];
    } else {
      const found = guestItems.find((item) =>
        location.pathname.startsWith(item.path)
      );
      return found || guestItems[0];
    }
  })();

  const activeIndex = visibleItems.findIndex((item) => item.id === activeItem.id);
  const safeIndex = activeIndex === -1 ? 0 : activeIndex;
  const gliderWidth = `${100 / visibleItems.length}%`;
  const gliderTranslate = `translateX(${safeIndex * 100}%)`;

  const handleClick = (item) => {
    if (item.id === 'logout') {
      logout();
      navigate('/');
      return;
    }
    if (item.path && item.path !== '#') {
      navigate(item.path);
    }
  };

  return (
    <nav className="
  fixed 
  top-0 
  left-1/2 
  -translate-x-1/2
  w-[96%] 
  bg-[rgba(10,10,10,0.05)] 
  backdrop-blur-xl 
  border border-[rgba(255,255,255,0.08)] 
  rounded-2xl 
  shadow-[0_12px_40px_rgba(0,0,0,0.25)] 
  z-50 
">

      <div className="w-full px-4 py-3 flex justify-between items-center">
        {/* Logo (left) */}
        <div
          className="text-2xl font-bold cursor-pointer select-none"
          onClick={() => navigate('/')}
        >
          <span>Fanny</span>
          <span style={{ color: '#FF48B9' }}>Bags</span>
        </div>

        {/* Glowing pill nav (right) */}
        <div className="fb-tabs">
          {/* Glider */}
          <span
            className="fb-glider"
            style={{
              width: gliderWidth,
              transform: gliderTranslate,
            }}
          />

          {/* Buttons */}
          {visibleItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className={
                'fb-tab' +
                (item.id === activeItem.id ? ' fb-tab--active' : '')
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
