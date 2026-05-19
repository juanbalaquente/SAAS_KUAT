import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const redirectMap = {
  dono: '/dashboard',
  barbeiro: '/barbearia',
  atendente_lava: '/lavajato',
  atendente_adega: '/adega',
};

const demoUsers = [
  { name: 'Carlos (Dono)', email: 'carlos@saaskuat.com', password: 'kuat@2024', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
  { name: 'Rafael (Barbeiro)', email: 'rafael@saaskuat.com', password: 'kuat@2024', gradient: 'linear-gradient(135deg, #C4622D, #9C4A1F)' },
  { name: 'Diego (Lava Kuat)', email: 'diego@saaskuat.com', password: 'kuat@2024', gradient: 'linear-gradient(135deg, #2E6B8A, #1F4E6B)' },
  { name: 'Marcos (Adega)', email: 'marcos@saaskuat.com', password: 'kuat@2024', gradient: 'linear-gradient(135deg, #2D6A4F, #1F4E38)' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate(redirectMap[result.user.role] || '/dashboard');
    } else {
      setError(result.message);
    }
  };

  const fillDemo = (u) => {
    setEmail(u.email);
    setPassword(u.password);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#F0F0F0',
            margin: '0 0 8px',
          }}>
            SAAS Kuat
          </h1>
          <p style={{
            fontSize: '0.9375rem',
            fontWeight: 300,
            color: 'rgba(240,240,240,0.45)',
          }}>
            Sistema de Gestão Multi-Loja
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#161B22',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.4), 0 20px 40px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{
            fontSize: '1.0625rem',
            fontWeight: 600,
            color: '#F0F0F0',
            margin: '0 0 28px',
          }}>
            Entrar
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'rgba(240,240,240,0.65)',
                marginBottom: '6px',
              }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'rgba(240,240,240,0.65)',
                marginBottom: '6px',
              }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#F87171',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ justifyContent: 'center', padding: '13px', fontSize: '0.9375rem', marginTop: '4px' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '28px 0 16px',
          }}>
            <div style={{ flex: 1, borderTop: '1px solid rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.3)', whiteSpace: 'nowrap' }}>
              Acesso rápido — Demo
            </span>
            <div style={{ flex: 1, borderTop: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {demoUsers.map((u) => (
              <button
                key={u.email}
                onClick={() => fillDemo(u)}
                className="btn"
                style={{
                  background: u.gradient,
                  color: '#F0F0F0',
                  fontSize: '0.75rem',
                  padding: '9px 10px',
                  justifyContent: 'center',
                  transition: 'opacity 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
