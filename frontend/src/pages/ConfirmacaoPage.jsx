import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../services/api';

export default function ConfirmacaoPage() {
  const { id } = useParams();
  const [cancelado, setCancelado] = useState(false);

  const { data: ag, isLoading } = useQuery({
    queryKey: ['agendamento-publico', id],
    queryFn: () => api.get(`/agendamentos/${id}/publico`).then((r) => r.data.data),
  });

  const { mutate: cancelar, isPending } = useMutation({
    mutationFn: () => api.patch(`/agendamentos/${id}/cancelar`),
    onSuccess: () => setCancelado(true),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!ag) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Agendamento não encontrado.</p>
          <Link to="/" className="btn-primary">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  const hora = new Date(ag.scheduled_at).toLocaleString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          {cancelado || ag.status === 'cancelado' ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">❌</div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Agendamento cancelado</h1>
              <p className="text-gray-500 text-sm">Seu agendamento foi cancelado com sucesso.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Agendamento confirmado!</h1>
              <p className="text-gray-500 text-sm mb-6">Você receberá uma confirmação pelo WhatsApp.</p>

              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Cliente</span>
                  <span className="text-gray-900 font-medium text-sm">{ag.cliente?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Serviço</span>
                  <span className="text-gray-900 font-medium text-sm">{ag.servico?.name}</span>
                </div>
                {ag.profissional && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Profissional</span>
                    <span className="text-gray-900 font-medium text-sm">{ag.profissional.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Horário</span>
                  <span className="text-gray-900 font-medium text-sm capitalize">{hora}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Valor</span>
                  <span className="text-green-700 font-bold text-sm">
                    {ag.servico?.price_cents > 0 ? `R$${(ag.servico.price_cents / 100).toFixed(2)}` : 'Grátis'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2 mb-4 font-mono">
                Código: #{String(ag.id).padStart(6, '0')}
              </div>

              {['pendente', 'confirmado'].includes(ag.status) && (
                <button
                  onClick={() => cancelar()}
                  disabled={isPending}
                  className="btn-danger w-full justify-center"
                >
                  {isPending ? 'Cancelando...' : 'Cancelar agendamento'}
                </button>
              )}
            </>
          )}

          <Link to="/" className="block mt-4 text-sm text-blue-600 hover:underline">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
