import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import api from '../services/api';

const BOX_STATUS = {
  livre:      { label: 'Livre',      border: 'rgba(34,197,94,0.3)',    bg: 'rgba(34,197,94,0.07)',    dot: '#4ADE80' },
  ocupado:    { label: 'Ocupado',    border: 'rgba(46,107,138,0.45)',  bg: 'rgba(46,107,138,0.12)',   dot: '#60B8D8' },
  manutencao: { label: 'Manutenção', border: 'rgba(239,68,68,0.3)',    bg: 'rgba(239,68,68,0.07)',    dot: '#F87171' },
};

function BoxCard({ box, onUpdate }) {
  const st = BOX_STATUS[box.status] || BOX_STATUS.livre;
  const ag = box.agendamento;

  return (
    <div
      className="card"
      style={{
        border: `1px solid ${st.border}`,
        background: st.bg,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#F0F0F0', margin: 0, letterSpacing: '-0.01em' }}>
          Box {box.numero}
        </h3>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(240,240,240,0.7)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
          {st.label}
        </span>
      </div>

      {ag && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '12px',
          fontSize: '0.875rem',
          color: 'rgba(240,240,240,0.6)',
        }}>
          <p style={{ fontWeight: 600, color: '#F0F0F0', margin: '0 0 3px' }}>{ag.cliente?.name}</p>
          <p style={{ margin: '0 0 6px' }}>{ag.servico?.name}</p>
          {ag.veiculo_placa && (
            <span style={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
              color: 'rgba(240,240,240,0.75)',
            }}>
              {ag.veiculo_placa}
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        {box.status === 'livre' && (
          <button
            onClick={() => onUpdate(box.id, 'ocupado')}
            className="btn"
            style={{ background: 'linear-gradient(135deg, #2E6B8A, #1F4E6B)', color: '#F0F0F0', flex: 1, justifyContent: 'center', fontSize: '0.8125rem', padding: '7px 10px' }}
          >
            Ocupar
          </button>
        )}
        {box.status === 'ocupado' && (
          <>
            <button
              onClick={() => onUpdate(box.id, 'livre')}
              className="btn-success"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem', padding: '7px 10px' }}
            >
              ✓ Concluir
            </button>
            <button
              onClick={() => onUpdate(box.id, 'manutencao')}
              className="btn-danger"
              style={{ fontSize: '0.8125rem', padding: '7px 12px' }}
            >
              ⚠
            </button>
          </>
        )}
        {box.status === 'manutencao' && (
          <button
            onClick={() => onUpdate(box.id, 'livre')}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.8125rem', padding: '7px 10px' }}
          >
            Liberar
          </button>
        )}
      </div>
    </div>
  );
}

export default function LavaJatoPage() {
  const qc = useQueryClient();

  const { data: boxes, isLoading } = useQuery({
    queryKey: ['lava-boxes'],
    queryFn: () => api.get('/lavajato/boxes').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: agenda } = useQuery({
    queryKey: ['lava-agenda'],
    queryFn: () => api.get('/barbearia/agenda-hoje').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { mutate: updateBox } = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/lavajato/boxes/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lava-boxes'] }),
  });

  const livres   = boxes?.filter((b) => b.status === 'livre').length ?? 0;
  const ocupados = boxes?.filter((b) => b.status === 'ocupado').length ?? 0;

  const statCards = [
    { label: 'Boxes Livres',  value: livres,             color: '#4ADE80' },
    { label: 'Em Lavagem',    value: ocupados,           color: '#60B8D8' },
    { label: 'Total de Boxes',value: boxes?.length ?? 0, color: 'rgba(240,240,240,0.7)' },
  ];

  const filaEspera = agenda?.filter((a) => ['pendente', 'confirmado'].includes(a.status)) || [];

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F0F0F0', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Lava Kuat
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.45)', margin: 0 }}>
          Atualização automática a cada 30s
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {statCards.map((s) => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: s.color, margin: '0 0 6px', letterSpacing: '-0.03em' }}>
              {s.value}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.5)', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Boxes */}
      <p className="section-label">Boxes</p>
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse" style={{ height: '140px' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {boxes?.map((box) => (
            <BoxCard key={box.id} box={box} onUpdate={(id, status) => updateBox({ id, status })} />
          ))}
        </div>
      )}

      {/* Fila de espera */}
      {filaEspera.length > 0 && (
        <div>
          <p className="section-label">Fila de espera ({filaEspera.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filaEspera.map((ag) => (
              <div key={ag.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: '#F0F0F0', margin: '0 0 3px', fontSize: '0.9375rem' }}>{ag.cliente?.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'rgba(240,240,240,0.5)', margin: 0 }}>{ag.servico?.name}</p>
                  {ag.veiculo_placa && (
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      background: 'rgba(255,255,255,0.08)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: 'rgba(240,240,240,0.65)',
                      display: 'inline-block',
                      marginTop: '4px',
                    }}>
                      {ag.veiculo_placa}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'rgba(240,240,240,0.65)', flexShrink: 0 }}>
                  {new Date(ag.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
