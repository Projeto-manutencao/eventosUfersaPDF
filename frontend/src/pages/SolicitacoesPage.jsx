import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../services/api';

const CORES = {
  fundoAzulTotal: '#002244',
  azulUfersa: '#003366',
  cinzaBotao: '#e2e8f0',
  azulLetraBotao: '#003366',
  vermelhoErro: '#c0392b',
  textoEscuro: '#2c3e50',
  cinzaTexto: '#7f8c8d',
};

const STATUS = [
  ['aberta', 'Aberta'],
  ['em_analise', 'Em Analise'],
  ['em_desenvolvimento', 'Em Desenvolvimento'],
  ['resolvida', 'Resolvida'],
  ['fechada', 'Fechada'],
];

export default function SolicitacoesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState('');
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const carregarSolicitacoes = async () => {
    setCarregando(true);
    setErro('');

    try {
      const params = new URLSearchParams();
      if (statusFiltro) params.append('status', statusFiltro);
      if (busca) params.append('search', busca);
      params.append('ordering', '-criado_em');

      const response = await api.get(`/solicitacoes/?${params.toString()}`);
      const data = response.data;
      setSolicitacoes(Array.isArray(data) ? data : data.results || []);
    } catch {
      setErro('Nao foi possivel carregar as solicitacoes.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(carregarSolicitacoes, 250);
    return () => clearTimeout(timer);
  }, [statusFiltro, busca]);

  const atualizarStatus = async (solicitacao, novoStatus) => {
    try {
      const response = await api.patch(`/solicitacoes/${solicitacao.id}/`, { status: novoStatus });
      setSolicitacoes((atuais) =>
        atuais.map((item) => (item.id === solicitacao.id ? response.data : item))
      );
    } catch {
      alert('Nao foi possivel atualizar o status.');
    }
  };

  const sair = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ padding: '40px', fontFamily: '"Segoe UI", Roboto, sans-serif', backgroundColor: CORES.fundoAzulTotal, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '28px', backgroundColor: 'white', padding: '20px 30px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', borderLeft: `6px solid ${CORES.azulUfersa}`, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: CORES.azulUfersa, margin: 0, fontSize: '26px', fontWeight: 700 }}>Solicitacoes de Manutencao</h1>
          <p style={{ margin: '6px 0 0', color: '#52616f', fontSize: '14px' }}>{user?.email} - Administrador</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/eventos" style={botaoLink}>Eventos</Link>
          <button onClick={sair} style={botaoSecundario}>Sair</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', backgroundColor: 'white', padding: '18px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por protocolo, titulo, descricao ou email"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: '260px' }}
        />
        <select value={statusFiltro} onChange={(event) => setStatusFiltro(event.target.value)} style={{ ...inputStyle, width: '230px' }}>
          <option value="">Status: Todos</option>
          {STATUS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {erro && <div style={alertaErro}>{erro}</div>}

      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e6f0fa', backgroundColor: '#fcfdfe' }}>
              <Th>Protocolo</Th>
              <Th>Titulo</Th>
              <Th>Tipo</Th>
              <Th>Prioridade</Th>
              <Th>Status</Th>
              <Th>Email</Th>
              <Th>Criada Em</Th>
              <Th>Descricao</Th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan="8" style={tdVazio}>Buscando solicitacoes...</td></tr>
            ) : solicitacoes.length === 0 ? (
              <tr><td colSpan="8" style={tdVazio}>Nenhuma solicitacao encontrada.</td></tr>
            ) : (
              solicitacoes.map((solicitacao) => (
                <tr key={solicitacao.id} style={{ borderBottom: '1px solid #efefef', verticalAlign: 'top' }}>
                  <Td strong>{solicitacao.protocolo}</Td>
                  <Td strong>{solicitacao.titulo}</Td>
                  <Td>{solicitacao.tipo_display || solicitacao.tipo}</Td>
                  <Td>{solicitacao.prioridade_display || solicitacao.prioridade}</Td>
                  <td style={{ padding: '14px', minWidth: '190px' }}>
                    <select
                      value={solicitacao.status}
                      onChange={(event) => atualizarStatus(solicitacao, event.target.value)}
                      style={inputStyle}
                    >
                      {STATUS.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <Td>{solicitacao.email_contato || '-'}</Td>
                  <Td>{formatarData(solicitacao.criado_em)}</Td>
                  <td style={{ padding: '14px', color: '#4a5568', minWidth: '280px', whiteSpace: 'pre-wrap' }}>{solicitacao.descricao}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th style={{ padding: '14px', color: CORES.azulUfersa, fontWeight: 700 }}>{children}</th>;
}

function Td({ children, strong = false }) {
  return <td style={{ padding: '14px', color: strong ? CORES.textoEscuro : '#4a5568', fontWeight: strong ? 700 : 500, whiteSpace: 'nowrap' }}>{children}</td>;
}

function formatarData(dataIsoStr) {
  if (!dataIsoStr) return '-';
  try {
    const data = new Date(dataIsoStr);
    return `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return dataIsoStr;
  }
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  boxSizing: 'border-box',
  borderRadius: '6px',
  border: '1px solid #dcdfe6',
  fontSize: '14px',
  outline: 'none',
  backgroundColor: '#fafafa',
  color: CORES.textoEscuro,
  fontFamily: 'inherit',
};

const botaoSecundario = {
  padding: '12px 20px',
  backgroundColor: '#f4f6f8',
  color: CORES.azulLetraBotao,
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '14px',
};

const botaoLink = {
  ...botaoSecundario,
  backgroundColor: CORES.cinzaBotao,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
};

const alertaErro = {
  padding: '15px 20px',
  backgroundColor: '#fdedec',
  color: CORES.vermelhoErro,
  borderRadius: '6px',
  marginBottom: '25px',
  fontWeight: 700,
};

const tdVazio = {
  padding: '36px',
  textAlign: 'center',
  color: CORES.cinzaTexto,
  fontWeight: 600,
};
