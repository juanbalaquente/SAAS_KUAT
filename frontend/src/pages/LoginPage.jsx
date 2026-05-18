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
  { name: 'Carlos (Dono)', email: 'carlos@saaskuat.com', password: 'kuat@2024', color: 'bg-blue-600' },
  { name: 'Rafael (Barbeiro)', email: 'rafael@saaskuat.com', password: 'kuat@2024', color: 'bg-orange-500' },
  { name: 'Diego (Lava Kuat)', email: 'diego@saaskuat.com', password: 'kuat@2024', color: 'bg-yellow-500' },
  { name: 'Marcos (Adega)', email: 'marcos@saaskuat.com', password: 'kuat@2024', color: 'bg-green-600' },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SAAS Kuat</h1>
          <p className="text-gray-400">Sistema de Gestão Multi-Loja</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Entrar</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-base"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-xs text-gray-500 text-center mb-3">Acesso rápido — Demo</p>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  onClick={() => fillDemo(u)}
                  className={`${u.color} text-white text-xs px-3 py-2 rounded-lg hover:opacity-90 transition font-medium`}
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
