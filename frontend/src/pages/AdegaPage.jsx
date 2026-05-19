import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import api from '../services/api';
import PDVModal from '../components/PDVModal';

const PEDIDO_STATUS = {
  aguardando: { label: 'Aguardando', bg: 'rgba(255,255,255,0.08)',    color: 'rgba(240,240,240,0.6)' },
  preparando: { label: 'Preparando', bg: 'rgba(245,158,11,0.15)',     color: '#FCD34D' },
  em_rota:    { label: 'Em Rota',    bg: 'rgba(59,130,246,0.15)',     color: '#93C5FD' },
  entregue:   { label: 'Entregue',   bg: 'rgba(34,197,94,0.15)',      color: '#4ADE80' },
  cancelado:  { label: 'Cancelado',  bg: 'rgba(239,68,68,0.15)',      color: '#F87171' },
};

const NEXT_STATUS = { aguardando: 'preparando', preparando: 'em_rota', em_rota: 'entregue' };
const NEXT_LABEL  = { aguardando: 'Iniciar Preparo', preparando: 'Saiu para Entrega', em_rota: 'Marcar Entregue' };

export default function AdegaPage() {
  const [pdvOpen, setPdvOpen] = useState(false);
  const qc = useQueryClient();

  const { data: alertas } = useQuery({
    queryKey: ['adega-alertas'],
    queryFn: () => api.get('/adega/alertas').then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const { data: pedidos } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => api.get('/pedidos').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { mutate: updatePedido } = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/pedidos/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos'] }),
  });

  const pedidosAtivos = pedidos?.filter((p) => ['aguardando', 'preparando', 'em_rota'].includes(p.status)) || [];

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Adega R1
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.45)', margin: 0 }}>Vendas e entregas</p>
        </div>
        <button
          onClick={() => setPdvOpen(true)}
          className="btn"
          style={{ background: 'linear-gradient(135deg, #2D6A4F, #1F4E38)', color: '#F0F0F0', padding: '10px 20px', fontSize: '0.9375rem', flexShrink: 0 }}
        >
          Abrir PDV
        </button>
      </div>

      {/* Alertas de estoque */}
      {alertas && alertas.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '12px',
          padding: '18px 20px',
          marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F87171', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚠</span> Alertas de Estoque ({alertas.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
            {alertas.map((p) => (
              <div key={p.id} style={{
                background: '#161B22',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: '8px',
                padding: '10px 12px',
              }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#F0F0F0', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.nome}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#F87171', margin: 0 }}>
                  Estoque: {p.estoque_atual} (mín: {p.estoque_minimo})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pedidos ativos */}
      <p className="section-label">Pedidos Ativos ({pedidosAtivos.length})</p>

      {pedidosAtivos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'rgba(240,240,240,0.4)', padding: '48px 24px' }}>
          Nenhum pedido ativo no momento.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pedidosAtivos.map((pedido) => {
            const st = PEDIDO_STATUS[pedido.status] || PEDIDO_STATUS.aguardando;
            const isDelivery = pedido.tipo === 'delivery';

            return (
              <div key={pedido.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      className="badge"
                      style={{
                        background: isDelivery ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.08)',
                        color: isDelivery ? '#C084FC' : 'rgba(240,240,240,0.6)',
                      }}
                    >
                      {isDelivery ? '🛵 Delivery' : '🏪 Balcão'}
                    </span>
                    <span className="badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <p style={{ fontWeight: 600, color: '#F0F0F0', margin: '0 0 2px', fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
                    {pedido.cliente?.name || 'Cliente avulso'}
                    <span style={{ fontWeight: 400, color: 'rgba(240,240,240,0.55)', marginLeft: '8px', fontSize: '0.875rem' }}>
                      R${(pedido.total_cents / 100).toFixed(2)}
                    </span>
                  </p>
                  {pedido.endereco_entrega && (
                    <p style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.45)', margin: 0 }}>{pedido.endereco_entrega}</p>
                  )}
                </div>
                {NEXT_STATUS[pedido.status] && (
                  <button
                    onClick={() => updatePedido({ id: pedido.id, status: NEXT_STATUS[pedido.status] })}
                    className="btn"
                    style={{ background: 'linear-gradient(135deg, #2D6A4F, #1F4E38)', color: '#F0F0F0', fontSize: '0.8125rem', padding: '7px 14px', flexShrink: 0 }}
                  >
                    {NEXT_LABEL[pedido.status]}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pdvOpen && <PDVModal onClose={() => { setPdvOpen(false); qc.invalidateQueries(); }} />}
    </Layout>
  );
}
