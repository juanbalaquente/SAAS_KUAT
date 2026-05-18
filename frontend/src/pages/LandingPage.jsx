import { Link } from 'react-router-dom';

const lojas = [
  {
    slug: 'barbearia_kuat',
    name: 'Barbearia Kuat',
    emoji: '✂️',
    color: '#E8593C',
    bg: 'bg-orange-500',
    desc: 'Cortes masculinos, barba e tratamentos. Profissionais experientes, ambiente moderno.',
    servicos: ['Corte masculino', 'Barba', 'Corte + Barba', 'Sobrancelha'],
  },
  {
    slug: 'lava_kuat',
    name: 'Lava Kuat',
    emoji: '🚗',
    color: '#E8A020',
    bg: 'bg-yellow-500',
    desc: 'Lavagem e higienização completa do seu veículo com cuidado e agilidade.',
    servicos: ['Lavagem simples', 'Lavagem completa', 'Premium + polimento', 'Higienização interna'],
  },
  {
    slug: 'adega_r1',
    name: 'Adega R1',
    emoji: '🍷',
    color: '#4CAF70',
    bg: 'bg-green-600',
    desc: 'Cervejas, vinhos e destilados selecionados. Retirada na loja ou delivery.',
    servicos: ['Retirada na loja', 'Delivery até 5km', 'Delivery 5–10km'],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="text-center py-20 px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">SAAS Kuat</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          O sistema completo do grupo Kuat. Agende seu horário, acompanhe seu pedido.
        </p>
      </header>

      <section className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {lojas.map((loja) => (
          <div key={loja.slug} className="bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-750 transition">
            <div className={`${loja.bg} px-6 py-8`}>
              <span className="text-5xl">{loja.emoji}</span>
              <h2 className="text-2xl font-bold mt-3">{loja.name}</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-400 mb-4 text-sm">{loja.desc}</p>
              <ul className="space-y-1 mb-6">
                {loja.servicos.map((s) => (
                  <li key={s} className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="text-green-400">✓</span> {s}
                  </li>
                ))}
              </ul>
              <Link
                to={`/agendar/${loja.slug}`}
                className={`block text-center py-3 rounded-xl font-semibold text-white transition hover:opacity-90`}
                style={{ backgroundColor: loja.color }}
              >
                Agendar agora
              </Link>
            </div>
          </div>
        ))}
      </section>

      <footer className="text-center text-gray-600 pb-8 text-sm">
        <Link to="/login" className="text-gray-500 hover:text-gray-400">Área administrativa</Link>
      </footer>
    </div>
  );
}
