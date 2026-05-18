import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';

const PAGAMENTOS = ['Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'PIX'];

export default function PDVModal({ onClose }) {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [pagamento, setPagamento] = useState('PIX');
  const [tipo, setTipo] = useState('balcao');
  const [success, setSuccess] = useState(false);

  const { data: produtos } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => api.get('/adega/estoque').then((r) => r.data.data),
  });

  const { mutate: finalizar, isPending } = useMutation({
    mutationFn: (payload) => api.post('/adega/pdv', payload),
    onSuccess: () => { setSuccess(true); setTimeout(onClose, 2000); },
  });

  const filtered = produtos?.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.codigo_barras || '').includes(search)
  ) || [];

  const addToCart = (produto) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === produto.id);
      if (existing) return prev.map((i) => i.id === produto.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...produto, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const setQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  };

  const total = cart.reduce((sum, i) => sum + i.preco_cents * i.qty, 0);

  const handleFinalizar = () => {
    finalizar({
      tipo,
      pagamento,
      itens: cart.map((i) => ({ produto_id: i.id, quantidade: i.qty, preco_unitario_cents: i.preco_cents })),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">💳 PDV — Adega R1</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {success ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl mb-4">✅</p>
              <p className="text-xl font-bold text-green-700">Venda finalizada!</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto border-r">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto ou código de barras..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                {filtered.slice(0, 20).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
                  >
                    <p className="font-medium text-gray-900 text-sm">{p.nome}</p>
                    <p className="text-green-700 font-semibold text-sm">R${(p.preco_cents / 100).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Estoque: {p.estoque_atual}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-80 p-6 flex flex-col">
              <h3 className="font-semibold text-gray-700 mb-3">Carrinho</h3>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {cart.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center mt-8">Nenhum item adicionado</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.nome}</p>
                        <p className="text-xs text-gray-500">R${(item.preco_cents / 100).toFixed(2)} un</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setQty(item.id, item.qty - 1)} className="w-7 h-7 rounded border text-gray-600 hover:bg-gray-100 flex items-center justify-center">-</button>
                        <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                        <button onClick={() => setQty(item.id, item.qty + 1)} className="w-7 h-7 rounded border text-gray-600 hover:bg-gray-100 flex items-center justify-center">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 text-lg leading-none">&times;</button>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-700">R${(total / 100).toFixed(2)}</span>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Tipo</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['balcao', 'delivery'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTipo(t)}
                        className={`py-1.5 rounded-lg text-sm font-medium border transition ${tipo === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {t === 'balcao' ? '🏪 Balcão' : '🛵 Delivery'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Pagamento</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PAGAMENTOS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPagamento(p)}
                        className={`py-1.5 rounded-lg text-xs font-medium border transition ${pagamento === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleFinalizar}
                  disabled={cart.length === 0 || isPending}
                  className="w-full btn-primary justify-center py-3 text-base"
                >
                  {isPending ? 'Processando...' : 'Finalizar Venda'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
