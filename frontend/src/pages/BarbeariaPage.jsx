import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import api from '../services/api';

const STATUS = {
  pendente:       { label: 'Pendente',        bg: 'rgba(255,255,255,0.08)',    color: 'rgba(240,240,240,0.6)' },
  confirmado:     { label: 'Confirmado',       bg: 'rgba(59,130,246,0.15)',     color: '#93C5FD' },
  em_atendimento: { label: 'Em atendimento',   bg: 'rgba(245,158,11,0.15)',     color: '#FCD34D' },
  concluido:      { label: 'Concluído',        bg: 'rgba(34,197,94,0.15)',      color: '#4ADE80' },
  cancelado:      { label: 'Cancelado',        bg: 'rgba(239,68,68,0.15)',      color: '#F87171' },
};

function AgendamentoCard({ ag, onStatus }) {
  const st = STATUS[ag.status] || STATUS.pendente;
  const hora = new Date(ag.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
      <div style={{ textAlign: 'center', minWidth: '52px' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F0F0F0', margin: 0, letterSpacing: '-0.02em' }}>{hora}</p>
      </div>

      <div style={{ borderLeft: '1px solid rgba(255,255,255,0.07)', height: '36px', flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, color: '#F0F0F0', margin: '0 0 3px', fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
          {ag.cliente?.name || 'Cliente'}
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.5)', margin: 0 }}>
          {ag.servico?.name}{ag.profissional?.name ? ` · ${ag.profissional.name}` : ''}
        </p>
      </div>

      <span
        className="badge"
        style={{ background: st.bg, color: st.color }}
      >
        {st.label}
      </span>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {ag.status === 'pendente' && (
          <button onClick={() => onStatus(ag.id, 'confirmado')} className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '6px 12px' }}>
            Confirmar
          </button>
        )}
        {ag.status === 'confirmado' && (
          <button onClick={() => onStatus(ag.id, 'em_atendimento')} className="btn-success" style={{ fontSize: '0.8125rem', padding: '6px 12px' }}>
            Iniciar
          </button>
        )}
        {ag.status === 'em_atendimento' && (
          <button onClick={() => onStatus(ag.id, 'concluido')} className="btn-primary" style={{ fontSize: '0.8125rem', padding: '6px 12px' }}>
            Concluir
          </button>
        )}
      </div>
    </div>
  );
}

export default function BarbeariaPage() {
  const qc = useQueryClient();

  const { data: agenda, isLoading } = useQuery({
    queryKey: ['barbearia-agenda'],
    queryFn: () => api.get('/barbearia/agenda-hoje').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/agendamentos/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['barbearia-agenda'] }),
  });

  const emAtendimento = agenda?.filter((a) => a.status === 'em_atendimento') || [];
  const proximoConfirmado = agenda?.find((a) => a.status === 'confirmado');

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Barbearia Kuat
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.45)', margin: 0 }}>Agenda do dia</p>
      </div>

      {/* Em atendimento */}
      {emAtendimento.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p className="section-label">Em atendimento</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {emAtendimento.map((ag) => (
              <AgendamentoCard key={ag.id} ag={ag} onStatus={(id, s) => updateStatus({ id, status: s })} />
            ))}
          </div>
        </div>
      )}

      {/* Próximo */}
      {proximoConfirmado && (
        <div style={{
          background: 'rgba(196,98,45,0.1)',
          border: '1px solid rgba(196,98,45,0.25)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C4622D', margin: '0 0 12px' }}>
            Próximo
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                {proximoConfirmado.cliente?.name}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.55)', margin: '0 0 6px' }}>
                {proximoConfirmado.servico?.name}{proximoConfirmado.profissional?.name ? ` · ${proximoConfirmado.profissional.name}` : ''}
              </p>
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#C4622D', margin: 0 }}>
                {new Date(proximoConfirmado.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button
              onClick={() => updateStatus({ id: proximoConfirmado.id, status: 'em_atendimento' })}
              className="btn"
              style={{ background: 'linear-gradient(135deg, #C4622D, #9C4A1F)', color: '#F0F0F0', flexShrink: 0 }}
            >
              Iniciar Atendimento
            </button>
          </div>
        </div>
      )}

      {/* Agenda completa */}
      <div>
        <p className="section-label">
          Agenda completa ({agenda?.length ?? 0} agendamentos)
        </p>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse" style={{ height: '72px' }} />
            ))}
          </div>
        ) : agenda?.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'rgba(240,240,240,0.4)', padding: '48px 24px' }}>
            Nenhum agendamento para hoje.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agenda?.map((ag) => (
              <AgendamentoCard key={ag.id} ag={ag} onStatus={(id, s) => updateStatus({ id, status: s })} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
