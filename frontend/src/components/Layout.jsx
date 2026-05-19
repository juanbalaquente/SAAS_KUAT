import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const navByRole = {
  dono: [
    { to: '/dashboard',    label: 'Dashboard'     },
    { to: '/agendamentos', label: 'Agendamentos'  },
    { to: '/barbearia',    label: 'Barbearia'     },
    { to: '/lavajato',     label: 'Lava Kuat'     },
    { to: '/adega',        label: 'Adega R1'      },
    { to: '/relatorios',   label: 'Relatórios'    },
    { to: '/gestao',       label: 'Gestão'        },
  ],
  barbeiro: [{ to: '/barbearia', label: 'Barbearia Kuat' }],
  atendente_lava: [{ to: '/lavajato', label: 'Lava Kuat' }],
  atendente_adega: [{ to: '/adega', label: 'Adega R1' }],
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0F1117' }}>
      <header style={{
        background: '#161B22',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
            {/* Logo + nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <Link
                to="/"
                style={{
                  fontWeight: 800,
                  fontSize: '1.0625rem',
                  letterSpacing: '-0.02em',
                  color: '#F0F0F0',
                  textDecoration: 'none',
                }}
              >
                SAAS Kuat
              </Link>

              <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {nav.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '7px',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 400,
                        textDecoration: 'none',
                        color: isActive ? '#F0F0F0' : 'rgba(240,240,240,0.5)',
                        background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                        transition: 'color 0.15s, background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.color = 'rgba(240,240,240,0.85)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.color = 'rgba(240,240,240,0.5)';
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User + logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.5)' }}>
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(240,240,240,0.35)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                  transition: 'color 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.75)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.35)'; }}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{
        flex: 1,
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {children}
      </main>
    </div>
  );
}
