import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';

const lojas = [
  { slug: 'barbearia_kuat', name: 'Barbearia Kuat', emoji: '✂️', color: 'bg-orange-500', to: '/barbearia' },
  { slug: 'lava_kuat', name: 'Lava Kuat', emoji: '🚗', color: 'bg-yellow-500', to: '/lavajato' },
  { slug: 'adega_r1', name: 'Adega R1', emoji: '🍷', color: 'bg-green-600', to: '/adega' },
];

function StatCard({ label, value, sub }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function LojaCard({ loja, data }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${loja.color} rounded-xl flex items-center justify-center text-2xl`}>
            {loja.emoji}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{loja.name}</h3>
            <p className="text-xs text-gray-500">Hoje</p>
          </div>
        </div>
        <Link to={loja.to} className="text-sm text-blue-600 hover:underline font-medium">
          Ver painel →
        </Link>
      </div>
      {data ? (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          {loja.slug === 'barbearia_kuat' && (
            <>
              <StatCard label="Agendamentos" value={data.agendamentos_hoje} />
              <StatCard label="Concluídos" value={data.concluidos} />
              <StatCard label="Faturamento" value={data.faturamento ? `R$${(data.faturamento / 100).toFixed(0)}` : 'R$0'} />
            </>
          )}
          {loja.slug === 'lava_kuat' && (
            <>
              <StatCard label="Boxes Livres" value={data.boxes_livres} sub={`de ${data.total_boxes}`} />
              <StatCard label="Agendamentos" value={data.agendamentos_hoje} />
              <StatCard label="Faturamento" value={data.faturamento ? `R$${(data.faturamento / 100).toFixed(0)}` : 'R$0'} />
            </>
          )}
          {loja.slug === 'adega_r1' && (
            <>
              <StatCard label="Vendas Hoje" value={data.vendas_hoje} />
              <StatCard label="Entregas" value={data.entregas_pendentes} sub="pendentes" />
              <StatCard label="Faturamento" value={data.faturamento ? `R$${(data.faturamento / 100).toFixed(0)}` : 'R$0'} />
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse text-center">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2" />
              <div className="h-3 bg-gray-100 rounded w-20 mx-auto" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: resumo, isLoading } = useQuery({
    queryKey: ['dashboard-resumo'],
    queryFn: () => api.get('/dashboard/resumo').then((r) => r.data.data),
    refetchInterval: 60000,
  });

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 capitalize">{hoje}</p>
      </div>

      {resumo?.geral && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-600">{resumo.geral.total_agendamentos_hoje ?? 0}</p>
            <p className="text-sm text-gray-600 mt-1">Agendamentos hoje</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">{resumo.geral.total_concluidos ?? 0}</p>
            <p className="text-sm text-gray-600 mt-1">Concluídos</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-yellow-600">{resumo.geral.alertas_estoque ?? 0}</p>
            <p className="text-sm text-gray-600 mt-1">Alertas estoque</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-purple-600">
              R${((resumo.geral.faturamento_total ?? 0) / 100).toFixed(0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Faturamento total</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
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
