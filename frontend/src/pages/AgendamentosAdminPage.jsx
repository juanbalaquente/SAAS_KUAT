import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import api from '../services/api';

const STATUS_LABEL = {
  pendente:         { label: 'Pendente',       color: '#F0B429', bg: 'rgba(240,180,41,0.12)' },
  confirmado:       { label: 'Confirmado',     color: '#34D399', bg: 'rgba(52,211,153,0.1)'  },
  em_atendimento:   { label: 'Em atendimento', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)'  },
  concluido:        { label: 'Concluído',      color: 'rgba(240,240,240,0.45)', bg: 'rgba(255,255,255,0.05)' },
  cancelado:        { label: 'Cancelado',      color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
};

const LOJA_OPTS = [
  { value: '',  label: 'Todas as lojas' },
  { value: '1', label: 'Barbearia Kuat' },
  { value: '2', label: 'Lava Kuat' },
  { value: '3', label: 'Adega R1' },
];
const STATUS_OPTS = [
  { value: '', label: 'Todos os status' },
  ...Object.entries(STATUS_LABEL).map(([v, s]) => ({ value: v, label: s.label })),
];
const STATUS_ACTIONS = ['pendente', 'confirmado', 'em_atendimento', 'concluido', 'cancelado'];

export default function AgendamentosAdminPage() {
  const qc = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [filtros, setFiltros] = useState({ inicio: today, fim: today, loja_id: '', status: '' });
  const [activeId, setActiveId] = useState(null);

  const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''));

  const { data: agendamentos = [], isLoading } = useQuery({
    queryKey: ['agendamentos-admin', filtros],
    queryFn: () => api.get('/agendamentos', { params }).then((r) => r.data.data),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/agendamentos/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries(['agendamentos-admin']); setActiveId(null); },
  });

  const setF = (k, v) => setFiltros((p) => ({ ...p, [k]: v }));

  const selStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#F0F0F0',
    padding: '7px 10px',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1100px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#F0F0F0', margin: '0 0 4px' }}>Agendamentos</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.4)', margin: 0 }}>Visão consolidada das 3 lojas</p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input type="date" value={filtros.inicio} onChange={(e) => setF('inicio', e.target.value)} style={selStyle} />
            <span style={{ color: 'rgba(240,240,240,0.3)' }}>–</span>
            <input type="date" value={filtros.fim} onChange={(e) => setF('fim', e.target.value)} style={selStyle} />
          </div>
          <select value={filtros.loja_id} onChange={(e) => setF('loja_id', e.target.value)} style={selStyle}>
            {LOJA_OPTS.map((o) => <option key={o.value} value={o.value} style={{ background: '#1C2128' }}>{o.label}</option>)}
          </select>
          <select value={filtros.status} onChange={(e) => setF('status', e.target.value)} style={selStyle}>
            {STATUS_OPTS.map((o) => <option key={o.value} value={o.value} style={{ background: '#1C2128' }}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setFiltros({ inicio: today, fim: today, loja_id: '', status: '' })}
            style={{ ...selStyle, color: 'rgba(240,240,240,0.4)', fontSize: '0.8125rem', padding: '7px 14px' }}
          >Hoje</button>
          <span style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.35)', marginLeft: 'auto' }}>
            {agendamentos.length} resultado{agendamentos.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Tabela */}
        <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(240,240,240,0.3)' }}>Carregando...</div>
          ) : agendamentos.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(240,240,240,0.3)', fontSize: '0.875rem' }}>
              Nenhum agendamento encontrado.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Data/Hora', 'Loja', 'Cliente', 'Serviço', 'Profissional', 'Status', 'Ação'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'rgba(240,240,240,0.35)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agendamentos.map((ag) => {
                  const st = STATUS_LABEL[ag.status] || STATUS_LABEL.pendente;
                  const isOpen = activeId === ag.id;
                  return (
                    <tr key={ag.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px', color: '#F0F0F0', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {format(new Date(ag.scheduled_at), 'dd/MM HH:mm')}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'rgba(240,240,240,0.6)', whiteSpace: 'nowrap' }}>
                        {ag.loja?.name?.replace('Barbearia ', '').replace('Kuat', 'Kuat')}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#F0F0F0', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ag.cliente?.name}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'rgba(240,240,240,0.7)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ag.servico?.name}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'rgba(240,240,240,0.5)' }}>
                        {ag.profissional?.name || '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: st.color, background: st.bg, whiteSpace: 'nowrap' }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', position: 'relative' }}>
                        {ag.status !== 'cancelado' && ag.status !== 'concluido' && (
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              onClick={() => setActiveId(isOpen ? null : ag.id)}
                              style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(240,240,240,0.7)', fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                            >
                              Alterar ▾
                            </button>
                            {isOpen && (
                              <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 50, background: '#1C2128', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '6px', minWidth: '160px', marginTop: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                                {STATUS_ACTIONS.filter((s) => s !== ag.status).map((s) => (
                                  <button key={s} onClick={() => updateStatus({ id: ag.id, status: s })}
                                    style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', color: STATUS_LABEL[s]?.color || '#F0F0F0', borderRadius: '6px', transition: 'background 0.1s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                  >
                                    {STATUS_LABEL[s]?.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
