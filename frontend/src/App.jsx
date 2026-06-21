import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [eventos, setEventos] = useState([]);
  const [id, setId] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [organizador, setOrganizador] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [local, setLocal] = useState('');
  const [editando, setEditando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  // Estados dos Filtros, Loading e Erro
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState(''); // '' (Tudo), 'true' (Ativos), 'false' (Encerrados/Inativos)
  const [ordenacao, setOrdenacao] = useState('-data_inicio');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erroMensagem, setErroMensagem] = useState('');

  // Paleta de Cores Customizada
  const CORES = {
    fundoAzulTotal: '#002244', 
    azulUfersa: '#003366',     
    cinzaBotao: '#e2e8f0',     
    azulLetraBotao: '#003366', 
    verdeSucesso: '#27ae60',
    vermelhoErro: '#c0392b',
    cinzaTexto: '#7f8c8d',
    textoEscuro: '#2c3e50'
  };

  // 1. READ - Busca dados com filtros, ordenação e paginação via API
  const carregarEventos = async () => {
    setCarregando(true);
    setErroMensagem('');
    try {
      const params = new URLSearchParams();
      if (busca) params.append('search', busca);
      if (filtroAtivo) params.append('ativo', filtroAtivo);
      if (ordenacao) params.append('ordering', ordenacao);
      params.append('page', paginaAtual);

      const response = await axios.get(`/api/eventos/?${params.toString()}`);
      
      if (Array.isArray(response.data)) {
        setEventos(response.data);
        setTotalPaginas(1);
      } else if (response.data && Array.isArray(response.data.results)) {
        setEventos(response.data.results);
        const count = response.data.count || 0;
        const pageSize = 20; // DRF PAGE_SIZE default
        setTotalPaginas(Math.ceil(count / pageSize));
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      setErroMensagem("Não foi possível conectar à API local. Verifique se o backend está rodando!");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    setPaginaAtual(1);
    const delayDebounce = setTimeout(() => {
      carregarEventos();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [busca, filtroAtivo, ordenacao]);

  useEffect(() => {
    carregarEventos();
  }, [paginaAtual]);

  // Função centralizada para calcular o status do evento em tempo real
  const obterStatusEvento = (evento) => {
    if (evento.ativo === false) {
      return { tipo: 'encerrados', texto: 'Inativo', corFundo: '#fdedec', corTexto: CORES.vermelhoErro };
    }
    
    if (evento.data_fim) {
      const apenasDataFim = evento.data_fim.includes('T') ? evento.data_fim.split('T')[0] : evento.data_fim;
      const [ano, mes, dia] = apenasDataFim.includes('-') ? apenasDataFim.split('-') : apenasDataFim.split('/');
      
      const dataFimEvento = new Date(Number(ano), Number(mes) - 1, Number(dia), 23, 59, 59);
      const hoje = new Date();

      if (hoje > dataFimEvento) {
        return { tipo: 'encerrados', texto: 'Encerrado', corFundo: '#f5f5f5', corTexto: '#7f8c8d' };
      }
    }
    
    return { tipo: 'ativos', texto: 'Ativo', corFundo: '#e8f8f0', corTexto: CORES.verdeSucesso };
  };

  const salvarEvento = async (e) => {
    e.preventDefault();
    const dadosEvento = { 
      titulo, 
      organizador,
      capacidade: Number(capacidade),
      data_inicio: dataInicio, 
      data_fim: dataFim, 
      local 
    };

    try {
      if (editando) {
        await axios.put(`/api/eventos/${id}/`, dadosEvento);
      } else {
        await axios.post('/api/eventos/', dadosEvento);
      }
      fecharEFecharModal();
      carregarEventos();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert("Erro ao salvar o evento.");
    }
  };

  const deletarEvento = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este evento?")) {
      try {
        await axios.delete(`/api/eventos/${id}/`);
        carregarEventos();
      } catch (error) {
        console.error("Erro ao remover evento:", error);
      }
    }
  };

  const abrirModalParaCriar = () => {
    limparFormulario();
    setEditando(false);
    setModalAberto(true);
  };

  const abrirModalParaEditar = (evento) => {
    setId(evento.id);
    setTitulo(evento.titulo);
    setOrganizador(evento.organizador || '');
    setCapacidade(evento.capacidade ?? 0);
    setDataInicio(formatarParaInput(evento.data_inicio));
    setDataFim(formatarParaInput(evento.data_fim));
    setLocal(evento.local);
    setEditando(true);
    setModalAberto(true);
  };

  const fecharEFecharModal = () => {
    setModalAberto(false);
    limparFormulario();
  };

  const limparFormulario = () => {
    setId(null);
    setTitulo('');
    setOrganizador('');
    setCapacidade('');
    setDataInicio('');
    setDataFim('');
    setLocal('');
  };

  const formatarParaInput = (dataStr) => {
    if (!dataStr) return '';
    if (dataStr.includes('-') && !dataStr.includes('/')) return dataStr.split('T')[0];
    try {
      const partesBarra = dataStr.includes('/') ? dataStr.split('/') : [];
      if (partesBarra.length === 3) {
        const dia = partesBarra[0].includes('T') ? partesBarra[0].split('T')[0] : partesBarra[0];
        const mes = partesBarra[1];
        const ano = partesBarra[2].split('T')[0];
        return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      }
    } catch (e) { console.error(e); }
    return dataStr;
  };

  const formatarExibicaoTabela = (dataStr) => {
    if (!dataStr) return '';
    if (dataStr.includes('/')) {
      const partes = dataStr.split('/');
      const dia = partes[0].includes('T') ? partes[0].split('T')[0] : partes[0];
      const mes = partes[1];
      const ano = partes[2] ? partes[2].split('T')[0] : '';
      return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
    }
    const apenasData = dataStr.includes('T') ? dataStr.split('T')[0] : dataStr;
    const partes = apenasData.split('-');
    if (partes.length === 3) {
      const [ano, mes, dia] = partes;
      return `${dia}/${mes}/${ano}`;
    }
    return dataStr;
  };

  const formatarCriadoEm = (dataIsoStr) => {
    if (!dataIsoStr) return '-';
    try {
      const data = new Date(dataIsoStr);
      const dataExtenso = data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
      const horaMinuto = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `${dataExtenso} às ${horaMinuto}`;
    } catch (e) { return dataIsoStr; }
  };
  
  return (
    <div style={{ padding: '40px', fontFamily: '"Segoe UI", Roboto, sans-serif', backgroundColor: CORES.fundoAzulTotal, minHeight: '100vh' }}>
      
      {/* Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', backgroundColor: 'white', padding: '20px 30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', borderLeft: `6px solid ${CORES.azulUfersa}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ color: CORES.azulUfersa, margin: 0, fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px' }}>EventosUfersaPDF</h1>
        </div>
        <button 
          onClick={abrirModalParaCriar}
          style={{ padding: '12px 24px', backgroundColor: CORES.cinzaBotao, color: CORES.azulLetraBotao, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          + Cadastrar Evento
        </button>
      </div>

      {/* Filtros: Busca, Status, Ordenação */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', backgroundColor: 'white', padding: '18px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar por título ou local do evento..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #dcdfe6', boxSizing: 'border-box', fontSize: '14px', outline: 'none', backgroundColor: '#fafafa' }}
          />
        </div>
        <div style={{ width: '220px' }}>
          <select 
            value={filtroAtivo} 
            onChange={(e) => { setFiltroAtivo(e.target.value); setPaginaAtual(1); }}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dcdfe6', height: '100%', fontSize: '14px', outline: 'none', backgroundColor: '#fafafa', color: CORES.textoEscuro }}
          >
            <option value="">📋 Status: Todos</option>
            <option value="true">✅ Apenas Ativos</option>
            <option value="false">⏳ Encerrados/Inativos</option>
          </select>
        </div>
        <div style={{ width: '220px' }}>
          <select 
            value={ordenacao} 
            onChange={(e) => { setOrdenacao(e.target.value); setPaginaAtual(1); }}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dcdfe6', height: '100%', fontSize: '14px', outline: 'none', backgroundColor: '#fafafa', color: CORES.textoEscuro }}
          >
            <option value="-data_inicio">📅 Data Início (Recente)</option>
            <option value="data_inicio">📅 Data Início (Antigo)</option>
            <option value="-criado_em">🕐 Criado (Recente)</option>
            <option value="criado_em">🕐 Criado (Antigo)</option>
            <option value="titulo">🔤 Título (A-Z)</option>
            <option value="-titulo">🔤 Título (Z-A)</option>
          </select>
        </div>
      </div>

      {erroMensagem && (
        <div style={{ padding: '15px 20px', backgroundColor: '#fdedec', color: CORES.vermelhoErro, borderRadius: '8px', marginBottom: '25px', fontWeight: '500', borderLeft: `4px solid ${CORES.vermelhoErro}` }}>
          ⚠️ {erroMensagem}
        </div>
      )}

      {/* Tabela de Exibição */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: CORES.azulUfersa, fontWeight: '600' }}>Eventos Locais Registrados</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid #e6f0fa`, backgroundColor: '#fcfdfe' }}>
              <th style={{ padding: '14px', color: CORES.azulUfersa, fontWeight: '600' }}>Título</th>
              <th style={{ padding: '14px', color: CORES.azulUfersa, fontWeight: '600' }}>Organizador</th>
              <th style={{ padding: '14px', color: CORES.azulUfersa, fontWeight: '600', textAlign: 'center' }}>Capacidade</th>
              <th style={{ padding: '14px', color: CORES.azulUfersa, fontWeight: '600', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '14px', color: CORES.azulUfersa, fontWeight: '600' }}>Período</th>
              <th style={{ padding: '14px', color: CORES.azulUfersa, fontWeight: '600' }}>Local</th>
              <th style={{ padding: '14px', color: CORES.azulUfersa, fontWeight: '600' }}>Criado Em</th>
              <th style={{ padding: '14px', color: CORES.azulUfersa, fontWeight: '600', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: CORES.azulUfersa, fontWeight: '600', fontSize: '15px' }}>
                  ⏳ Buscando dados no banco da UFERSA...
                </td>
              </tr>
            ) : eventos.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: CORES.cinzaTexto }}>Nenhum evento encontrado para os filtros atuais.</td>
              </tr>
            ) : (
              eventos.map((evento) => {
                const statusInfo = obterStatusEvento(evento);

                return (
                  <tr key={evento.id} style={{ borderBottom: '1px solid #efefef' }}>
                    <td style={{ padding: '14px', fontWeight: '600', color: CORES.textoEscuro }}>{evento.titulo}</td>
                    <td style={{ padding: '14px', color: '#4a5568' }}>{evento.organizador || '-'}</td>
                    <td style={{ padding: '14px', color: '#4a5568', textAlign: 'center', fontWeight: '500' }}>{evento.capacidade ?? 0} vagas</td>
                    
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '5px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '700',
                        backgroundColor: statusInfo.corFundo,
                        color: statusInfo.corTexto 
                      }}>
                        {statusInfo.texto}
                      </span>
                    </td>

                    <td style={{ padding: '14px', color: '#4a5568', fontSize: '13.5px' }}>
                      {formatarExibicaoTabela(evento.data_inicio)} {evento.data_fim && ` - ${formatarExibicaoTabela(evento.data_fim)}`}
                    </td>
                    <td style={{ padding: '14px', color: '#4a5568' }}>{evento.local}</td>
                    <td style={{ padding: '14px', color: CORES.cinzaTexto, fontSize: '13px' }}>
                      {formatarCriadoEm(evento.criado_em)}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button 
                        onClick={() => abrirModalParaEditar(evento)} 
                        style={{ marginRight: '8px', padding: '6px 14px', backgroundColor: CORES.cinzaBotao, color: CORES.azulLetraBotao, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => deletarEvento(evento.id)} 
                        style={{ padding: '6px 14px', backgroundColor: '#fdedec', color: CORES.vermelhoErro, border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px', padding: '10px' }}>
            <button
              onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
              disabled={paginaAtual === 1}
              style={{
                padding: '8px 16px',
                backgroundColor: paginaAtual === 1 ? '#e2e8f0' : CORES.cinzaBotao,
                color: paginaAtual === 1 ? '#a0aec0' : CORES.azulLetraBotao,
                border: 'none',
                borderRadius: '6px',
                cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              ◀ Anterior
            </button>
            <span style={{ color: CORES.textoEscuro, fontWeight: '500' }}>
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual >= totalPaginas}
              style={{
                padding: '8px 16px',
                backgroundColor: paginaAtual >= totalPaginas ? '#e2e8f0' : CORES.cinzaBotao,
                color: paginaAtual >= totalPaginas ? '#a0aec0' : CORES.azulLetraBotao,
                border: 'none',
                borderRadius: '6px',
                cursor: paginaAtual >= totalPaginas ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              Próxima ▶
            </button>
          </div>
        )}
      </div>

      {/* Modal Customizado */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '16px', width: '100%', maxWidth: '460px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', borderTop: `8px solid ${CORES.azulUfersa}` }}>
            <h3 style={{ marginTop: 0, marginBottom: '22px', color: CORES.azulUfersa, fontSize: '20px', fontWeight: '700' }}>{editando ? "📝 Modificar Evento" : "✨ Novo Evento Acadêmico"}</h3>
            
            <form onSubmit={salvarEvento}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: CORES.textoEscuro, fontSize: '14px' }}>Título do Evento:</label>
                <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #dcdfe6', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: CORES.textoEscuro, fontSize: '14px' }}>Organizador / Departamento:</label>
                <input type="text" value={organizador} onChange={(e) => setOrganizador(e.target.value)} required style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #dcdfe6', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: CORES.textoEscuro, fontSize: '14px' }}>Capacidade Máxima (Vagas):</label>
                <input type="number" min="0" value={capacidade} onChange={(e) => setCapacidade(e.target.value)} required style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #dcdfe6', fontSize: '14px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: CORES.textoEscuro, fontSize: '14px' }}>Data de Início:</label>
                  <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #dcdfe6', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: CORES.textoEscuro, fontSize: '14px' }}>Data de Fim:</label>
                  <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} required style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #dcdfe6', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: CORES.textoEscuro, fontSize: '14px' }}>Local do Evento:</label>
                <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} required style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #dcdfe6', fontSize: '14px', outline: 'none' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={fecharEFecharModal} style={{ padding: '10px 18px', backgroundColor: CORES.cinzaBotao, color: CORES.azulLetraBotao, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '10px 22px', backgroundColor: CORES.cinzaBotao, color: CORES.azulLetraBotao, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                  {editando ? "Salvar Alterações" : "Confirmar Cadastro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;