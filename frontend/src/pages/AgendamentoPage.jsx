import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

const ScissorsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
);
const CarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
  </svg>
);
const WineIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/>
    <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5z"/>
  </svg>
);

const LOJA_CONFIG = {
  barbearia_kuat: { name: 'Barbearia Kuat', Icon: ScissorsIcon, color: '#C4622D', colorDark: '#9C4A1F' },
  lava_kuat:      { name: 'Lava Kuat',      Icon: CarIcon,      color: '#2E6B8A', colorDark: '#1F4E6B' },
  adega_r1:       { name: 'Adega R1',       Icon: WineIcon,     color: '#2D6A4F', colorDark: '#1F4E38' },
};

const clienteSchema = z.object({
  name:  z.string().min(2, 'Nome obrigatório'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

// Steps para lojas normais (barbearia, lava jato)
const STEPS_DEFAULT = ['Serviço', 'Profissional', 'Data/Hora', 'Seus dados'];
// Steps para adega
const STEPS_ADEGA = ['Entrega', 'Produtos', 'Data/Hora', 'Seus dados'];

export default function AgendamentoPage() {
  const { loja } = useParams();
  const navigate  = useNavigate();
  const config    = LOJA_CONFIG[loja] || { name: loja, Icon: () => null, color: '#555', colorDark: '#333' };
  const Icon      = config.Icon;
  const isAdega   = loja === 'adega_r1';
  const STEPS     = isAdega ? STEPS_ADEGA : STEPS_DEFAULT;

  const [step,                 setStep]                 = useState(0);
  const [selectedServico,      setSelectedServico]      = useState(null);
  const [selectedProfissional, setSelectedProfissional] = useState(null);
  const [selectedDate,         setSelectedDate]         = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot,         setSelectedSlot]         = useState(null);
  // Adega only
  const [cart,                 setCart]                 = useState([]); // [{...produto, qty}]
  const [endereco,             setEndereco]             = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(clienteSchema) });

  const { data: servicos } = useQuery({
    queryKey: ['servicos', loja],
    queryFn: () => api.get(`/lojas/${loja}/servicos`).then((r) => r.data.data),
  });

  const { data: produtos } = useQuery({
    queryKey: ['produtos-publico', loja],
    queryFn: () => api.get(`/lojas/${loja}/produtos`).then((r) => r.data.data),
    enabled: isAdega,
  });

  const { data: disponibilidade } = useQuery({
    queryKey: ['disponibilidade', loja, selectedServico?.id, selectedDate, selectedProfissional?.id],
    queryFn: () => api.get(`/lojas/${loja}/disponibilidade`, {
      params: { servico_id: selectedServico?.id, data: selectedDate, profissional_id: selectedProfissional?.id || undefined },
    }).then((r) => r.data.data),
    enabled: !!selectedServico && step >= (isAdega ? 2 : 2),
  });

  const [erroAgendar, setErroAgendar] = useState('');

  const { mutate: agendar, isPending } = useMutation({
    mutationFn: (payload) => api.post(`/lojas/${loja}/agendar`, payload),
    onSuccess: (res) => navigate(`/confirmacao/${res.data.data.id}`),
    onError: (e) => setErroAgendar(e.response?.data?.message || 'Erro ao agendar. Tente novamente.'),
  });

  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  const cartTotal = cart.reduce((s, i) => s + i.preco_cents * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const isDelivery = selectedServico?.name?.toLowerCase().includes('delivery');

  const addToCart = (produto) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === produto.id);
      if (ex) return prev.map((i) => i.id === produto.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...produto, qty: 1 }];
    });
  };
  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const setQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  };

  const buildNotas = () => {
    if (!isAdega || cart.length === 0) return undefined;
    const lines = cart.map((i) => `${i.qty}x ${i.nome} (R$${(i.preco_cents / 100).toFixed(2)})`);
    const subtotal = `Subtotal produtos: R$${(cartTotal / 100).toFixed(2)}`;
    const end = isDelivery && endereco ? `Endereço: ${endereco}` : '';
    return [lines.join('\n'), subtotal, end].filter(Boolean).join('\n');
  };

  const handleClienteSubmit = (clienteData) => {
    agendar({
      servico_id:      selectedServico.id,
      profissional_id: selectedProfissional?.id || null,
      scheduled_at:    `${selectedDate} ${selectedSlot}`,
      cliente:         clienteData,
      notas:           buildNotas(),
    });
  };

  // ─── color helpers ───
  const rgb = config.color === '#C4622D' ? '196,98,45' : config.color === '#2E6B8A' ? '46,107,138' : '45,106,79';
  const colorBg   = `rgba(${rgb},0.12)`;
  const colorBord = `rgba(${rgb},0.35)`;

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: '#F0F0F0', fontFamily: 'inherit',
    fontSize: '0.9375rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(240,240,240,0.65)', marginBottom: '6px' };

  const servicoBtn = (s, onClick) => (
    <button key={s.id} onClick={onClick} style={{
      background: selectedServico?.id === s.id ? colorBg : '#161B22',
      border: selectedServico?.id === s.id ? `1px solid ${config.color}` : '1px solid rgba(255,255,255,0.07)',
      borderLeft: selectedServico?.id === s.id ? `4px solid ${config.color}` : '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px', padding: '16px 18px', cursor: 'pointer', textAlign: 'left',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s', width: '100%',
    }}
      onMouseEnter={(e) => { if (selectedServico?.id !== s.id) { e.currentTarget.style.borderLeftWidth = '4px'; e.currentTarget.style.borderLeftColor = config.color; e.currentTarget.style.background = `rgba(${rgb},0.07)`; } }}
      onMouseLeave={(e) => { if (selectedServico?.id !== s.id) { e.currentTarget.style.borderLeftWidth = '1px'; e.currentTarget.style.borderLeftColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#161B22'; } }}>
      <div>
        <p style={{ fontWeight: 600, color: '#F0F0F0', margin: '0 0 3px', fontSize: '0.9375rem' }}>{s.name}</p>
        <p style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.5)', margin: 0 }}>{s.duration_minutes} min</p>
      </div>
      <p style={{ fontSize: '1.125rem', fontWeight: 700, color: config.color, margin: 0, flexShrink: 0 }}>
        {s.price_cents > 0 ? `R$${(s.price_cents / 100).toFixed(0)}` : 'Grátis'}
      </p>
    </button>
  );

  // ─── Steps content ───
  const stepServico = (
    <div key="servico">
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
        Escolha o serviço
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {servicos?.map((s) => servicoBtn(s, () => { setSelectedServico(s); setStep(1); }))}
      </div>
    </div>
  );

  // Adega: step 0 = tipo de entrega
  const stepEntrega = (
    <div key="entrega">
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
        Como vai receber?
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.4)', margin: '0 0 20px' }}>
        Escolha o tipo de entrega. O valor do frete é adicionado ao pedido.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {servicos?.map((s) => servicoBtn(s, () => { setSelectedServico(s); setStep(1); }))}
      </div>
    </div>
  );

  // Adega: step 1 = produtos
  const produtosPorCategoria = produtos?.reduce((acc, p) => {
    const cat = p.categoria || 'Outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {}) || {};

  const stepProdutos = (
    <div key="produtos">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F0F0F0', margin: 0, letterSpacing: '-0.02em' }}>
          Escolha os produtos
        </h2>
        {cartCount > 0 && (
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: config.color }}>
            {cartCount} item{cartCount !== 1 ? 's' : ''} · R${(cartTotal / 100).toFixed(2)}
          </span>
        )}
      </div>

      {Object.entries(produtosPorCategoria).map(([cat, prods]) => (
        <div key={cat} style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(240,240,240,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>{cat}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {prods.map((p) => {
              const inCart = cart.find((i) => i.id === p.id);
              return (
                <div key={p.id} style={{
                  background: inCart ? colorBg : 'rgba(255,255,255,0.03)',
                  border: inCart ? `1px solid ${colorBord}` : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '10px', padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, color: '#F0F0F0', margin: '0 0 2px', fontSize: '0.9375rem' }}>{p.nome}</p>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: config.color, margin: 0 }}>
                      R${(p.preco_cents / 100).toFixed(2)}
                    </p>
                  </div>
                  {inCart ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button onClick={() => setQty(p.id, inCart.qty - 1)} style={{ width: '30px', height: '30px', borderRadius: '7px', border: `1px solid ${colorBord}`, background: colorBg, color: config.color, cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 700 }}>−</button>
                      <span style={{ fontWeight: 700, color: '#F0F0F0', minWidth: '20px', textAlign: 'center' }}>{inCart.qty}</span>
                      <button onClick={() => setQty(p.id, inCart.qty + 1)} style={{ width: '30px', height: '30px', borderRadius: '7px', border: `1px solid ${colorBord}`, background: colorBg, color: config.color, cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 700 }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(p)} style={{ padding: '7px 16px', borderRadius: '7px', border: `1px solid ${colorBord}`, background: colorBg, color: config.color, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0, transition: 'all 0.15s' }}>
                      Adicionar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button
        disabled={cart.length === 0}
        onClick={() => setStep(2)}
        className="btn"
        style={{
          background: `linear-gradient(135deg, ${config.color}, ${config.colorDark})`,
          color: '#F0F0F0', width: '100%', justifyContent: 'center',
          padding: '13px', fontSize: '0.9375rem', opacity: cart.length === 0 ? 0.45 : 1,
          cursor: cart.length === 0 ? 'not-allowed' : 'pointer', marginTop: '8px',
        }}
      >
        Continuar {cart.length > 0 && `(${cartCount} ite${cartCount !== 1 ? 'ns' : 'm'} · R$${(cartTotal / 100).toFixed(2)})`}
      </button>
    </div>
  );

  const stepProfissional = (
    <div key="profissional">
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
        Escolha o profissional
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[{ id: null, name: 'Sem preferência', sub: 'Qualquer profissional disponível' },
          ...(disponibilidade?.profissionais || []).map((p) => ({ id: p.id, name: p.name, sub: '' }))
        ].map((p) => (
          <button key={p.id ?? 'any'} onClick={() => { setSelectedProfissional(p.id ? p : null); setStep(2); }}
            style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px 18px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}
            onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.18)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#161B22'; }}>
            <p style={{ fontWeight: 600, color: '#F0F0F0', margin: '0 0 2px', fontSize: '0.9375rem' }}>{p.name}</p>
            {p.sub && <p style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.5)', margin: 0 }}>{p.sub}</p>}
          </button>
        ))}
      </div>
    </div>
  );

  const stepDataHora = (
    <div key="dataHora">
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
        {isAdega ? 'Quando receber?' : 'Escolha data e horário'}
      </h2>
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
        {days.map((day) => {
          const d = format(day, 'yyyy-MM-dd');
          const isSel = d === selectedDate;
          return (
            <button key={d} onClick={() => { setSelectedDate(d); setSelectedSlot(null); }} style={{
              flexShrink: 0, padding: '10px 14px', borderRadius: '10px', textAlign: 'center',
              border: isSel ? `1px solid ${config.color}` : '1px solid rgba(255,255,255,0.08)',
              background: isSel ? colorBg : 'rgba(255,255,255,0.04)',
              cursor: 'pointer', transition: 'all 0.15s', minWidth: '52px',
            }}>
              <p style={{ fontSize: '0.6875rem', color: isSel ? config.color : 'rgba(240,240,240,0.5)', margin: '0 0 3px', textTransform: 'capitalize' }}>
                {format(day, 'EEE', { locale: ptBR })}
              </p>
              <p style={{ fontWeight: 700, color: isSel ? '#F0F0F0' : 'rgba(240,240,240,0.8)', margin: 0, fontSize: '1rem' }}>
                {format(day, 'd')}
              </p>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
        {disponibilidade?.slots?.map((slot) => (
          <button key={slot} onClick={() => setSelectedSlot(slot)} style={{
            padding: '10px 6px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500,
            border: selectedSlot === slot ? `1px solid ${config.color}` : '1px solid rgba(255,255,255,0.08)',
            background: selectedSlot === slot ? colorBg : 'rgba(255,255,255,0.04)',
            color: selectedSlot === slot ? '#F0F0F0' : 'rgba(240,240,240,0.7)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{slot}</button>
        ))}
        {(!disponibilidade?.slots || disponibilidade.slots.length === 0) && (
          <p style={{ gridColumn: '1 / -1', color: 'rgba(240,240,240,0.4)', textAlign: 'center', padding: '32px 0', fontSize: '0.875rem' }}>
            Nenhum horário disponível nesta data.
          </p>
        )}
      </div>
      <button disabled={!selectedSlot} onClick={() => setStep(3)} className="btn"
        style={{ background: `linear-gradient(135deg, ${config.color}, ${config.colorDark})`, color: '#F0F0F0', width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.9375rem', opacity: !selectedSlot ? 0.45 : 1, cursor: !selectedSlot ? 'not-allowed' : 'pointer' }}>
        Continuar
      </button>
    </div>
  );

  const stepDados = (
    <div key="dados">
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Seus dados
      </h2>
      <form onSubmit={handleSubmit(handleClienteSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Nome completo *</label>
          <input {...register('name')} style={inputStyle} placeholder="João Silva" />
          {errors.name && <p style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.name.message}</p>}
        </div>
        <div>
          <label style={labelStyle}>Telefone / WhatsApp *</label>
          <input {...register('phone')} style={inputStyle} placeholder="(99) 99999-9999" />
          {errors.phone && <p style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.phone.message}</p>}
        </div>
        <div>
          <label style={labelStyle}>E-mail (opcional)</label>
          <input {...register('email')} type="email" style={inputStyle} placeholder="seu@email.com" />
        </div>
        {isAdega && isDelivery && (
          <div>
            <label style={labelStyle}>Endereço de entrega *</label>
            <input value={endereco} onChange={(e) => setEndereco(e.target.value)}
              style={inputStyle} placeholder="Rua, número, bairro, complemento" required />
          </div>
        )}
        {isAdega && cart.length > 0 && (
          <div style={{ background: colorBg, border: `1px solid ${colorBord}`, borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(240,240,240,0.5)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resumo do pedido</p>
            {cart.map((i) => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                <span style={{ color: 'rgba(240,240,240,0.8)' }}>{i.qty}× {i.nome}</span>
                <span style={{ color: config.color, fontWeight: 600 }}>R${(i.preco_cents * i.qty / 100).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(240,240,240,0.7)' }}>Subtotal produtos</span>
              <span style={{ fontWeight: 700, color: config.color }}>R${(cartTotal / 100).toFixed(2)}</span>
            </div>
            {selectedServico?.price_cents > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.5)' }}>Frete ({selectedServico.name})</span>
                <span style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.6)' }}>+ R${(selectedServico.price_cents / 100).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
        {erroAgendar && (
          <p style={{ color: '#F87171', fontSize: '0.8125rem', textAlign: 'center', background: 'rgba(248,113,113,0.1)', padding: '10px 14px', borderRadius: '8px', margin: '0 0 4px' }}>{erroAgendar}</p>
        )}
        <button type="submit" disabled={isPending || (isAdega && isDelivery && !endereco)} className="btn"
          style={{ background: `linear-gradient(135deg, ${config.color}, ${config.colorDark})`, color: '#F0F0F0', width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.9375rem', marginTop: '4px' }}>
          {isPending ? 'Agendando...' : isAdega ? 'Confirmar Pedido' : 'Confirmar Agendamento'}
        </button>
      </form>
    </div>
  );

  // Montar steps corretos por loja
  const stepContent = isAdega
    ? [stepEntrega, stepProdutos, stepDataHora, stepDados]
    : [stepServico, stepProfissional, stepDataHora, stepDados];

  return (
    <div style={{ minHeight: '100vh', background: '#0F1117' }}>
      <div style={{ background: `linear-gradient(135deg, ${config.color}, ${config.colorDark})`, padding: '32px 24px' }}>
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)', flexShrink: 0 }}>
              <Icon />
            </div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#F0F0F0', margin: 0 }}>{config.name}</h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', margin: '6px 0 0 52px' }}>
            {isAdega ? 'Fazer pedido' : 'Agendar serviço'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '540px', margin: '0 auto', padding: '28px 24px' }}>
        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '28px' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                background: i <= step ? config.color : 'rgba(255,255,255,0.07)',
                color: i <= step ? '#F0F0F0' : 'rgba(240,240,240,0.25)',
                boxShadow: i === step ? `0 0 12px ${config.color}60` : 'none',
                transition: 'all 0.2s', opacity: i > step ? 0.4 : 1,
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: '2px', margin: '0 4px', background: i < step ? config.color : 'rgba(255,255,255,0.07)', borderRadius: '1px', transition: 'background 0.2s' }} />
              )}
            </div>
          ))}
        </div>

        {/* Summary bar */}
        {selectedServico && step > 0 && (
          <div style={{ background: colorBg, border: `1px solid ${colorBord}`, borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: 600, color: '#F0F0F0' }}>{selectedServico.name}</span>
            {!isAdega && selectedProfissional && <span style={{ color: 'rgba(240,240,240,0.6)' }}> · {selectedProfissional.name}</span>}
            {isAdega && cartCount > 0 && <span style={{ color: 'rgba(240,240,240,0.6)' }}> · {cartCount} produto{cartCount !== 1 ? 's' : ''}</span>}
            {selectedSlot && <span style={{ color: config.color, fontWeight: 500 }}> · {selectedDate} às {selectedSlot}</span>}
          </div>
        )}

        {/* Back */}
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{ background: 'none', border: 'none', color: 'rgba(240,240,240,0.45)', fontSize: '0.875rem', cursor: 'pointer', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit', transition: 'color 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.8)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.45)'; }}>
            ← Voltar
          </button>
        )}

        {stepContent[step]}
      </div>
    </div>
  );
}
