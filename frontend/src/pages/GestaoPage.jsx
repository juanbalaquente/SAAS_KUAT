import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import api from '../services/api';

const LOJAS = [
  { id: 1, label: 'Barbearia Kuat', slug: 'barbearia_kuat' },
  { id: 2, label: 'Lava Kuat',      slug: 'lava_kuat'      },
  { id: 3, label: 'Adega R1',       slug: 'adega_r1'       },
];

const inputStyle = {
  width: '100%', padding: '9px 12px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: '#F0F0F0', fontFamily: 'inherit',
  fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
};
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'rgba(240,240,240,0.55)', marginBottom: '5px' };
const thStyle    = { padding: '10px 14px', textAlign: 'left', color: 'rgba(240,240,240,0.35)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle    = { padding: '11px 14px', borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(240,240,240,0.8)', fontSize: '0.875rem' };
const fmt        = (c) => c != null ? `R$${(c / 100).toFixed(2)}` : '—';

function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', width: '100%', maxWidth: '500px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: '#F0F0F0' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(240,240,240,0.4)', fontSize: '1.25rem', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return <div style={{ marginBottom: '14px' }}><label style={labelStyle}>{label}</label>{children}</div>;
}

function BtnPrimary({ onClick, children, disabled, type = 'button' }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #4A90D9, #2E6BB5)', color: '#F0F0F0', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  );
}
function BtnGhost({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(240,240,240,0.6)', fontFamily: 'inherit', fontSize: '0.8125rem', cursor: 'pointer' }}>
      {children}
    </button>
  );
}
function BtnDanger({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.08)', color: '#F87171', fontFamily: 'inherit', fontSize: '0.8125rem', cursor: 'pointer' }}>
      {children}
    </button>
  );
}

// ─────────────────────── SERVIÇOS ───────────────────────
function ServicosTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | 'novo' | {id, ...}
  const [form, setForm]   = useState({});

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos'],
    queryFn: () => api.get('/servicos').then((r) => r.data.data),
  });

  const [erroServico, setErroServico] = useState('');

  const save = useMutation({
    mutationFn: (d) => d.id ? api.put(`/servicos/${d.id}`, d) : api.post('/servicos', d),
    onSuccess: () => { qc.invalidateQueries(['servicos']); setModal(null); setErroServico(''); },
    onError: (e) => setErroServico(e.response?.data?.message || 'Erro ao salvar.'),
  });
  const del = useMutation({
    mutationFn: (id) => api.delete(`/servicos/${id}`),
    onSuccess: () => qc.invalidateQueries(['servicos']),
    onError: () => alert('Erro ao excluir serviço.'),
  });

  const openNovo = () => { setForm({ ativo: true }); setModal('novo'); };
  const openEdit = (s) => { setForm({ ...s, loja_id: s.loja_id }); setModal(s); };
  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <BtnPrimary onClick={openNovo}>+ Novo serviço</BtnPrimary>
      </div>
      <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {['Serviço', 'Loja', 'Duração', 'Preço', 'Status', ''].map((h) => <th key={h} style={thStyle}>{h}</th>)}
          </tr></thead>
          <tbody>
            {servicos.map((s) => (
              <tr key={s.id}>
                <td style={{ ...tdStyle, color: '#F0F0F0', fontWeight: 500 }}>{s.name}</td>
                <td style={tdStyle}>{s.loja?.name || LOJAS.find((l) => l.id === s.loja_id)?.label}</td>
                <td style={tdStyle}>{s.duration_minutes} min</td>
                <td style={tdStyle}>{fmt(s.price_cents)}</td>
                <td style={tdStyle}>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '5px', fontWeight: 600, color: s.ativo ? '#34D399' : '#F87171', background: s.ativo ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)' }}>
                    {s.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ ...tdStyle, display: 'flex', gap: '8px' }}>
                  <BtnGhost onClick={() => openEdit(s)}>Editar</BtnGhost>
                  <BtnDanger onClick={() => { if (confirm('Excluir serviço?')) del.mutate(s.id); }}>Excluir</BtnDanger>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'novo' ? 'Novo serviço' : 'Editar serviço'} onClose={() => setModal(null)}>
          <FormField label="Nome do serviço">
            <input style={inputStyle} value={form.name || ''} onChange={f('name')} placeholder="Ex: Corte masculino" />
          </FormField>
          <FormField label="Loja">
            <select style={inputStyle} value={form.loja_id || ''} onChange={f('loja_id')}>
              <option value="" style={{ background: '#1C2128' }}>Selecionar...</option>
              {LOJAS.map((l) => <option key={l.id} value={l.id} style={{ background: '#1C2128' }}>{l.label}</option>)}
            </select>
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Duração (minutos)">
              <input style={inputStyle} type="number" value={form.duration_minutes || ''} onChange={f('duration_minutes')} placeholder="30" />
            </FormField>
            <FormField label="Preço (centavos)">
              <input style={inputStyle} type="number" value={form.price_cents || ''} onChange={f('price_cents')} placeholder="3500" />
              {form.price_cents > 0 && <p style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.35)', margin: '3px 0 0' }}>= {fmt(Number(form.price_cents))}</p>}
            </FormField>
          </div>
          <FormField label="Status">
            <select style={inputStyle} value={form.ativo ? '1' : '0'} onChange={(e) => setForm((p) => ({ ...p, ativo: e.target.value === '1' }))}>
              <option value="1" style={{ background: '#1C2128' }}>Ativo</option>
              <option value="0" style={{ background: '#1C2128' }}>Inativo</option>
            </select>
          </FormField>
          {erroServico && <p style={{ color: '#F87171', fontSize: '0.8125rem', marginBottom: '8px' }}>{erroServico}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <BtnGhost onClick={() => setModal(null)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={() => save.mutate(form)} disabled={save.isPending}>
              {save.isPending ? 'Salvando...' : 'Salvar'}
            </BtnPrimary>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─────────────────────── PROFISSIONAIS ───────────────────────
function ProfissionaisTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState({});

  const { data: profissionais = [] } = useQuery({
    queryKey: ['profissionais'],
    queryFn: () => api.get('/profissionais').then((r) => r.data.data),
  });

  const [erroProf, setErroProf] = useState('');

  const save = useMutation({
    mutationFn: (d) => d.id ? api.put(`/profissionais/${d.id}`, d) : api.post('/profissionais', d),
    onSuccess: () => { qc.invalidateQueries(['profissionais']); setModal(null); setErroProf(''); },
    onError: (e) => setErroProf(e.response?.data?.message || 'Erro ao salvar.'),
  });
  const del = useMutation({
    mutationFn: (id) => api.delete(`/profissionais/${id}`),
    onSuccess: () => qc.invalidateQueries(['profissionais']),
    onError: () => alert('Erro ao remover profissional.'),
  });

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <BtnPrimary onClick={() => { setForm({ ativo: true }); setModal('novo'); }}>+ Novo profissional</BtnPrimary>
      </div>
      <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {['Nome', 'Loja', 'Status', ''].map((h) => <th key={h} style={thStyle}>{h}</th>)}
          </tr></thead>
          <tbody>
            {profissionais.map((p) => (
              <tr key={p.id}>
                <td style={{ ...tdStyle, color: '#F0F0F0', fontWeight: 500 }}>{p.name}</td>
                <td style={tdStyle}>{p.loja?.name || LOJAS.find((l) => l.id === p.loja_id)?.label}</td>
                <td style={tdStyle}>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '5px', fontWeight: 600, color: p.ativo ? '#34D399' : '#F87171', background: p.ativo ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)' }}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ ...tdStyle, display: 'flex', gap: '8px' }}>
                  <BtnGhost onClick={() => { setForm({ ...p }); setModal(p); }}>Editar</BtnGhost>
                  <BtnDanger onClick={() => { if (confirm('Remover profissional?')) del.mutate(p.id); }}>Remover</BtnDanger>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'novo' ? 'Novo profissional' : 'Editar profissional'} onClose={() => setModal(null)}>
          <FormField label="Nome">
            <input style={inputStyle} value={form.name || ''} onChange={f('name')} placeholder="Nome completo" />
          </FormField>
          <FormField label="Loja">
            <select style={inputStyle} value={form.loja_id || ''} onChange={f('loja_id')}>
              <option value="" style={{ background: '#1C2128' }}>Selecionar...</option>
              {LOJAS.map((l) => <option key={l.id} value={l.id} style={{ background: '#1C2128' }}>{l.label}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select style={inputStyle} value={form.ativo ? '1' : '0'} onChange={(e) => setForm((p) => ({ ...p, ativo: e.target.value === '1' }))}>
              <option value="1" style={{ background: '#1C2128' }}>Ativo</option>
              <option value="0" style={{ background: '#1C2128' }}>Inativo</option>
            </select>
          </FormField>
          {erroProf && <p style={{ color: '#F87171', fontSize: '0.8125rem', marginBottom: '8px' }}>{erroProf}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <BtnGhost onClick={() => setModal(null)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={() => save.mutate(form)} disabled={save.isPending}>
              {save.isPending ? 'Salvando...' : 'Salvar'}
            </BtnPrimary>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─────────────────────── PRODUTOS ───────────────────────
function ProdutosTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState({});
  const [showInativos, setShowInativos] = useState(false);

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-admin', showInativos],
    queryFn: () => api.get('/produtos', { params: { todos: showInativos ? 1 : 0 } }).then((r) => r.data.data),
  });

  const [erroProd, setErroProd] = useState('');

  const save = useMutation({
    mutationFn: (d) => d.id ? api.put(`/produtos/${d.id}`, d) : api.post('/produtos', d),
    onSuccess: () => { qc.invalidateQueries(['produtos-admin']); setModal(null); setErroProd(''); },
    onError: (e) => setErroProd(e.response?.data?.message || 'Erro ao salvar.'),
  });
  const del = useMutation({
    mutationFn: (id) => api.delete(`/produtos/${id}`),
    onSuccess: () => qc.invalidateQueries(['produtos-admin']),
    onError: () => alert('Erro ao desativar produto.'),
  });

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'rgba(240,240,240,0.5)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showInativos} onChange={(e) => setShowInativos(e.target.checked)} />
          Mostrar inativos
        </label>
        <BtnPrimary onClick={() => { setForm({ ativo: true, estoque_atual: 0, estoque_minimo: 5 }); setModal('novo'); }}>+ Novo produto</BtnPrimary>
      </div>
      <div style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {['Produto', 'Categoria', 'Preço', 'Estoque', 'Mínimo', 'Status', ''].map((h) => <th key={h} style={thStyle}>{h}</th>)}
          </tr></thead>
          <tbody>
            {produtos.map((p) => {
              const baixo = p.estoque_atual <= p.estoque_minimo;
              return (
                <tr key={p.id}>
                  <td style={{ ...tdStyle, color: '#F0F0F0', fontWeight: 500 }}>{p.nome}</td>
                  <td style={tdStyle}>{p.categoria}</td>
                  <td style={tdStyle}>{fmt(p.preco_cents)}</td>
                  <td style={{ ...tdStyle, color: baixo ? '#F0B429' : 'rgba(240,240,240,0.8)', fontWeight: baixo ? 700 : 400 }}>{p.estoque_atual}{baixo && ' ⚠'}</td>
                  <td style={tdStyle}>{p.estoque_minimo}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '5px', fontWeight: 600, color: p.ativo ? '#34D399' : '#F87171', background: p.ativo ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)' }}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, display: 'flex', gap: '8px' }}>
                    <BtnGhost onClick={() => { setForm({ ...p }); setModal(p); }}>Editar</BtnGhost>
                    <BtnDanger onClick={() => { if (confirm('Desativar produto?')) del.mutate(p.id); }}>Desativar</BtnDanger>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'novo' ? 'Novo produto' : 'Editar produto'} onClose={() => setModal(null)}>
          <FormField label="Nome do produto">
            <input style={inputStyle} value={form.nome || ''} onChange={f('nome')} placeholder="Ex: Heineken 600ml" />
          </FormField>
          <FormField label="Categoria">
            <input style={inputStyle} value={form.categoria || ''} onChange={f('categoria')} placeholder="Ex: Cerveja, Vinho, Destilado" />
          </FormField>
          <FormField label="Código de barras (opcional)">
            <input style={inputStyle} value={form.codigo_barras || ''} onChange={f('codigo_barras')} placeholder="7891000315507" />
          </FormField>
          <FormField label="Preço (centavos)">
            <input style={inputStyle} type="number" value={form.preco_cents || ''} onChange={f('preco_cents')} placeholder="1200" />
            {form.preco_cents > 0 && <p style={{ fontSize: '0.75rem', color: 'rgba(240,240,240,0.35)', margin: '3px 0 0' }}>= {fmt(Number(form.preco_cents))}</p>}
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Estoque atual">
              <input style={inputStyle} type="number" value={form.estoque_atual ?? ''} onChange={f('estoque_atual')} placeholder="0" />
            </FormField>
            <FormField label="Estoque mínimo">
              <input style={inputStyle} type="number" value={form.estoque_minimo ?? ''} onChange={f('estoque_minimo')} placeholder="5" />
            </FormField>
          </div>
          <FormField label="Status">
            <select style={inputStyle} value={form.ativo ? '1' : '0'} onChange={(e) => setForm((p) => ({ ...p, ativo: e.target.value === '1' }))}>
              <option value="1" style={{ background: '#1C2128' }}>Ativo</option>
              <option value="0" style={{ background: '#1C2128' }}>Inativo</option>
            </select>
          </FormField>
          {erroProd && <p style={{ color: '#F87171', fontSize: '0.8125rem', marginBottom: '8px' }}>{erroProd}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <BtnGhost onClick={() => setModal(null)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={() => save.mutate(form)} disabled={save.isPending}>
              {save.isPending ? 'Salvando...' : 'Salvar'}
            </BtnPrimary>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─────────────────────── PÁGINA PRINCIPAL ───────────────────────
const TABS = [
  { id: 'servicos',      label: 'Serviços',      Component: ServicosTab      },
  { id: 'profissionais', label: 'Profissionais',  Component: ProfissionaisTab },
  { id: 'produtos',      label: 'Produtos (Adega)', Component: ProdutosTab  },
];

export default function GestaoPage() {
  const [tab, setTab] = useState('servicos');
  const ActiveComponent = TABS.find((t) => t.id === tab)?.Component;

  return (
    <Layout>
      <div style={{ maxWidth: '1100px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#F0F0F0', margin: '0 0 4px' }}>Gestão</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(240,240,240,0.4)', margin: 0 }}>Cadastros e configurações</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '24px' }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 18px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '0.875rem', fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? '#F0F0F0' : 'rgba(240,240,240,0.45)',
              borderBottom: tab === t.id ? '2px solid #4A90D9' : '2px solid transparent',
              marginBottom: '-1px', transition: 'color 0.15s',
            }}>{t.label}</button>
          ))}
        </div>

        {ActiveComponent && <ActiveComponent />}
      </div>
    </Layout>
  );
}
