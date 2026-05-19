import { Link } from 'react-router-dom';

const ScissorsIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
);

const CarIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
  </svg>
);

const WineIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/>
    <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const lojas = [
  {
    slug: 'barbearia_kuat',
    name: 'Barbearia Kuat',
    Icon: ScissorsIcon,
    color: '#C4622D',
    colorDark: '#9C4A1F',
    desc: 'Cortes masculinos, barba e tratamentos. Profissionais experientes, ambiente moderno.',
    servicos: ['Corte masculino', 'Barba', 'Corte + Barba', 'Sobrancelha'],
  },
  {
    slug: 'lava_kuat',
    name: 'Lava Kuat',
    Icon: CarIcon,
    color: '#2E6B8A',
    colorDark: '#1F4E6B',
    desc: 'Lavagem e higienização completa do seu veículo com cuidado e agilidade.',
    servicos: ['Lavagem simples', 'Lavagem completa', 'Premium + polimento', 'Higienização interna'],
  },
  {
    slug: 'adega_r1',
    name: 'Adega R1',
    Icon: WineIcon,
    color: '#2D6A4F',
    colorDark: '#1F4E38',
    desc: 'Cervejas, vinhos e destilados selecionados. Retirada na loja ou delivery.',
    servicos: ['Retirada na loja', 'Delivery até 5km', 'Delivery 5–10km'],
  },
];

function StoreCard({ loja }) {
  const Icon = loja.Icon;
  return (
    <div
      style={{
        background: '#161B22',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.2)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 16px rgba(0,0,0,0.35), 0 24px 48px rgba(0,0,0,0.25), 0 0 32px ${loja.color}1A`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.2)';
      }}
    >
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${loja.color}, ${loja.colorDark})`,
        padding: '32px 28px',
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px',
          color: 'rgba(255,255,255,0.9)',
        }}>
          <Icon />
        </div>
        <h2 style={{
          fontSize: '1.375rem',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          margin: 0,
          color: '#F0F0F0',
          lineHeight: 1.2,
        }}>
          {loja.name}
        </h2>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{
          fontSize: '0.875rem',
          color: 'rgba(240,240,240,0.55)',
          marginBottom: '16px',
          lineHeight: 1.65,
        }}>
          {loja.desc}
        </p>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }} />

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '9px', flex: 1 }}>
          {loja.servicos.map((s) => (
            <li key={s} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              fontSize: '0.875rem',
              color: 'rgba(240,240,240,0.65)',
              fontWeight: 400,
            }}>
              <span style={{ color: loja.color }}><CheckIcon /></span>
              {s}
            </li>
          ))}
        </ul>

        <Link
          to={`/agendar/${loja.slug}`}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '11px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.875rem',
            letterSpacing: '0.02em',
            color: '#F0F0F0',
            textDecoration: 'none',
            background: `linear-gradient(135deg, ${loja.color}, ${loja.colorDark})`,
            transition: 'opacity 0.2s, transform 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          Agendar agora
        </Link>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F1117', color: '#F0F0F0' }}>
      {/* Hero */}
      <header style={{ textAlign: 'center', padding: '88px 24px 64px' }}>
        <h1 style={{
          fontSize: 'clamp(2.75rem, 6vw, 4.25rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          margin: '0 0 18px',
          color: '#F0F0F0',
          lineHeight: 1.05,
        }}>
          SAAS Kuat
        </h1>
        <p style={{
          fontSize: '1.0625rem',
          fontWeight: 300,
          color: 'rgba(240,240,240,0.55)',
          maxWidth: '460px',
          margin: '0 auto',
          lineHeight: 1.65,
        }}>
          O sistema completo do grupo Kuat. Agende seu horário, acompanhe seu pedido.
        </p>
      </header>

      {/* Cards */}
      <section style={{
        maxWidth: '1080px',
        margin: '0 auto',
        padding: '0 24px 88px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
      }}>
        {lojas.map((loja) => <StoreCard key={loja.slug} loja={loja} />)}
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', paddingBottom: '40px' }}>
        <Link
          to="/login"
          style={{
            color: 'rgba(240,240,240,0.35)',
            textDecoration: 'none',
            fontSize: '0.75rem',
            letterSpacing: '0.01em',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.6)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,240,240,0.35)'; }}
        >
          Área administrativa
        </Link>
      </footer>
    </div>
  );
}
