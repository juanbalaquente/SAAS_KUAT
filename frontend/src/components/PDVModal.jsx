import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';

const PAGAMENTOS = ['Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'PIX'];

export default function PDVModal({ onClose }) {
  const [search,    setSearch]    = useState('');
  const [cart,      setCart]      = useState([]);
  const [pagamento, setPagamento] = useState('PIX');
  const [tipo,      setTipo]      = useState('balcao');
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

  const addToCart = (produto) => {
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

  const handleFinalizar = () => {
    finalizar({
      tipo,
      pagamento,
      itens: cart.map((i) => ({ produto_id: i.id, quantidade: i.qty, preco_unitario_cents: i.preco_cents })),
    });
  };

  const qtyBtnStyle = {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(240,240,240,0.75)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{
        background: '#161B22',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#F0F0F0', margin: 0, letterSpacing: '-0.01em' }}>
            PDV — Adega R1
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(240,240,240,0.4)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px',
              transition: 'color 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.8)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.4)'; }}
          >
            ×
          </button>
        </div>

        {success ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
            }}>
              ✓
            </div>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#4ADE80' }}>Venda finalizada!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left: product catalog */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto ou código de barras..."
                className="input"
                style={{ marginBottom: '16px' }}
                autoFocus
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {filtered.slice(0, 20).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(45,106,79,0.5)';
                      e.currentTarget.style.background = 'rgba(45,106,79,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    }}
                  >
                    <p style={{ fontWeight: 500, color: '#F0F0F0', fontSize: '0.875rem', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.nome}
                    </p>
                    <p style={{ fontWeight: 700, color: '#4ADE80', fontSize: '0.875rem', margin: '0 0 3px' }}>
                      R${(p.preco_cents / 100).toFixed(2)}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.35)', margin: 0 }}>
                      Estoque: {p.estoque_atual}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: cart + checkout */}
            <div style={{ width: '300px', padding: '20px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(240,240,240,0.5)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Carrinho
              </p>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {cart.length === 0 ? (
                  <p style={{ color: 'rgba(240,240,240,0.3)', fontSize: '0.875rem', textAlign: 'center', marginTop: '32px' }}>
                    Nenhum item adicionado
                  </p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#F0F0F0', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.nome}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.4)', margin: 0 }}>
                          R${(item.preco_cents / 100).toFixed(2)} un
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button style={qtyBtnStyle} onClick={() => setQty(item.id, item.qty - 1)}>−</button>
                        <span style={{ width: '28px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#F0F0F0' }}>{item.qty}</span>
                        <button style={qtyBtnStyle} onClick={() => setQty(item.id, item.qty + 1)}>+</button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'none', border: 'none', color: 'rgba(240,240,240,0.3)', cursor: 'pointer', fontSize: '1.125rem', lineHeight: 1, padding: '2px', transition: 'color 0.15s', fontFamily: 'inherit' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#F87171'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.3)'; }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600, color: 'rgba(240,240,240,0.7)', fontSize: '0.9375rem' }}>Total</span>
                  <span style={{ fontWeight: 800, color: '#4ADE80', fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                    R${(total / 100).toFixed(2)}
                  </span>
                </div>

                {/* Tipo */}
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(240,240,240,0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Tipo
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {['balcao', 'delivery'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTipo(t)}
                        style={{
                          padding: '7px',
                          borderRadius: '7px',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          border: tipo === t ? '1px solid rgba(45,106,79,0.5)' : '1px solid rgba(255,255,255,0.08)',
                          background: tipo === t ? 'rgba(45,106,79,0.2)' : 'rgba(255,255,255,0.04)',
                          color: tipo === t ? '#4ADE80' : 'rgba(240,240,240,0.55)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                      >
                        {t === 'balcao' ? 'Balcão' : 'Delivery'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pagamento */}
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(240,240,240,0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Pagamento
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {PAGAMENTOS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPagamento(p)}
                        style={{
                          padding: '7px 4px',
                          borderRadius: '7px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          border: pagamento === p ? '1px solid rgba(45,106,79,0.5)' : '1px solid rgba(255,255,255,0.08)',
                          background: pagamento === p ? 'rgba(45,106,79,0.2)' : 'rgba(255,255,255,0.04)',
                          color: pagamento === p ? '#4ADE80' : 'rgba(240,240,240,0.55)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleFinalizar}
                  disabled={cart.length === 0 || isPending}
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #2D6A4F, #1F4E38)',
                    color: '#F0F0F0',
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12px',
                    fontSize: '0.9375rem',
                    opacity: cart.length === 0 ? 0.45 : 1,
                    cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
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
