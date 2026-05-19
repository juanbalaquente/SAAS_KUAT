import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

const ScissorsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
);
const CarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
  </svg>
);
const WineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/>
    <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5z"/>
  </svg>
);

const lojas = [
  { slug: 'barbearia_kuat', name: 'Barbearia Kuat', Icon: ScissorsIcon, gradient: 'linear-gradient(135deg, #C4622D, #9C4A1F)', accentColor: '#C4622D', to: '/barbearia' },
  { slug: 'lava_kuat',      name: 'Lava Kuat',      Icon: CarIcon,      gradient: 'linear-gradient(135deg, #2E6B8A, #1F4E6B)', accentColor: '#2E6B8A', to: '/lavajato' },
  { slug: 'adega_r1',       name: 'Adega R1',       Icon: WineIcon,     gradient: 'linear-gradient(135deg, #2D6A4F, #1F4E38)', accentColor: '#2D6A4F', to: '/adega' },
];

const STATUS_AG = {
  pendente:       { label: 'Pendente',   color: 'rgba(240,240,240,0.5)', bg: 'rgba(255,255,255,0.07)' },
  confirmado:     { label: 'Confirmado', color: '#60A5FA',               bg: 'rgba(59,130,246,0.12)' },
  em_atendimento: { label: 'Em atend.',  color: '#FCD34D',               bg: 'rgba(245,158,11,0.12)' },
  concluido:      { label: 'Concluído',  color: '#4ADE80',               bg: 'rgba(34,197,94,0.12)' },
  cancelado:      { label: 'Cancelado',  color: '#F87171',               bg: 'rgba(239,68,68,0.12)' },
};

const LOJA_COLOR = { barbearia_kuat: '#C4622D', lava_kuat: '#2E6B8A', adega_r1: '#2D6A4F' };

function StatCell({ label, value, sub }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F0F0F0', margin: 0, letterSpacing: '-0.02em' }}>{value ?? '—'}</p>
      <p style={{ fontSize: '0.6875rem', color: 'rgba(240,240,240,0.45)', marginTop: '3px' }}>{label}</p>
      {sub && <p style={{ fontSize: '0.625rem', color: 'rgba(240,240,240,0.3)', marginTop: '1px' }}>{sub}</p>}
    </div>
  );
}

function Sparkline({ data }) {
  if (!data || data.length === 0) return null;
  const values = data.map((d) => d.total);
  const max = Math.max(...values, 1);
  const W = 120, H = 32;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - (v / max) * H * 0.85;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke="rgba(74,222,128,0.5)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * W;
        const y = H - (v / max) * H * 0.85;
        return <circle key={i} cx={x} cy={y} r="2" fill="#4ADE80" opacity={i === values.length - 1 ? 1 : 0.4} />;
      })}
    </svg>
  );
}

function LojaCard({ loja, data, fatSemana }) {
  const Icon = loja.Icon;
  const lojaData = fatSemana?.filter((_, i) => i >= 0);
  return (
    <div className="card" style={{ transition: 'border-color 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: loja.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)', flexShrink: 0 }}>
            <Icon />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F0F0F0', margin: 0, letterSpacing: '-0.01em' }}>{loja.name}</h3>
            <p style={{ fontSize: '0.6875rem', color: 'rgba(240,240,240,0.35)', marginTop: '1px' }}>Hoje</p>
          </div>
        </div>
        <Link to={loja.to} style={{ fontSize: '0.75rem', fontWeight: 500, color: loja.accentColor, textDecoration: 'none', transition: 'opacity 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}>
          Ver painel →
        </Link>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '18px' }}>
        {data ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {loja.slug === 'barbearia_kuat' && (
                <>
                  <StatCell label="Agendamentos" value={data.agendamentos_hoje} />
                  <StatCell label="Concluídos" value={data.concluidos} />
                  <StatCell label="Faturamento" value={`R$${((data.faturamento || 0) / 100).toFixed(0)}`} />
                </>
              )}
              {loja.slug === 'lava_kuat' && (
                <>
                  <StatCell label="Boxes Livres" value={data.boxes_livres} sub={`de ${data.total_boxes}`} />
                  <StatCell label="Agendamentos" value={data.agendamentos_hoje} />
                  <StatCell label="Faturamento" value={`R$${((data.faturamento || 0) / 100).toFixed(0)}`} />
                </>
              )}
              {loja.slug === 'adega_r1' && (
                <>
                  <StatCell label="Vendas Hoje" value={data.vendas_hoje} />
                  <StatCell label="Entregas" value={data.entregas_pendentes} sub="pendentes" />
                  <StatCell label="Faturamento" value={`R$${((data.faturamento || 0) / 100).toFixed(0)}`} />
                </>
              )}
            </div>
            {lojaData && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.6875rem', color: 'rgba(240,240,240,0.3)' }}>7 dias</span>
                <Sparkline data={lojaData} />
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse" style={{ textAlign: 'center' }}>
                <div style={{ height: '24px', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', width: '50px', margin: '0 auto 6px' }} />
                <div style={{ height: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', width: '70px', margin: '0 auto' }} />
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
  { key: 'total_concluidos',        label: 'Concluídos',        color: '#4ADE80' },
  { key: 'alertas_estoque',         label: 'Alertas estoque',   color: '#FCD34D' },
  { key: 'faturamento_total',       label: 'Faturamento total', color: '#C084FC', isMoney: true },
];

export default function DashboardPage() {
  const { data: resumo, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard-resumo'],
    queryFn: () => api.get('/dashboard/resumo').then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const atualizadoEm = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 5px', letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.4)', textTransform: 'capitalize', margin: 0 }}>{hoje}</p>
        </div>
        {atualizadoEm && (
          <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.3)' }}>Atualizado às {atualizadoEm}</span>
        )}
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {summaryItems.map((item) => (
          <div key={item.key} className="card" style={{ textAlign: 'center', padding: '18px' }}>
            {isLoading ? (
              <div className="animate-pulse">
                <div style={{ height: '30px', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', width: '55%', margin: '0 auto 6px' }} />
                <div style={{ height: '11px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', width: '75%', margin: '0 auto' }} />
              </div>
            ) : (
              <>
                <p style={{ fontSize: '1.875rem', fontWeight: 700, color: item.color, margin: '0 0 5px', letterSpacing: '-0.02em' }}>
                  {item.isMoney
                    ? `R$${((resumo?.geral?.[item.key] ?? 0) / 100).toFixed(0)}`
                    : (resumo?.geral?.[item.key] ?? 0)}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.45)', margin: 0 }}>{item.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Store cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '28px' }}>
        {lojas.map((loja) => (
          <LojaCard
            key={loja.slug}
            loja={loja}
            data={isLoading ? null : resumo?.[loja.slug]}
            fatSemana={isLoading ? null : resumo?.faturamento_semana}
          />
        ))}
      </div>

      {/* Agendamentos do dia */}
      {(resumo?.agendamentos_recentes?.length > 0 || isLoading) && (
        <div>
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(240,240,240,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
            Agendamentos de hoje
          </p>
          {isLoading ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'rgba(240,240,240,0.3)' }}>Carregando...</div>
          ) : (
            <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
              {(resumo?.agendamentos_recentes || []).map((ag, i) => {
                const st = STATUS_AG[ag.status] || STATUS_AG.pendente;
                const hora = new Date(ag.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const cor = LOJA_COLOR[ag.loja_slug] || '#4ADE80';
                return (
                  <div key={ag.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 18px',
                    borderBottom: i < (resumo?.agendamentos_recentes?.length ?? 1) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'background 0.1s',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(240,240,240,0.5)', fontFamily: 'monospace', minWidth: '36px' }}>{hora}</span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cor, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#F0F0F0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ag.cliente}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                      {ag.servico}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'rgba(240,240,240,0.3)', flexShrink: 0, minWidth: '80px', textAlign: 'right' }}>
                      {ag.loja}
                    </span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: st.bg, color: st.color, flexShrink: 0 }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
