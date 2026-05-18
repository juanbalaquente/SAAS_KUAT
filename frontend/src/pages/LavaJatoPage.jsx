import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import api from '../services/api';

const BOX_STATUS = {
  livre: { label: 'Livre', color: 'border-green-400 bg-green-50', dot: 'bg-green-500' },
  ocupado: { label: 'Ocupado', color: 'border-yellow-400 bg-yellow-50', dot: 'bg-yellow-500' },
  manutencao: { label: 'Manutenção', color: 'border-red-400 bg-red-50', dot: 'bg-red-500' },
};

function BoxCard({ box, onUpdate }) {
  const st = BOX_STATUS[box.status] || BOX_STATUS.livre;
  const ag = box.agendamento;

  return (
    <div className={`card border-2 ${st.color} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-gray-900">Box {box.numero}</h3>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
          {st.label}
        </span>
      </div>

      {ag && (
        <div className="text-sm text-gray-600 border-t border-gray-100 pt-3">
          <p className="font-medium text-gray-900">{ag.cliente?.name}</p>
          <p>{ag.servico?.name}</p>
          {ag.veiculo_placa && <p className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">{ag.veiculo_placa}</p>}
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        {box.status === 'livre' && (
          <button
            onClick={() => onUpdate(box.id, 'ocupado')}
            className="btn btn-primary text-xs py-1.5 flex-1"
          >
            Ocupar
          </button>
        )}
        {box.status === 'ocupado' && (
          <>
            <button
              onClick={() => onUpdate(box.id, 'livre')}
              className="btn btn-success text-xs py-1.5 flex-1"
            >
              ✓ Concluir
            </button>
            <button
              onClick={() => onUpdate(box.id, 'manutencao')}
              className="btn btn-danger text-xs py-1.5"
            >
              ⚠
            </button>
          </>
        )}
        {box.status === 'manutencao' && (
          <button
            onClick={() => onUpdate(box.id, 'livre')}
            className="btn btn-secondary text-xs py-1.5 flex-1"
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

  const livres = boxes?.filter((b) => b.status === 'livre').length ?? 0;
  const ocupados = boxes?.filter((b) => b.status === 'ocupado').length ?? 0;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🚗 Lava Kuat</h1>
        <p className="text-gray-500 mt-1">Atualização automática a cada 30s</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{livres}</p>
          <p className="text-sm text-gray-600 mt-1">Boxes Livres</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-yellow-600">{ocupados}</p>
          <p className="text-sm text-gray-600 mt-1">Em Lavagem</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-600">{boxes?.length ?? 0}</p>
          <p className="text-sm text-gray-600 mt-1">Total de Boxes</p>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Boxes</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {boxes?.map((box) => (
            <BoxCard key={box.id} box={box} onUpdate={(id, status) => updateBox({ id, status })} />
          ))}
        </div>
      )}

      {agenda && agenda.filter((a) => ['pendente', 'confirmado'].includes(a.status)).length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Fila de Espera</h2>
          <div className="space-y-3">
            {agenda
              .filter((a) => ['pendente', 'confirmado'].includes(a.status))
              .map((ag) => (
                <div key={ag.id} className="card flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{ag.cliente?.name}</p>
                    <p className="text-sm text-gray-500">{ag.servico?.name}</p>
                    {ag.veiculo_placa && (
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{ag.veiculo_placa}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700">
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
