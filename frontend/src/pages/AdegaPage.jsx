import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import api from '../services/api';
import PDVModal from '../components/PDVModal';

const PEDIDO_STATUS = {
  aguardando: { label: 'Aguardando', color: 'bg-gray-100 text-gray-700' },
  preparando: { label: 'Preparando', color: 'bg-yellow-100 text-yellow-700' },
  em_rota: { label: 'Em Rota', color: 'bg-blue-100 text-blue-700' },
  entregue: { label: 'Entregue', color: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

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

  const statusOrder = ['aguardando', 'preparando', 'em_rota'];
  const pedidosAtivos = pedidos?.filter((p) => statusOrder.includes(p.status)) || [];

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🍷 Adega R1</h1>
          <p className="text-gray-500 mt-1">Vendas e entregas</p>
        </div>
        <button onClick={() => setPdvOpen(true)} className="btn-primary text-base px-6 py-3">
          💳 Abrir PDV
        </button>
      </div>

      {alertas && alertas.length > 0 && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ Alertas de Estoque ({alertas.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {alertas.map((p) => (
                <div key={p.id} className="bg-white border border-red-100 rounded-lg px-3 py-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.nome}</p>
                  <p className="text-xs text-red-600">
                    Estoque: {p.estoque_atual} (mín: {p.estoque_minimo})
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Pedidos Ativos ({pedidosAtivos.length})
      </h2>
      {pedidosAtivos.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">
          Nenhum pedido ativo no momento.
        </div>
      ) : (
        <div className="space-y-3">
          {pedidosAtivos.map((pedido) => {
            const st = PEDIDO_STATUS[pedido.status] || PEDIDO_STATUS.aguardando;
            const nextStatus = { aguardando: 'preparando', preparando: 'em_rota', em_rota: 'entregue' };
            const nextLabel = { aguardando: 'Iniciar Preparo', preparando: 'Saiu para Entrega', em_rota: 'Marcar Entregue' };

            return (
              <div key={pedido.id} className="card flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${pedido.tipo === 'delivery' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {pedido.tipo === 'delivery' ? '🛵 Delivery' : '🏪 Balcão'}
                    </span>
                    <span className={`badge ${st.color}`}>{st.label}</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {pedido.cliente?.name || 'Cliente avulso'} — R${(pedido.total_cents / 100).toFixed(2)}
                  </p>
                  {pedido.endereco_entrega && (
                    <p className="text-sm text-gray-500">{pedido.endereco_entrega}</p>
                  )}
                </div>
                {nextStatus[pedido.status] && (
                  <button
                    onClick={() => updatePedido({ id: pedido.id, status: nextStatus[pedido.status] })}
                    className="btn-primary text-sm py-1.5"
                  >
                    {nextLabel[pedido.status]}
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
