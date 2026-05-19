import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';

const PAGAMENTOS = ['PIX', 'Dinheiro', 'Cartão Débito', 'Cartão Crédito'];

const STATUS_AG = {
  pendente:       { label: 'Pendente',    color: 'rgba(240,240,240,0.5)',  bg: 'rgba(255,255,255,0.07)' },
  confirmado:     { label: 'Confirmado',  color: '#60A5FA',                bg: 'rgba(59,130,246,0.12)' },
  em_atendimento: { label: 'Em atend.',   color: '#FCD34D',                bg: 'rgba(245,158,11,0.12)' },
  concluido:      { label: 'Concluído',   color: '#4ADE80',                bg: 'rgba(34,197,94,0.12)' },
  cancelado:      { label: 'Cancelado',   color: '#F87171',                bg: 'rgba(239,68,68,0.12)' },
};

const LOJA_COLOR = {
  barbearia_kuat: '#C4622D',
  lava_kuat:      '#2E6B8A',
  adega_r1:       '#2D6A4F',
};

export default function PDVModal({ onClose }) {
  const [search,    setSearch]    = useState('');
  const [cart,      setCart]      = useState([]);
  const [pagamento, setPagamento] = useState('PIX');
  const [tipo,      setTipo]      = useState('balcao');
  const [endereco,  setEndereco]  = useState('');
  const [troco,     setTroco]     = useState('');
  const [cliente,   setCliente]   = useState({ nome: '', telefone: '' });
  const [success,   setSuccess]   = useState(false);

  const { data: produtos } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => api.get('/adega/estoque').then((r) => r.data.data),
  });

  const { mutate: finalizar, isPending } = useMutation({
    mutationFn: (payload) => api.post('/adega/pdv', payload),
    onSuccess: () => { setSuccess(true); setTimeout(onClose, 2000); },
  });

  const filtered = produtos?.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.codigo_barras || '').includes(search)
  ) || [];

  const cartMap = Object.fromEntries(cart.map((i) => [i.id, i.qty]));

  const addToCart = (produto) => {
    if (produto.estoque_atual === 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === produto.id);
      if (existing) return prev.map((i) => i.id === produto.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...produto, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const setQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  };

  const total = cart.reduce((sum, i) => sum + i.preco_cents * i.qty, 0);
  const trocoVal = pagamento === 'Dinheiro' && troco ? (parseFloat(troco) * 100 - total) : null;

  const handleFinalizar = () => {
    finalizar({
      tipo,
      pagamento,
      endereco_entrega: tipo === 'delivery' ? endereco : undefined,
      cliente: cliente.nome ? cliente : undefined,
      itens: cart.map((i) => ({ produto_id: i.id, quantidade: i.qty, preco_unitario_cents: i.preco_cents })),
    });
  };

  const qtyBtnStyle = {
    width: '26px', height: '26px', borderRadius: '5px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(240,240,240,0.75)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.9375rem', fontFamily: 'inherit', transition: 'background 0.15s',
  };

  const labelStyle = {
    fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(240,240,240,0.4)',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{
        background: '#161B22', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        width: '100%', maxWidth: '960px', maxHeight: '92vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#F0F0F0', margin: 0, letterSpacing: '-0.01em' }}>
            PDV — Adega R1
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(240,240,240,0.4)', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1, padding: '4px', transition: 'color 0.15s', fontFamily: 'inherit' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.8)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.4)'; }}>×</button>
        </div>

        {success ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>✓</div>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#4ADE80' }}>Venda finalizada!</p>
            {trocoVal !== null && trocoVal >= 0 && (
              <p style={{ fontSize: '0.9375rem', color: 'rgba(240,240,240,0.6)' }}>
                Troco: <strong style={{ color: '#FCD34D' }}>R${(trocoVal / 100).toFixed(2)}</strong>
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left: catalog */}
            <div style={{ flex: 1, padding: '18px', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto ou código de barras..."
                className="input"
                style={{ marginBottom: '14px' }}
                autoFocus
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '7px' }}>
                {filtered.slice(0, 20).map((p) => {
                  const inCart = cartMap[p.id] || 0;
                  const esgotado = p.estoque_atual === 0;
                  const baixo = !esgotado && p.estoque_atual <= p.estoque_minimo;
                  return (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      disabled={esgotado}
                      style={{
                        position: 'relative', textAlign: 'left', padding: '11px 13px',
                        background: esgotado ? 'rgba(255,255,255,0.02)' : inCart > 0 ? 'rgba(45,106,79,0.1)' : 'rgba(255,255,255,0.04)',
                        border: esgotado ? '1px solid rgba(255,255,255,0.04)' : inCart > 0 ? '1px solid rgba(45,106,79,0.4)' : '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '10px', cursor: esgotado ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s', fontFamily: 'inherit', opacity: esgotado ? 0.45 : 1,
                      }}
                      onMouseEnter={(e) => { if (!esgotado) { e.currentTarget.style.border = '1px solid rgba(45,106,79,0.5)'; e.currentTarget.style.background = inCart > 0 ? 'rgba(45,106,79,0.18)' : 'rgba(45,106,79,0.1)'; } }}
                      onMouseLeave={(e) => { if (!esgotado) { e.currentTarget.style.border = inCart > 0 ? '1px solid rgba(45,106,79,0.4)' : '1px solid rgba(255,255,255,0.07)'; e.currentTarget.style.background = inCart > 0 ? 'rgba(45,106,79,0.1)' : 'rgba(255,255,255,0.04)'; } }}
                    >
                      {/* Badge de qtd no carrinho */}
                      {inCart > 0 && (
                        <span style={{
                          position: 'absolute', top: '8px', right: '8px',
                          background: '#2D6A4F', color: '#fff', fontSize: '0.6875rem',
                          fontWeight: 700, borderRadius: '999px', minWidth: '18px', height: '18px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                        }}>{inCart}</span>
                      )}
                      <p style={{ fontWeight: 500, color: esgotado ? 'rgba(240,240,240,0.4)' : '#F0F0F0', fontSize: '0.875rem', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: inCart > 0 ? '24px' : '0' }}>
                        {p.nome}
                      </p>
                      <p style={{ fontWeight: 700, color: esgotado ? 'rgba(240,240,240,0.3)' : '#4ADE80', fontSize: '0.875rem', margin: '0 0 3px' }}>
                        R${(p.preco_cents / 100).toFixed(2)}
                      </p>
                      <p style={{ fontSize: '0.6875rem', margin: 0, color: esgotado ? '#F87171' : baixo ? '#FCD34D' : 'rgba(240,240,240,0.3)' }}>
                        {esgotado ? 'Esgotado' : baixo ? `Estoque baixo: ${p.estoque_atual}` : `Estoque: ${p.estoque_atual}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: cart + checkout */}
            <div style={{ width: '310px', padding: '18px', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(240,240,240,0.4)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Carrinho {cart.length > 0 && <span style={{ color: '#4ADE80' }}>({cart.length})</span>}
              </p>

              {/* Cart items */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '14px', minHeight: '80px' }}>
                {cart.length === 0 ? (
                  <p style={{ color: 'rgba(240,240,240,0.25)', fontSize: '0.8125rem', textAlign: 'center', marginTop: '24px' }}>
                    Nenhum item
                  </p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#F0F0F0', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nome}</p>
                        <p style={{ fontSize: '0.6875rem', color: 'rgba(240,240,240,0.4)', margin: 0 }}>R${(item.preco_cents / 100).toFixed(2)} × {item.qty} = <strong style={{ color: '#4ADE80' }}>R${(item.preco_cents * item.qty / 100).toFixed(2)}</strong></p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                        <button style={qtyBtnStyle} onClick={() => setQty(item.id, item.qty - 1)}>−</button>
                        <span style={{ width: '24px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#F0F0F0' }}>{item.qty}</span>
                        <button style={qtyBtnStyle} onClick={() => setQty(item.id, item.qty + 1)}>+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'rgba(240,240,240,0.25)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '2px', transition: 'color 0.15s', fontFamily: 'inherit' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#F87171'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.25)'; }}>×</button>
                    </div>
                  ))
                )}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600, color: 'rgba(240,240,240,0.6)', fontSize: '0.875rem' }}>Total</span>
                  <span style={{ fontWeight: 800, color: '#4ADE80', fontSize: '1.375rem', letterSpacing: '-0.02em' }}>
                    R${(total / 100).toFixed(2)}
                  </span>
                </div>

                {/* Cliente (opcional) */}
                <div>
                  <p style={labelStyle}>Cliente <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></p>
                  <input value={cliente.nome} onChange={(e) => setCliente((c) => ({ ...c, nome: e.target.value }))}
                    placeholder="Nome do cliente" className="input" style={{ marginBottom: '6px' }} />
                  <input value={cliente.telefone} onChange={(e) => setCliente((c) => ({ ...c, telefone: e.target.value }))}
                    placeholder="Telefone" className="input" />
                </div>

                {/* Tipo */}
                <div>
                  <p style={labelStyle}>Tipo</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                    {['balcao', 'delivery'].map((t) => (
                      <button key={t} onClick={() => setTipo(t)} style={{
                        padding: '7px', borderRadius: '7px', fontSize: '0.8125rem', fontWeight: 500,
                        border: tipo === t ? '1px solid rgba(45,106,79,0.5)' : '1px solid rgba(255,255,255,0.08)',
                        background: tipo === t ? 'rgba(45,106,79,0.2)' : 'rgba(255,255,255,0.04)',
                        color: tipo === t ? '#4ADE80' : 'rgba(240,240,240,0.55)',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      }}>
                        {t === 'balcao' ? 'Balcão' : 'Delivery'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Endereço (delivery) */}
                {tipo === 'delivery' && (
                  <div>
                    <p style={labelStyle}>Endereço de entrega</p>
                    <input value={endereco} onChange={(e) => setEndereco(e.target.value)}
                      placeholder="Rua, número, bairro..." className="input" />
                  </div>
                )}

                {/* Pagamento */}
                <div>
                  <p style={labelStyle}>Pagamento</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                    {PAGAMENTOS.map((p) => (
                      <button key={p} onClick={() => setPagamento(p)} style={{
                        padding: '7px 4px', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 500,
                        border: pagamento === p ? '1px solid rgba(45,106,79,0.5)' : '1px solid rgba(255,255,255,0.08)',
                        background: pagamento === p ? 'rgba(45,106,79,0.2)' : 'rgba(255,255,255,0.04)',
                        color: pagamento === p ? '#4ADE80' : 'rgba(240,240,240,0.55)',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                      }}>{p}</button>
                    ))}
                  </div>
                </div>

                {/* Troco (dinheiro) */}
                {pagamento === 'Dinheiro' && (
                  <div>
                    <p style={labelStyle}>Pagou com</p>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8125rem', color: 'rgba(240,240,240,0.4)' }}>R$</span>
                      <input type="number" value={troco} onChange={(e) => setTroco(e.target.value)}
                        placeholder="0,00" className="input" style={{ paddingLeft: '32px' }} step="0.01" min="0" />
                    </div>
                    {trocoVal !== null && (
                      <p style={{ fontSize: '0.8125rem', marginTop: '5px', color: trocoVal >= 0 ? '#4ADE80' : '#F87171', fontWeight: 600 }}>
                        {trocoVal >= 0 ? `Troco: R$${(trocoVal / 100).toFixed(2)}` : 'Valor insuficiente'}
                      </p>
                    )}
                  </div>
                )}

                <button onClick={handleFinalizar}
                  disabled={cart.length === 0 || isPending || (tipo === 'delivery' && !endereco) || (pagamento === 'Dinheiro' && trocoVal !== null && trocoVal < 0)}
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #2D6A4F, #1F4E38)', color: '#F0F0F0',
                    width: '100%', justifyContent: 'center', padding: '12px',
                    fontSize: '0.9375rem',
                    opacity: cart.length === 0 ? 0.45 : 1,
                    cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  }}>
                  {isPending ? 'Processando...' : 'Finalizar Venda'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
