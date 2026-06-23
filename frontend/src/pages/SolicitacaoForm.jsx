import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function SolicitacaoForm() {
    const [formData, setFormData] = useState({
        tipo: 'bug',
        titulo: '',
        descricao: '',
        email_contato: '',
        prioridade: 'media'
    });
    const [loading, setLoading] = useState(false);

    // Paleta de Cores baseada no seu App.jsx para manter o padrão
    const CORES = {
        fundoAzulTotal: '#002244',
        azulUfersa: '#003366',
        cinzaBotao: '#e2e8f0',
        textoEscuro: '#2c3e50',
        bordaInput: '#dcdfe6',
        fundoInput: '#fafafa'
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.titulo.trim() || !formData.descricao.trim()) {
            toast.error('Título e Descrição são obrigatórios!');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/solicitacoes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar solicitação');
            }

            const data = await response.json();
            
            toast.success(`Sucesso! Protocolo: ${data.protocolo}`, { duration: 5000 });
            
            setFormData({
                tipo: 'bug',
                titulo: '',
                descricao: '',
                email_contato: '',
                prioridade: 'media'
            });

        } catch (error) {
            toast.error('Ocorreu um erro ao enviar sua solicitação. Tente novamente.');
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
        fontFamily: 'inherit'
    };

    const labelStyle = {
        display: 'block', 
        marginBottom: '8px', 
        fontWeight: '600', 
        color: CORES.textoEscuro, 
        fontSize: '14px'
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: CORES.fundoAzulTotal, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '40px', 
            fontFamily: '"Segoe UI", Roboto, sans-serif' 
        }}>
            <Toaster position="top-right" />
            
            <div style={{ 
                backgroundColor: 'white', 
                padding: '40px', 
                borderRadius: '16px', 
                width: '100%', 
                maxWidth: '600px', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)', 
                borderTop: `8px solid ${CORES.azulUfersa}` 
            }}>
                
                <h2 style={{ 
                    marginTop: 0, 
                    marginBottom: '30px', 
                    color: CORES.azulUfersa, 
                    fontSize: '24px', 
                    fontWeight: '700',
                    textAlign: 'center'
                }}>
                    Nova Solicitação de Manutenção
                </h2>
                
                <form onSubmit={handleSubmit}>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Tipo da Solicitação:</label>
                        <select 
                            name="tipo" 
                            value={formData.tipo} 
                            onChange={handleChange}
                            style={inputStyle}
                        >
                            <option value="bug">Bug / Erro</option>
                            <option value="melhoria">Melhoria / Nova funcionalidade</option>
                            <option value="duvida">Dúvida / Suporte</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>
                            Título do Problema ou Ideia <span style={{color: '#c0392b'}}>*</span>
                        </label>
                        <input 
                            type="text" 
                            name="titulo" 
                            required
                            value={formData.titulo} 
                            onChange={handleChange}
                            placeholder="Ex: Erro ao clicar no botão de criar evento"
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>
                            Descrição Detalhada <span style={{color: '#c0392b'}}>*</span>
                        </label>
                        <textarea 
                            name="descricao" 
                            required
                            rows="5"
                            value={formData.descricao} 
                            onChange={handleChange}
                            placeholder="Descreva o passo a passo do erro ou os detalhes da sua sugestão..."
                            style={{...inputStyle, resize: 'vertical'}}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={labelStyle}>E-mail para Retorno (Opcional):</label>
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
                        style={{ 
                            width: '100%', 
                            padding: '14px', 
                            backgroundColor: loading ? '#7f8c8d' : CORES.azulUfersa, 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: loading ? 'not-allowed' : 'pointer', 
                            fontWeight: '700', 
                            fontSize: '16px',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        {loading ? 'Processando...' : 'Enviar Solicitação'}
                    </button>

                </form>
            </div>
        </div>
    );
}