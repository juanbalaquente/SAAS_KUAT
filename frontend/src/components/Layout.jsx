import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const navByRole = {
  dono: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/barbearia', label: '✂️ Barbearia' },
    { to: '/lavajato', label: '🚗 Lava Kuat' },
    { to: '/adega', label: '🍷 Adega R1' },
  ],
  barbeiro: [{ to: '/barbearia', label: '✂️ Barbearia Kuat' }],
  atendente_lava: [{ to: '/lavajato', label: '🚗 Lava Kuat' }],
  atendente_adega: [{ to: '/adega', label: '🍷 Adega R1' }],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const nav = navByRole[user?.role] || [];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="font-bold text-xl text-gray-900">
                SAAS Kuat
              </Link>
              <nav className="flex items-center gap-1">
                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.to
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
