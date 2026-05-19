import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../services/api';

export default function ConfirmacaoPage() {
  const { id } = useParams();
  const [cancelado, setCancelado] = useState(false);

  const { data: ag, isLoading } = useQuery({
    queryKey: ['agendamento-publico', id],
    queryFn: () => api.get(`/agendamentos/${id}/publico`).then((r) => r.data.data),
  });

  const { mutate: cancelar, isPending } = useMutation({
    mutationFn: () => api.patch(`/agendamentos/${id}/cancelar`),
    onSuccess: () => setCancelado(true),
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(59,130,246,0.2)',
          borderTopColor: '#3B82F6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!ag) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(240,240,240,0.5)', marginBottom: '16px' }}>Agendamento não encontrado.</p>
          <Link to="/" className="btn-primary">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  const hora = new Date(ag.scheduled_at).toLocaleString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });

  const isCanceled = cancelado || ag.status === 'cancelado';

  return (
    <div style={{ minHeight: '100vh', background: '#0F1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{
          background: '#161B22',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '40px 36px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.25)',
          textAlign: 'center',
        }}>
          {isCanceled ? (
            <>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '1.75rem',
              }}>
                ✕
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Agendamento cancelado
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.5)', margin: 0 }}>
                Seu agendamento foi cancelado com sucesso.
              </p>
            </>
          ) : (
            <>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '1.75rem',
              }}>
                ✓
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Agendamento confirmado!
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.5)', margin: '0 0 28px' }}>
                Você receberá uma confirmação pelo WhatsApp.
              </p>

              {/* Summary */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'left',
              }}>
                {[
                  { label: 'Cliente', value: ag.cliente?.name },
                  { label: 'Serviço', value: ag.servico?.name },
                  ag.profissional && { label: 'Profissional', value: ag.profissional.name },
                  { label: 'Horário', value: hora, capitalize: true },
                  {
                    label: 'Valor',
                    value: ag.servico?.price_cents > 0
                      ? `R$${(ag.servico.price_cents / 100).toFixed(2)}`
                      : 'Grátis',
                    highlight: true,
                  },
                ].filter(Boolean).map(({ label, value, capitalize, highlight }, i, arr) => (
                  <div key={label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                    paddingBottom: i < arr.length - 1 ? '10px' : 0,
                    marginBottom: i < arr.length - 1 ? '10px' : 0,
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}>
                    <span style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.45)' }}>{label}</span>
                    <span style={{
                      fontSize: '0.8125rem',
                      fontWeight: highlight ? 700 : 500,
                      color: highlight ? '#4ADE80' : '#F0F0F0',
                      textAlign: 'right',
                      textTransform: capitalize ? 'capitalize' : 'none',
                    }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Code */}
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(240,240,240,0.35)',
                fontFamily: 'monospace',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '6px',
                padding: '8px 12px',
                marginBottom: '20px',
                letterSpacing: '0.05em',
              }}>
                Código: #{String(ag.id).padStart(6, '0')}
              </div>

              {['pendente', 'confirmado'].includes(ag.status) && (
                <button
                  onClick={() => cancelar()}
                  disabled={isPending}
                  className="btn-danger"
                  style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
                >
                  {isPending ? 'Cancelando...' : 'Cancelar agendamento'}
                </button>
              )}
            </>
          )}

          <Link
            to="/"
            style={{
              display: 'block',
              marginTop: '20px',
              fontSize: '0.875rem',
              color: 'rgba(240,240,240,0.4)',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.75)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.4)'; }}
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
