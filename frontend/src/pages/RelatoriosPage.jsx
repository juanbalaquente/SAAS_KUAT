import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Layout from '../components/Layout';
import api from '../services/api';

const fmt = (cents) => `R$${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
const LOJA_COLORS = { barbearia_kuat: '#E8593C', lava_kuat: '#E8A020', adega_r1: '#4CAF70' };
const LOJA_NAMES  = { barbearia_kuat: 'Barbearia Kuat', lava_kuat: 'Lava Kuat', adega_r1: 'Adega R1' };

const PRESETS = [
  { label: 'Esta semana',   fn: () => ({ inicio: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'), fim: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd') }) },
  { label: 'Este mês',      fn: () => ({ inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'), fim: format(endOfMonth(new Date()), 'yyyy-MM-dd') }) },
  { label: 'Mês passado',   fn: () => ({ inicio: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'), fim: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd') }) },
  { label: 'Últimos 3 meses', fn: () => ({ inicio: format(startOfMonth(subMonths(new Date(), 2)), 'yyyy-MM-dd'), fim: format(endOfMonth(new Date()), 'yyyy-MM-dd') }) },
];

function BarChart({ data, height = 180 }) {
  if (!data || data.length === 0) return null;

  const slugs = ['barbearia_kuat', 'lava_kuat', 'adega_r1'];
  const maxVal = Math.max(...data.map((d) => slugs.reduce((s, k) => s + (d[k] || 0), 0)), 1);
  const barW = 8;
  const gap  = 3;
  const groupW = slugs.length * barW + (slugs.length - 1) * gap + 10;
  const totalW = data.length * groupW;

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
      <svg width={Math.max(totalW, 400)} height={height + 28} style={{ display: 'block' }}>
        {data.map((d, i) => {
          const x0 = i * groupW + 5;
          return (
            <g key={d.data}>
              {slugs.map((slug, j) => {
                const val = d[slug] || 0;
                const barH = Math.round((val / maxVal) * height);
                return (
                  <rect
                    key={slug}
                    x={x0 + j * (barW + gap)}
                    y={height - barH}
                    width={barW}
                    height={barH}
                    rx={2}
                    fill={LOJA_COLORS[slug]}
                    opacity={0.85}
                  >
                    <title>{LOJA_NAMES[slug]}: {fmt(val)}</title>
                  </rect>
                );
              })}
              {(i % Math.ceil(data.length / 10) === 0) && (
                <text
                  x={x0 + groupW / 2 - 5}
                  y={height + 18}
                  fontSize={9}
                  fill="rgba(240,240,240,0.35)"
                  textAnchor="middle"
                >
                  {format(new Date(d.data + 'T00:00:00'), 'd/M')}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
        {slugs.map((slug) => (
          <div key={slug} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: LOJA_COLORS[slug] }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.5)' }}>{LOJA_NAMES[slug]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RelatoriosPage() {
  const [preset,     setPreset]     = useState(1);
  const [customMode, setCustomMode] = useState(false);
  const [customIni,  setCustomIni]  = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customFim,  setCustomFim]  = useState(format(new Date(), 'yyyy-MM-dd'));

  const periodo = customMode
    ? { inicio: customIni, fim: customFim }
    : PRESETS[preset].fn();

  const { data, isLoading } = useQuery({
    queryKey: ['relatorios', periodo.inicio, periodo.fim],
    queryFn: () => api.get('/relatorios', { params: periodo }).then((r) => r.data.data),
  });

  const resumo = data?.resumo_lojas || {};
  const diario = data?.faturamento_diario || [];
  const populares = data?.servicos_populares || [];

  const totalGeral = useMemo(() => {
    return Object.values(resumo).reduce((s, l) => s + l.faturamento_cents + l.faturamento_pedidos_cents, 0);
  }, [resumo]);

  const card = (style) => ({
    background: '#161B22',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '20px 24px',
    ...style,
  });

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#F0F0F0',
    padding: '7px 12px',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#F0F0F0', margin: 0 }}>Relatórios</h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.4)', margin: '4px 0 0' }}>
              {data ? `${format(new Date(periodo.inicio + 'T00:00:00'), "d 'de' MMM", { locale: ptBR })} — ${format(new Date(periodo.fim + 'T00:00:00'), "d 'de' MMM yyyy", { locale: ptBR })}` : 'Carregando...'}
            </p>
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {PRESETS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => { setPreset(i); setCustomMode(false); }}
                style={{
                  padding: '6px 14px', borderRadius: '7px', fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer',
                  border: !customMode && preset === i ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                  background: !customMode && preset === i ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: !customMode && preset === i ? '#F0F0F0' : 'rgba(240,240,240,0.5)',
                  transition: 'all 0.15s',
                }}
              >{p.label}</button>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input type="date" value={customIni} onChange={(e) => { setCustomIni(e.target.value); setCustomMode(true); }} style={inputStyle} />
              <span style={{ color: 'rgba(240,240,240,0.3)', fontSize: '0.875rem' }}>–</span>
              <input type="date" value={customFim} onChange={(e) => { setCustomFim(e.target.value); setCustomMode(true); }} style={inputStyle} />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(240,240,240,0.3)' }}>Carregando dados...</div>
        ) : (
          <>
            {/* Total geral */}
            <div style={{ ...card({ marginBottom: '20px', background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' }) }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(240,240,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Faturamento Total</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#F0F0F0', margin: 0 }}>{fmt(totalGeral)}</p>
            </div>

            {/* Cards por loja */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {Object.entries(resumo).map(([slug, loja]) => {
                const fat = loja.faturamento_cents + loja.faturamento_pedidos_cents;
                const isAdega = slug === 'adega_r1';
                return (
                  <div key={slug} style={card({ borderTop: `3px solid ${LOJA_COLORS[slug]}` })}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '1.25rem' }}>{loja.emoji}</span>
                      <span style={{ fontWeight: 700, color: '#F0F0F0', fontSize: '0.9375rem' }}>{loja.nome}</span>
                    </div>
                    <p style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.03em', color: LOJA_COLORS[slug], margin: '0 0 12px' }}>{fmt(fat)}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                        <span style={{ color: 'rgba(240,240,240,0.45)' }}>{isAdega ? 'Pedidos' : 'Agendamentos'}</span>
                        <span style={{ color: 'rgba(240,240,240,0.8)', fontWeight: 500 }}>{isAdega ? loja.total_pedidos : loja.total_agendamentos}</span>
                      </div>
                      {isAdega && loja.total_agendamentos > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                          <span style={{ color: 'rgba(240,240,240,0.45)' }}>Agendamentos (entregas)</span>
                          <span style={{ color: 'rgba(240,240,240,0.8)', fontWeight: 500 }}>{loja.total_agendamentos}</span>
                        </div>
                      )}
                      {loja.top_servico && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                          <span style={{ color: 'rgba(240,240,240,0.45)' }}>Mais popular</span>
                          <span style={{ color: 'rgba(240,240,240,0.8)', fontWeight: 500, maxWidth: '140px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loja.top_servico}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gráfico diário */}
            <div style={{ ...card({ marginBottom: '24px' }) }}>
              <p style={{ fontWeight: 700, color: '#F0F0F0', margin: '0 0 20px', fontSize: '0.9375rem' }}>Faturamento por dia</p>
              <BarChart data={diario} />
            </div>

            {/* Serviços populares */}
            {populares.length > 0 && (
              <div style={card({})}>
                <p style={{ fontWeight: 700, color: '#F0F0F0', margin: '0 0 16px', fontSize: '0.9375rem' }}>Serviços mais realizados</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr>
                      {['Serviço', 'Loja', 'Qtd', 'Faturamento'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '0 12px 10px 0', color: 'rgba(240,240,240,0.35)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {populares.map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '10px 12px 10px 0', color: '#F0F0F0', fontWeight: 500 }}>{s.nome}</td>
                        <td style={{ padding: '10px 12px 10px 0', color: 'rgba(240,240,240,0.6)' }}>{s.loja}</td>
                        <td style={{ padding: '10px 12px 10px 0', color: 'rgba(240,240,240,0.8)', fontWeight: 600 }}>{s.count}</td>
                        <td style={{ padding: '10px 0', color: '#F0F0F0', fontWeight: 600 }}>{fmt(s.faturamento_cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
