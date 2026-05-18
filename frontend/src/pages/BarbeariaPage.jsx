import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import api from '../services/api';

const STATUS_LABELS = {
  pendente: { label: 'Pendente', color: 'bg-gray-100 text-gray-700' },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  em_atendimento: { label: 'Em atendimento', color: 'bg-yellow-100 text-yellow-700' },
  concluido: { label: 'Concluído', color: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

function AgendamentoCard({ ag, onStatus }) {
  const status = STATUS_LABELS[ag.status] || STATUS_LABELS.pendente;
  const hora = new Date(ag.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="card flex items-center gap-4">
      <div className="text-center min-w-[60px]">
        <p className="text-2xl font-bold text-gray-900">{hora}</p>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{ag.cliente?.name || 'Cliente'}</p>
        <p className="text-sm text-gray-500">{ag.servico?.name} • {ag.profissional?.name}</p>
      </div>
      <span className={`badge ${status.color}`}>{status.label}</span>
      <div className="flex gap-2">
        {ag.status === 'confirmado' && (
          <button
            onClick={() => onStatus(ag.id, 'em_atendimento')}
            className="btn btn-success text-sm py-1.5"
          >
            Iniciar
          </button>
        )}
        {ag.status === 'em_atendimento' && (
          <button
            onClick={() => onStatus(ag.id, 'concluido')}
            className="btn btn-primary text-sm py-1.5"
          >
            Concluir
          </button>
        )}
        {ag.status === 'pendente' && (
          <button
            onClick={() => onStatus(ag.id, 'confirmado')}
            className="btn btn-secondary text-sm py-1.5"
          >
            Confirmar
          </button>
        )}
      </div>
    </div>
  );
}

export default function BarbeariaPage() {
  const qc = useQueryClient();

  const { data: agenda, isLoading } = useQuery({
    queryKey: ['barbearia-agenda'],
    queryFn: () => api.get('/barbearia/agenda-hoje').then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/agendamentos/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['barbearia-agenda'] }),
  });

  const emAtendimento = agenda?.filter((a) => a.status === 'em_atendimento') || [];
  const proximoConfirmado = agenda?.find((a) => a.status === 'confirmado');
  const fila = agenda?.filter((a) => ['pendente', 'confirmado'].includes(a.status)) || [];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">✂️ Barbearia Kuat</h1>
        <p className="text-gray-500 mt-1">Agenda do dia</p>
      </div>

      {emAtendimento.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Em atendimento</h2>
          <div className="grid gap-3">
            {emAtendimento.map((ag) => (
              <AgendamentoCard key={ag.id} ag={ag} onStatus={(id, s) => updateStatus({ id, status: s })} />
            ))}
          </div>
        </div>
      )}

      {proximoConfirmado && (
        <div className="mb-6 p-6 rounded-2xl bg-blue-50 border-2 border-blue-200">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Próximo</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-gray-900">{proximoConfirmado.cliente?.name}</p>
              <p className="text-gray-600">{proximoConfirmado.servico?.name} • {proximoConfirmado.profissional?.name}</p>
              <p className="text-blue-600 font-medium mt-1">
                {new Date(proximoConfirmado.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button
              onClick={() => updateStatus({ id: proximoConfirmado.id, status: 'em_atendimento' })}
              className="btn-primary"
            >
              Iniciar Atendimento
            </button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Agenda completa ({agenda?.length ?? 0} agendamentos)
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : agenda?.length === 0 ? (
          <div className="card text-center text-gray-500 py-12">
            Nenhum agendamento para hoje.
          </div>
        ) : (
          <div className="space-y-3">
            {agenda?.map((ag) => (
              <AgendamentoCard key={ag.id} ag={ag} onStatus={(id, s) => updateStatus({ id, status: s })} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
