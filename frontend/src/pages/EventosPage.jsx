import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../services/api';

const CORES = {
  fundoAzulTotal: '#002244',
  azulUfersa: '#003366',
  cinzaBotao: '#e2e8f0',
  azulLetraBotao: '#003366',
  verdeSucesso: '#27ae60',
  vermelhoErro: '#c0392b',
  cinzaTexto: '#7f8c8d',
  textoEscuro: '#2c3e50',
};

const vazio = {
  titulo: '',
  organizador: '',
  capacidade: '',
  data_inicio: '',
  data_fim: '',
  local: '',
};

export default function EventosPage() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [form, setForm] = useState(vazio);
  const [id, setId] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('');
  const [ordenacao, setOrdenacao] = useState('-data_inicio');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erroMensagem, setErroMensagem] = useState('');

  const carregarEventos = async () => {
    setCarregando(true);
    setErroMensagem('');

    try {
      const params = new URLSearchParams();
      if (busca) params.append('search', busca);
      if (filtroAtivo) params.append('ativo', filtroAtivo);
      if (ordenacao) params.append('ordering', ordenacao);
      params.append('page', paginaAtual);

      const response = await api.get(`/eventos/?${params.toString()}`);
      const data = response.data;

      if (Array.isArray(data)) {
        setEventos(data);
        setTotalPaginas(1);
      } else {
        setEventos(data.results || []);
        setTotalPaginas(Math.max(1, Math.ceil((data.count || 0) / 20)));
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        setErroMensagem('Nao foi possivel carregar os eventos.');
      }
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    setPaginaAtual(1);
    const timer = setTimeout(carregarEventos, 300);
    return () => clearTimeout(timer);
  }, [busca, filtroAtivo, ordenacao]);

  useEffect(() => {
    carregarEventos();
  }, [paginaAtual]);

  const setCampo = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  };

  const limparFormulario = () => {
    setId(null);
    setForm(vazio);
  };

  const abrirModalParaCriar = () => {
    if (!isAdmin) return;
    limparFormulario();
    setModalAberto(true);
  };

  const abrirModalParaEditar = (evento) => {
    if (!isAdmin) return;
    setId(evento.id);
    setForm({
      titulo: evento.titulo || '',
      organizador: evento.organizador || '',
      capacidade: evento.capacidade ?? '',
      data_inicio: formatarParaInput(evento.data_inicio),
      data_fim: formatarParaInput(evento.data_fim),
      local: evento.local || '',
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    limparFormulario();
  };

  const salvarEvento = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    const dadosEvento = {
      ...form,
      capacidade: Number(form.capacidade),
    };

    try {
      if (id) {
        await api.put(`/eventos/${id}/`, dadosEvento);
      } else {
        await api.post('/eventos/', dadosEvento);
      }
      fecharModal();
      carregarEventos();
    } catch (error) {
      alert(error.response?.status === 403 ? 'Apenas administradores podem salvar eventos.' : 'Erro ao salvar o evento.');
    }
  };

  const deletarEvento = async (eventoId) => {
    if (!isAdmin || !window.confirm('Tem certeza que deseja remover este evento?')) return;

    try {
      await api.delete(`/eventos/${eventoId}/`);
      carregarEventos();
    } catch {
      alert('Erro ao remover o evento.');
    }
  };

  const sair = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ padding: '40px', fontFamily: '"Segoe UI", Roboto, sans-serif', backgroundColor: CORES.fundoAzulTotal, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '35px', backgroundColor: 'white', padding: '20px 30px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', borderLeft: `6px solid ${CORES.azulUfersa}`, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: CORES.azulUfersa, margin: 0, fontSize: '26px', fontWeight: '700' }}>EventosUfersaPDF</h1>
          <p style={{ margin: '6px 0 0', color: '#52616f', fontSize: '14px' }}>
            {user?.email} - {isAdmin ? 'Administrador' : 'Usuario comum'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {isAdmin ? (
            <Link to="/solicitacoes" style={linkBotao(CORES.cinzaBotao, CORES.azulLetraBotao)}>
              Solicitacoes
            </Link>
          ) : (
            <Link to="/solicitar" style={linkBotao('#fdedec', CORES.vermelhoErro)}>
              Solicitar Manutencao
            </Link>
          )}

          {isAdmin && (
            <button onClick={abrirModalParaCriar} style={botaoPrimario}>
              Novo Evento
            </button>
          )}

          <button onClick={sair} style={botaoSecundario}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', backgroundColor: 'white', padding: '18px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por titulo, local ou organizador"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: '250px' }}
        />
        <select value={filtroAtivo} onChange={(event) => setFiltroAtivo(event.target.value)} style={{ ...inputStyle, width: '220px' }}>
          <option value="">Status: Todos</option>
          <option value="true">Apenas Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <select value={ordenacao} onChange={(event) => setOrdenacao(event.target.value)} style={{ ...inputStyle, width: '220px' }}>
          <option value="-data_inicio">Data Inicio (Recente)</option>
          <option value="data_inicio">Data Inicio (Antigo)</option>
          <option value="-criado_em">Criado (Recente)</option>
          <option value="criado_em">Criado (Antigo)</option>
          <option value="titulo">Titulo (A-Z)</option>
          <option value="-titulo">Titulo (Z-A)</option>
        </select>
      </div>

      {erroMensagem && <div style={alertaErro}>{erroMensagem}</div>}

      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflowX: 'auto' }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', color: CORES.azulUfersa, fontSize: '20px' }}>Eventos Locais Registrados</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e6f0fa', backgroundColor: '#fcfdfe' }}>
              <Th>Titulo</Th>
              <Th>Organizador</Th>
              <Th align="center">Capacidade</Th>
              <Th align="center">Status</Th>
              <Th>Periodo</Th>
              <Th>Local</Th>
              <Th>Criado Em</Th>
              {isAdmin && <Th align="center">Acoes</Th>}
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} style={tdVazio}>Buscando dados...</td>
              </tr>
            ) : eventos.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} style={tdVazio}>Nenhum evento encontrado.</td>
              </tr>
            ) : (
              eventos.map((evento) => {
                const statusInfo = obterStatusEvento(evento);
                return (
                  <tr key={evento.id} style={{ borderBottom: '1px solid #efefef' }}>
                    <Td strong>{evento.titulo}</Td>
                    <Td>{evento.organizador || '-'}</Td>
                    <Td align="center">{evento.capacidade ?? 0} vagas</Td>
                    <Td align="center">
                      <span style={{ padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, backgroundColor: statusInfo.corFundo, color: statusInfo.corTexto }}>
                        {statusInfo.texto}
                      </span>
                    </Td>
                    <Td>{formatarExibicaoTabela(evento.data_inicio)}{evento.data_fim && ` - ${formatarExibicaoTabela(evento.data_fim)}`}</Td>
                    <Td>{evento.local}</Td>
                    <Td>{formatarCriadoEm(evento.criado_em)}</Td>
                    {isAdmin && (
                      <Td align="center">
                        <button onClick={() => abrirModalParaEditar(evento)} style={{ ...botaoTabela, marginRight: '8px' }}>Editar</button>
                        <button onClick={() => deletarEvento(evento.id)} style={{ ...botaoTabela, backgroundColor: '#fdedec', color: CORES.vermelhoErro }}>Excluir</button>
                      </Td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {totalPaginas > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setPaginaAtual((page) => Math.max(1, page - 1))} disabled={paginaAtual === 1} style={botaoSecundario}>Anterior</button>
            <span style={{ color: CORES.textoEscuro, fontWeight: 600 }}>Pagina {paginaAtual} de {totalPaginas}</span>
            <button onClick={() => setPaginaAtual((page) => Math.min(totalPaginas, page + 1))} disabled={paginaAtual >= totalPaginas} style={botaoSecundario}>Proxima</button>
          </div>
        )}
      </div>

      {modalAberto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '480px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', borderTop: `8px solid ${CORES.azulUfersa}` }}>
            <h3 style={{ marginTop: 0, marginBottom: '22px', color: CORES.azulUfersa, fontSize: '20px' }}>{id ? 'Editar Evento' : 'Novo Evento'}</h3>
            <form onSubmit={salvarEvento}>
              <Campo label="Titulo do Evento" value={form.titulo} onChange={(valor) => setCampo('titulo', valor)} required />
              <Campo label="Organizador / Departamento" value={form.organizador} onChange={(valor) => setCampo('organizador', valor)} required />
              <Campo label="Capacidade Maxima" type="number" min="0" value={form.capacidade} onChange={(valor) => setCampo('capacidade', valor)} required />
              <div style={{ display: 'flex', gap: '12px' }}>
                <Campo label="Data de Inicio" type="date" value={form.data_inicio} onChange={(valor) => setCampo('data_inicio', valor)} required />
                <Campo label="Data de Fim" type="date" value={form.data_fim} onChange={(valor) => setCampo('data_fim', valor)} required />
              </div>
              <Campo label="Local do Evento" value={form.local} onChange={(valor) => setCampo('local', valor)} required />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={fecharModal} style={botaoSecundario}>Cancelar</button>
                <button type="submit" style={botaoPrimario}>{id ? 'Salvar Alteracoes' : 'Confirmar Cadastro'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Campo({ label, value, onChange, type = 'text', ...props }) {
  return (
    <div style={{ marginBottom: '16px', flex: 1 }}>
      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, color: CORES.textoEscuro, fontSize: '14px' }}>{label}</label>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle} {...props} />
    </div>
  );
}

function Th({ children, align = 'left' }) {
  return <th style={{ padding: '14px', color: CORES.azulUfersa, fontWeight: 700, textAlign: align }}>{children}</th>;
}

function Td({ children, align = 'left', strong = false }) {
  return <td style={{ padding: '14px', color: strong ? CORES.textoEscuro : '#4a5568', textAlign: align, fontWeight: strong ? 700 : 500, whiteSpace: 'nowrap' }}>{children}</td>;
}

function obterStatusEvento(evento) {
  if (evento.ativo === false) {
    return { texto: 'Inativo', corFundo: '#fdedec', corTexto: CORES.vermelhoErro };
  }

  if (evento.data_fim) {
    const apenasDataFim = evento.data_fim.includes('T') ? evento.data_fim.split('T')[0] : evento.data_fim;
    const [ano, mes, dia] = apenasDataFim.split('-');
    const dataFimEvento = new Date(Number(ano), Number(mes) - 1, Number(dia), 23, 59, 59);
    if (new Date() > dataFimEvento) {
      return { texto: 'Encerrado', corFundo: '#f5f5f5', corTexto: CORES.cinzaTexto };
    }
  }

  return { texto: 'Ativo', corFundo: '#e8f8f0', corTexto: CORES.verdeSucesso };
}

function formatarParaInput(dataStr) {
  if (!dataStr) return '';
  return dataStr.includes('T') ? dataStr.split('T')[0] : dataStr;
}

function formatarExibicaoTabela(dataStr) {
  if (!dataStr) return '';
  const apenasData = dataStr.includes('T') ? dataStr.split('T')[0] : dataStr;
  const partes = apenasData.split('-');
  if (partes.length === 3) {
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }
  return dataStr;
}

function formatarCriadoEm(dataIsoStr) {
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

const botaoPrimario = {
  padding: '12px 20px',
  backgroundColor: CORES.cinzaBotao,
  color: CORES.azulLetraBotao,
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '14px',
};

const botaoSecundario = {
  ...botaoPrimario,
  backgroundColor: '#f4f6f8',
};

const botaoTabela = {
  padding: '7px 12px',
  backgroundColor: CORES.cinzaBotao,
  color: CORES.azulLetraBotao,
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '13px',
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

function linkBotao(backgroundColor, color) {
  return {
    textDecoration: 'none',
    padding: '12px 20px',
    backgroundColor,
    color,
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '14px',
  };
}
