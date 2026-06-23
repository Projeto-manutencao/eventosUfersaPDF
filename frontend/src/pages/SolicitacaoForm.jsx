import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function SolicitacaoForm() {
  const [formData, setFormData] = useState({
    tipo: 'bug',
    titulo: '',
    descricao: '',
    email_contato: '',
    prioridade: 'media',
  });
  const [loading, setLoading] = useState(false);

  const CORES = {
    fundoAzulTotal: '#002244',
    azulUfersa: '#003366',
    textoEscuro: '#2c3e50',
    bordaInput: '#dcdfe6',
    fundoInput: '#fafafa',
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.titulo.trim() || !formData.descricao.trim()) {
      toast.error('Titulo e descricao sao obrigatorios.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/solicitacoes/', formData);
      toast.success(`Sucesso! Protocolo: ${response.data.protocolo}`, { duration: 5000 });

      setFormData({
        tipo: 'bug',
        titulo: '',
        descricao: '',
        email_contato: '',
        prioridade: 'media',
      });
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar sua solicitacao. Tente novamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    boxSizing: 'border-box',
    borderRadius: '8px',
    border: `1px solid ${CORES.bordaInput}`,
    fontSize: '14px',
    outline: 'none',
    backgroundColor: CORES.fundoInput,
    color: CORES.textoEscuro,
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: CORES.textoEscuro,
    fontSize: '14px',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: CORES.fundoAzulTotal, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
      <Toaster position="top-right" />

      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '600px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', borderTop: `8px solid ${CORES.azulUfersa}` }}>
        <h1 style={{ marginTop: 0, marginBottom: '14px', color: CORES.azulUfersa, fontSize: '24px', fontWeight: '700', textAlign: 'center' }}>
          Nova Solicitacao de Manutencao
        </h1>

        <Link to="/eventos" style={{ display: 'inline-flex', marginBottom: '24px', color: CORES.azulUfersa, fontWeight: '700', textDecoration: 'none' }}>
          Voltar para eventos
        </Link>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Tipo da Solicitacao:</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange} style={inputStyle}>
              <option value="bug">Bug / Erro</option>
              <option value="melhoria">Melhoria / Nova funcionalidade</option>
              <option value="duvida">Duvida / Suporte</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Titulo do problema ou ideia *</label>
            <input
              type="text"
              name="titulo"
              required
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ex: Erro ao clicar no botao de criar evento"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Descricao detalhada *</label>
            <textarea
              name="descricao"
              required
              rows="5"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva o passo a passo do erro ou os detalhes da sua sugestao..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={labelStyle}>E-mail para retorno (opcional):</label>
            <input
              type="email"
              name="email_contato"
              value={formData.email_contato}
              onChange={handleChange}
              placeholder="seuemail@ufersa.edu.br"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#7f8c8d' : CORES.azulUfersa, color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '16px' }}
          >
            {loading ? 'Processando...' : 'Enviar Solicitacao'}
          </button>
        </form>
      </div>
    </div>
  );
}
