import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './store/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BarbeariaPage from './pages/BarbeariaPage';
import LavaJatoPage from './pages/LavaJatoPage';
import AdegaPage from './pages/AdegaPage';
import AgendamentoPage from './pages/AgendamentoPage';
import ConfirmacaoPage from './pages/ConfirmacaoPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/agendar/:loja" element={<AgendamentoPage />} />
            <Route path="/confirmacao/:id" element={<ConfirmacaoPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={['dono']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/barbearia"
              element={
                <ProtectedRoute roles={['dono', 'barbeiro']}>
                  <BarbeariaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lavajato"
              element={
                <ProtectedRoute roles={['dono', 'atendente_lava']}>
                  <LavaJatoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adega"
              element={
                <ProtectedRoute roles={['dono', 'atendente_adega']}>
                  <AdegaPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
