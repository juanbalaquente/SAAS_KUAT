import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

const ScissorsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
);

const CarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
  </svg>
);

const WineIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/>
    <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5z"/>
  </svg>
);

const lojas = [
  {
    slug: 'barbearia_kuat',
    name: 'Barbearia Kuat',
    Icon: ScissorsIcon,
    gradient: 'linear-gradient(135deg, #C4622D, #9C4A1F)',
    accentColor: '#C4622D',
    to: '/barbearia',
  },
  {
    slug: 'lava_kuat',
    name: 'Lava Kuat',
    Icon: CarIcon,
    gradient: 'linear-gradient(135deg, #2E6B8A, #1F4E6B)',
    accentColor: '#2E6B8A',
    to: '/lavajato',
  },
  {
    slug: 'adega_r1',
    name: 'Adega R1',
    Icon: WineIcon,
    gradient: 'linear-gradient(135deg, #2D6A4F, #1F4E38)',
    accentColor: '#2D6A4F',
    to: '/adega',
  },
];

function StatCell({ label, value, sub }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '1.625rem', fontWeight: 700, color: '#F0F0F0', margin: 0, letterSpacing: '-0.02em' }}>
        {value ?? '—'}
      </p>
      <p style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)', marginTop: '4px' }}>{label}</p>
      {sub && <p style={{ fontSize: '0.6875rem', color: 'rgba(240,240,240,0.35)', marginTop: '2px' }}>{sub}</p>}
    </div>
  );
}

function LojaCard({ loja, data }) {
  const Icon = loja.Icon;
  return (
    <div className="card" style={{ transition: 'border-color 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: loja.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.9)',
            flexShrink: 0,
          }}>
            <Icon />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#F0F0F0', margin: 0, letterSpacing: '-0.01em' }}>
              {loja.name}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.4)', marginTop: '2px' }}>Hoje</p>
          </div>
        </div>
        <Link
          to={loja.to}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: loja.accentColor,
            textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          Ver painel →
        </Link>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
        {data ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {loja.slug === 'barbearia_kuat' && (
              <>
                <StatCell label="Agendamentos" value={data.agendamentos_hoje} />
                <StatCell label="Concluídos" value={data.concluidos} />
                <StatCell label="Faturamento" value={data.faturamento ? `R$${(data.faturamento / 100).toFixed(0)}` : 'R$0'} />
              </>
            )}
            {loja.slug === 'lava_kuat' && (
              <>
                <StatCell label="Boxes Livres" value={data.boxes_livres} sub={`de ${data.total_boxes}`} />
                <StatCell label="Agendamentos" value={data.agendamentos_hoje} />
                <StatCell label="Faturamento" value={data.faturamento ? `R$${(data.faturamento / 100).toFixed(0)}` : 'R$0'} />
              </>
            )}
            {loja.slug === 'adega_r1' && (
              <>
                <StatCell label="Vendas Hoje" value={data.vendas_hoje} />
                <StatCell label="Entregas" value={data.entregas_pendentes} sub="pendentes" />
                <StatCell label="Faturamento" value={data.faturamento ? `R$${(data.faturamento / 100).toFixed(0)}` : 'R$0'} />
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse" style={{ textAlign: 'center' }}>
                <div style={{ height: '28px', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', width: '60px', margin: '0 auto 8px' }} />
                <div style={{ height: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', width: '80px', margin: '0 auto' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const summaryItems = [
  { key: 'total_agendamentos_hoje', label: 'Agendamentos hoje', color: '#60A5FA' },
  { key: 'total_concluidos', label: 'Concluídos', color: '#4ADE80' },
  { key: 'alertas_estoque', label: 'Alertas estoque', color: '#FCD34D' },
  { key: 'faturamento_total', label: 'Faturamento total', color: '#C084FC', isMoney: true },
];

export default function DashboardPage() {
  const { data: resumo, isLoading } = useQuery({
    queryKey: ['dashboard-resumo'],
    queryFn: () => api.get('/dashboard/resumo').then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Layout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.45)', textTransform: 'capitalize' }}>{hoje}</p>
      </div>

      {/* Summary row */}
      {(resumo?.geral || isLoading) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {summaryItems.map((item) => (
            <div key={item.key} className="card" style={{ textAlign: 'center', padding: '20px' }}>
              {isLoading ? (
                <div className="animate-pulse">
                  <div style={{ height: '32px', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', width: '60%', margin: '0 auto 8px' }} />
                  <div style={{ height: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', width: '80%', margin: '0 auto' }} />
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '1.875rem', fontWeight: 700, color: item.color, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                    {item.isMoney
                      ? `R$${((resumo?.geral?.[item.key] ?? 0) / 100).toFixed(0)}`
                      : (resumo?.geral?.[item.key] ?? 0)}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.5)', margin: 0 }}>{item.label}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Store cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {lojas.map((loja) => (
          <LojaCard
            key={loja.slug}
            loja={loja}
            data={isLoading ? null : resumo?.[loja.slug]}
          />
        ))}
      </div>
    </Layout>
  );
}
