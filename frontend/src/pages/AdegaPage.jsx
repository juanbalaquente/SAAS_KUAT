import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import api from '../services/api';
import PDVModal from '../components/PDVModal';

/* ─── constants ─── */
const TABS = [
  { id: 'caixa',   label: 'Caixa' },
  { id: 'estoque', label: 'Estoque' },
  { id: 'pedidos', label: 'Pedidos' },
];

const PEDIDO_STATUS = {
  aguardando: { label: 'Aguardando', bg: 'rgba(255,255,255,0.08)',  color: 'rgba(240,240,240,0.6)' },
  preparando: { label: 'Preparando', bg: 'rgba(245,158,11,0.15)',   color: '#FCD34D' },
  em_rota:    { label: 'Em Rota',    bg: 'rgba(59,130,246,0.15)',   color: '#93C5FD' },
  entregue:   { label: 'Entregue',   bg: 'rgba(34,197,94,0.15)',    color: '#4ADE80' },
  cancelado:  { label: 'Cancelado',  bg: 'rgba(239,68,68,0.15)',    color: '#F87171' },
};
const NEXT_STATUS = { aguardando: 'preparando', preparando: 'em_rota', em_rota: 'entregue' };
const NEXT_LABEL  = { aguardando: 'Iniciar Preparo', preparando: 'Saiu para Entrega', em_rota: 'Marcar Entregue' };

const MOV_STYLE = {
  entrada: { label: 'Entrada', bg: 'rgba(34,197,94,0.12)',  color: '#4ADE80',  sign: '+' },
  saida:   { label: 'Saída',   bg: 'rgba(239,68,68,0.12)',  color: '#F87171',  sign: '−' },
  ajuste:  { label: 'Ajuste',  bg: 'rgba(59,130,246,0.12)', color: '#93C5FD',  sign: '=' },
};

/* ─── StockModal ─── */
function StockModal({ produto, onClose, onSuccess }) {
  const [tipo,       setTipo]       = useState('entrada');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (payload) => api.post('/adega/movimentacao', payload),
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quantidade || Number(quantidade) < 1) return;
    mutate({ produto_id: produto.id, tipo, quantidade: Number(quantidade), observacao: observacao || undefined });
  };

  const tipoLabels = { entrada: 'Entrada de estoque', saida: 'Saída de estoque', ajuste: 'Ajuste de inventário' };
  const tipoDescs  = { entrada: 'Adicionar unidades', saida: 'Remover unidades', ajuste: 'Definir quantidade exata' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(240,240,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>Movimentação</p>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#F0F0F0', margin: 0, maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {produto.nome}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(240,240,240,0.4)', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1, padding: '4px', fontFamily: 'inherit' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Tipo */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(240,240,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Tipo</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {['entrada', 'saida', 'ajuste'].map((t) => {
                const s = MOV_STYLE[t];
                const active = tipo === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '8px',
                      border: active ? `1px solid ${s.color}40` : '1px solid rgba(255,255,255,0.08)',
                      background: active ? s.bg : 'rgba(255,255,255,0.03)',
                      color: active ? s.color : 'rgba(240,240,240,0.5)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      transition: 'all 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>{s.sign}</span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.4)', margin: '6px 0 0' }}>{tipoDescs[tipo]}</p>
          </div>

          {/* Quantidade */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(240,240,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              {tipo === 'ajuste' ? 'Nova quantidade' : 'Quantidade'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="0"
                className="input"
                style={{ width: '100%', paddingRight: '56px' }}
                autoFocus
                required
              />
              <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8125rem', color: 'rgba(240,240,240,0.35)' }}>
                un
              </span>
            </div>
            {tipo !== 'ajuste' && (
              <p style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.35)', margin: '4px 0 0' }}>
                Estoque atual: {produto.estoque_atual} un
              </p>
            )}
          </div>

          {/* Observação */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(240,240,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Observação <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
            </label>
            <input
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder={tipoLabels[tipo]}
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          {isError && (
            <p style={{ fontSize: '0.8125rem', color: '#F87171', marginBottom: '12px' }}>Erro ao registrar movimentação.</p>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.05)', color: 'rgba(240,240,240,0.6)' }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !quantidade}
              className="btn"
              style={{ flex: 2, justifyContent: 'center', background: 'linear-gradient(135deg, #2D6A4F, #1F4E38)', color: '#F0F0F0', opacity: !quantidade ? 0.45 : 1 }}
            >
              {isPending ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Tab: Caixa ─── */
function TabCaixa({ onOpenPDV }) {
  const { data: vendas, isLoading } = useQuery({
    queryKey: ['adega-vendas-hoje'],
    queryFn: () => api.get('/adega/vendas-hoje').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: alertas } = useQuery({
    queryKey: ['adega-alertas'],
    queryFn: () => api.get('/adega/alertas').then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const stats = [
    {
      label: 'Total vendido hoje',
      value: vendas ? `R$${(vendas.total_cents / 100).toFixed(2)}` : '—',
      color: '#4ADE80',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
    },
    {
      label: 'Pedidos hoje',
      value: vendas ? String(vendas.count) : '—',
      color: '#60A5FA',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      ),
    },
    {
      label: 'Alertas de estoque',
      value: alertas ? String(alertas.length) : '—',
      color: alertas?.length > 0 ? '#F87171' : '#4ADE80',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* PDV button */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(45,106,79,0.15), rgba(31,78,56,0.1))',
        border: '1px solid rgba(45,106,79,0.3)',
        borderRadius: '14px',
        padding: '28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Ponto de Venda
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.5)', margin: 0 }}>
            Registre vendas balcão e delivery
          </p>
        </div>
        <button
          onClick={onOpenPDV}
          className="btn"
          style={{ background: 'linear-gradient(135deg, #2D6A4F, #1F4E38)', color: '#F0F0F0', padding: '12px 28px', fontSize: '0.9375rem', fontWeight: 600, flexShrink: 0 }}
        >
          Abrir PDV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(240,240,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {s.label}
              </span>
              <span style={{ color: s.color, opacity: 0.7 }}>{s.icon}</span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, margin: 0, letterSpacing: '-0.03em' }}>
              {isLoading ? <span style={{ opacity: 0.3 }}>—</span> : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent sales */}
      <p className="section-label" style={{ marginBottom: '12px' }}>Vendas de hoje</p>
      {isLoading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'rgba(240,240,240,0.3)' }}>Carregando...</div>
      ) : !vendas?.pedidos?.length ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'rgba(240,240,240,0.3)' }}>
          Nenhuma venda registrada hoje.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {vendas.pedidos.slice(0, 20).map((pedido) => {
            const isDelivery = pedido.tipo === 'delivery';
            const hora = new Date(pedido.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const pagamento = pedido.forma_pagamento || '—';
            return (
              <div key={pedido.id} style={{
                background: '#161B22',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.35)', fontFamily: 'monospace', minWidth: '38px' }}>{hora}</span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: isDelivery ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.06)',
                  color: isDelivery ? '#C084FC' : 'rgba(240,240,240,0.5)',
                  flexShrink: 0,
                }}>
                  {isDelivery ? 'Delivery' : 'Balcão'}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.5)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pedido.itens?.map((i) => `${i.quantidade}× ${i.produto?.nome}`).join(', ')}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.35)', flexShrink: 0 }}>{pagamento}</span>
                <span style={{ fontWeight: 700, color: '#4ADE80', fontSize: '0.9375rem', flexShrink: 0 }}>
                  R${(pedido.total_cents / 100).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Tab: Estoque ─── */
function TabEstoque() {
  const qc = useQueryClient();
  const [stockModal, setStockModal] = useState(null); // produto object
  const [showHistory, setShowHistory] = useState(false);
  const [search, setSearch] = useState('');

  const { data: produtos, isLoading } = useQuery({
    queryKey: ['adega-estoque'],
    queryFn: () => api.get('/adega/estoque').then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const { data: movimentacoes } = useQuery({
    queryKey: ['adega-movimentacoes'],
    queryFn: () => api.get('/adega/movimentacoes').then((r) => r.data.data),
    enabled: showHistory,
  });

  const alertas = produtos?.filter((p) => p.estoque_atual <= p.estoque_minimo) || [];

  const filtered = produtos?.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getStockStatus = (p) => {
    if (p.estoque_atual === 0)              return { label: 'Esgotado',  bg: 'rgba(239,68,68,0.15)',  color: '#F87171' };
    if (p.estoque_atual <= p.estoque_minimo) return { label: 'Crítico',   bg: 'rgba(245,158,11,0.15)', color: '#FCD34D' };
    return { label: 'Normal', bg: 'rgba(34,197,94,0.1)', color: '#4ADE80' };
  };

  return (
    <div>
      {/* Alert banner */}
      {alertas.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F87171', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {alertas.length} produto{alertas.length !== 1 ? 's' : ''} com estoque crítico
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {alertas.map((p) => (
              <span key={p.id} style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '5px', background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                {p.nome} ({p.estoque_atual}/{p.estoque_minimo})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto ou categoria..."
          className="input"
          style={{ flex: 1 }}
        />
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="btn"
          style={{ background: showHistory ? 'rgba(45,106,79,0.2)' : 'rgba(255,255,255,0.05)', color: showHistory ? '#4ADE80' : 'rgba(240,240,240,0.6)', border: `1px solid ${showHistory ? 'rgba(45,106,79,0.4)' : 'rgba(255,255,255,0.1)'}`, flexShrink: 0 }}
        >
          Histórico
        </button>
      </div>

      {/* Product table */}
      {isLoading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'rgba(240,240,240,0.3)' }}>Carregando...</div>
      ) : (
        <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 90px 80px 80px 90px 110px', gap: '0', padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Produto', 'Categoria', 'Preço', 'Estoque', 'Mínimo', 'Status', ''].map((h) => (
              <span key={h} style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(240,240,240,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
            ))}
          </div>
          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(240,240,240,0.3)', fontSize: '0.875rem' }}>
              Nenhum produto encontrado.
            </div>
          ) : (
            filtered.map((p, i) => {
              const st = getStockStatus(p);
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 110px 90px 80px 80px 90px 110px',
                    padding: '13px 18px',
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    alignItems: 'center',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#F0F0F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '12px' }}>
                    {p.nome}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.45)' }}>{p.categoria || '—'}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4ADE80' }}>R${(p.preco_cents / 100).toFixed(2)}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: p.estoque_atual <= p.estoque_minimo ? '#FCD34D' : '#F0F0F0' }}>
                    {p.estoque_atual}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.4)' }}>{p.estoque_minimo}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '5px', background: st.bg, color: st.color, display: 'inline-block' }}>
                    {st.label}
                  </span>
                  <button
                    onClick={() => setStockModal(p)}
                    className="btn"
                    style={{ fontSize: '0.75rem', padding: '5px 12px', background: 'rgba(45,106,79,0.15)', color: '#4ADE80', border: '1px solid rgba(45,106,79,0.3)' }}
                  >
                    Movimentar
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Movement history */}
      {showHistory && (
        <div>
          <p className="section-label" style={{ marginBottom: '12px' }}>Histórico de movimentações</p>
          {!movimentacoes ? (
            <div style={{ color: 'rgba(240,240,240,0.3)', fontSize: '0.875rem', textAlign: 'center', padding: '24px' }}>Carregando...</div>
          ) : movimentacoes.length === 0 ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'rgba(240,240,240,0.3)' }}>Nenhuma movimentação registrada.</div>
          ) : (
            <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
              {movimentacoes.map((m, i) => {
                const ms = MOV_STYLE[m.tipo];
                const dt = new Date(m.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', borderBottom: i < movimentacoes.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: ms.bg, color: ms.color, minWidth: '54px', textAlign: 'center' }}>
                      {ms.sign} {ms.label}
                    </span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#F0F0F0', flex: 1 }}>{m.produto?.nome || '—'}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: ms.color }}>
                      {m.tipo === 'ajuste' ? `= ${m.quantidade}` : `${ms.sign} ${m.quantidade}`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.35)', minWidth: '100px', textAlign: 'right' }}>{dt}</span>
                    {m.observacao && (
                      <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }} title={m.observacao}>
                        {m.observacao}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {stockModal && (
        <StockModal
          produto={stockModal}
          onClose={() => setStockModal(null)}
          onSuccess={() => {
            setStockModal(null);
            qc.invalidateQueries({ queryKey: ['adega-estoque'] });
            qc.invalidateQueries({ queryKey: ['adega-alertas'] });
            qc.invalidateQueries({ queryKey: ['adega-movimentacoes'] });
          }}
        />
      )}
    </div>
  );
}

/* ─── Tab: Pedidos ─── */
function TabPedidos() {
  const qc = useQueryClient();
  const [showAll, setShowAll] = useState(false);

  const { data: pedidos, isLoading } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => api.get('/pedidos').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { mutate: updatePedido } = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/pedidos/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos'] }),
  });

  const ativos     = pedidos?.filter((p) => ['aguardando', 'preparando', 'em_rota'].includes(p.status)) || [];
  const concluidos = pedidos?.filter((p) => ['entregue', 'cancelado'].includes(p.status)) || [];

  const PedidoCard = ({ pedido }) => {
    const st = PEDIDO_STATUS[pedido.status] || PEDIDO_STATUS.aguardando;
    const isDelivery = pedido.tipo === 'delivery';
    const hora = new Date(pedido.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: isDelivery ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.07)', color: isDelivery ? '#C084FC' : 'rgba(240,240,240,0.55)' }}>
              {isDelivery ? 'Delivery' : 'Balcão'}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: st.bg, color: st.color }}>
              {st.label}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.3)', marginLeft: 'auto' }}>{hora}</span>
          </div>
          <p style={{ fontWeight: 600, color: '#F0F0F0', margin: '0 0 2px', fontSize: '0.9375rem' }}>
            {pedido.cliente?.name || 'Cliente avulso'}
            <span style={{ fontWeight: 400, color: '#4ADE80', marginLeft: '8px', fontSize: '0.875rem' }}>
              R${(pedido.total_cents / 100).toFixed(2)}
            </span>
          </p>
          {pedido.endereco_entrega && (
            <p style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.4)', margin: 0 }}>{pedido.endereco_entrega}</p>
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
  };

  if (isLoading) return <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'rgba(240,240,240,0.3)' }}>Carregando...</div>;

  return (
    <div>
      <p className="section-label" style={{ marginBottom: '12px' }}>Pedidos ativos ({ativos.length})</p>
      {ativos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'rgba(240,240,240,0.4)', padding: '40px 24px', marginBottom: '24px' }}>
          Nenhum pedido ativo.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
          {ativos.map((p) => <PedidoCard key={p.id} pedido={p} />)}
        </div>
      )}

      {concluidos.length > 0 && (
        <>
          <button
            onClick={() => setShowAll((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,240,240,0.4)', fontSize: '0.8125rem', padding: '0 0 12px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              {showAll ? '▲' : '▼'} Histórico ({concluidos.length})
            </span>
          </button>
          {showAll && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {concluidos.slice(0, 30).map((p) => <PedidoCard key={p.id} pedido={p} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Main component ─── */
export default function AdegaPage() {
  const [tab,     setTab]     = useState('caixa');
  const [pdvOpen, setPdvOpen] = useState(false);
  const qc = useQueryClient();

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Adega R1
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.45)', margin: '0 0 20px' }}>
          Gestão de caixa, estoque e entregas
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '7px 18px',
                borderRadius: '7px',
                border: 'none',
                background: tab === t.id ? '#1C2330' : 'transparent',
                color: tab === t.id ? '#F0F0F0' : 'rgba(240,240,240,0.45)',
                fontWeight: tab === t.id ? 600 : 400,
                fontSize: '0.875rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
                boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'caixa'   && <TabCaixa onOpenPDV={() => setPdvOpen(true)} />}
      {tab === 'estoque' && <TabEstoque />}
      {tab === 'pedidos' && <TabPedidos />}

      {pdvOpen && (
        <PDVModal
          onClose={() => {
            setPdvOpen(false);
            qc.invalidateQueries({ queryKey: ['adega-vendas-hoje'] });
            qc.invalidateQueries({ queryKey: ['adega-estoque'] });
            qc.invalidateQueries({ queryKey: ['adega-alertas'] });
          }}
        />
      )}
    </Layout>
  );
}
