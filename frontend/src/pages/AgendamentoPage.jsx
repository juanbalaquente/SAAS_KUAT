import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

const LOJA_NAMES = {
  barbearia_kuat: { name: 'Barbearia Kuat', emoji: '✂️', color: 'bg-orange-500' },
  lava_kuat: { name: 'Lava Kuat', emoji: '🚗', color: 'bg-yellow-500' },
  adega_r1: { name: 'Adega R1', emoji: '🍷', color: 'bg-green-600' },
};

const clienteSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

const STEPS = ['Serviço', 'Profissional', 'Data/Hora', 'Seus dados', 'Confirmação'];

export default function AgendamentoPage() {
  const { loja } = useParams();
  const navigate = useNavigate();
  const lojaInfo = LOJA_NAMES[loja] || { name: loja, emoji: '🏪', color: 'bg-gray-600' };

  const [step, setStep] = useState(0);
  const [selectedServico, setSelectedServico] = useState(null);
  const [selectedProfissional, setSelectedProfissional] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState(null);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(clienteSchema),
  });

  const { data: servicos } = useQuery({
    queryKey: ['servicos', loja],
    queryFn: () => api.get(`/lojas/${loja}/servicos`).then((r) => r.data.data),
  });

  const { data: disponibilidade } = useQuery({
    queryKey: ['disponibilidade', loja, selectedServico?.id, selectedDate, selectedProfissional?.id],
    queryFn: () => api.get(`/lojas/${loja}/disponibilidade`, {
      params: {
        servico_id: selectedServico?.id,
        data: selectedDate,
        profissional_id: selectedProfissional?.id || undefined,
      }
    }).then((r) => r.data.data),
    enabled: !!selectedServico && step >= 2,
  });

  const { mutate: agendar, isPending } = useMutation({
    mutationFn: (payload) => api.post(`/lojas/${loja}/agendar`, payload),
    onSuccess: (res) => navigate(`/confirmacao/${res.data.data.id}`),
  });

  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  const handleClienteSubmit = (clienteData) => {
    agendar({
      servico_id: selectedServico.id,
      profissional_id: selectedProfissional?.id || null,
      scheduled_at: `${selectedDate} ${selectedSlot}`,
      cliente: clienteData,
    });
  };

  const stepContent = [
    // Step 0: Serviço
    <div key="servico">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Escolha o serviço</h2>
      <div className="grid gap-3">
        {servicos?.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSelectedServico(s); setStep(1); }}
            className={`card text-left hover:border-blue-400 border-2 transition ${selectedServico?.id === s.id ? 'border-blue-500' : 'border-transparent'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-500">{s.duration_minutes} min</p>
              </div>
              <p className="text-lg font-bold text-green-700">
                {s.price_cents > 0 ? `R$${(s.price_cents / 100).toFixed(0)}` : 'Grátis'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Profissional
    <div key="profissional">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Escolha o profissional</h2>
      <div className="grid gap-3">
        <button
          onClick={() => { setSelectedProfissional(null); setStep(2); }}
          className="card text-left border-2 border-transparent hover:border-blue-400 transition"
        >
          <p className="font-semibold text-gray-900">Sem preferência</p>
          <p className="text-sm text-gray-500">Qualquer profissional disponível</p>
        </button>
        {disponibilidade?.profissionais?.map((p) => (
          <button
            key={p.id}
            onClick={() => { setSelectedProfissional(p); setStep(2); }}
            className="card text-left border-2 border-transparent hover:border-blue-400 transition"
          >
            <p className="font-semibold text-gray-900">{p.name}</p>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Data/Hora
    <div key="dataHora">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Escolha data e horário</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {days.map((day) => {
          const d = format(day, 'yyyy-MM-dd');
          const isSelected = d === selectedDate;
          return (
            <button
              key={d}
              onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-center border-2 transition ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-xs text-gray-500">{format(day, 'EEE', { locale: ptBR })}</p>
              <p className="font-bold text-gray-900">{format(day, 'd')}</p>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {disponibilidade?.slots?.map((slot) => (
          <button
            key={slot}
            onClick={() => setSelectedSlot(slot)}
            className={`py-2 rounded-lg text-sm font-medium border-2 transition ${
              selectedSlot === slot
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {slot}
          </button>
        ))}
        {(!disponibilidade?.slots || disponibilidade.slots.length === 0) && (
          <p className="col-span-4 text-gray-500 text-center py-8">Nenhum horário disponível nesta data.</p>
        )}
      </div>
      <button
        disabled={!selectedSlot}
        onClick={() => setStep(3)}
        className="btn-primary mt-4 w-full justify-center py-3 disabled:opacity-50"
      >
        Continuar
      </button>
    </div>,

    // Step 3: Dados cliente
    <div key="dados">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Seus dados</h2>
      <form onSubmit={handleSubmit(handleClienteSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
          <input
            {...register('name')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp *</label>
          <input
            {...register('phone')}
            placeholder="(99) 99999-9999"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail (opcional)</label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full justify-center py-3 text-base"
        >
          {isPending ? 'Agendando...' : 'Confirmar Agendamento'}
        </button>
      </form>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${lojaInfo.color} text-white py-8 px-4`}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{lojaInfo.emoji}</span>
            <h1 className="text-2xl font-bold">{lojaInfo.name}</h1>
          </div>
          <p className="text-white/80 text-sm">Agendar serviço</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                i <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {selectedServico && step > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm">
            <span className="font-semibold">{selectedServico.name}</span>
            {selectedProfissional && <span className="text-gray-600"> • {selectedProfissional.name}</span>}
            {selectedSlot && <span className="text-blue-700 font-medium"> • {selectedDate} às {selectedSlot}</span>}
          </div>
        )}

        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
            ← Voltar
          </button>
        )}

        {stepContent[step]}
      </div>
    </div>
  );
}
