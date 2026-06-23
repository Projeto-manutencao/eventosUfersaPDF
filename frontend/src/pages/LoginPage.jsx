import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const CORES = {
  fundoAzulTotal: '#002244',
  azulUfersa: '#003366',
  cinzaBotao: '#e2e8f0',
  vermelhoErro: '#c0392b',
  textoEscuro: '#2c3e50',
};

export default function LoginPage() {
  const [modo, setModo] = useState('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/eventos' : location.state?.from?.pathname || '/eventos'} replace />;
  }

  const from = location.state?.from?.pathname || '/eventos';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (modo === 'cadastro') {
        await register({ nome, email, password });
      } else {
        await login({ email, password });
      }
      navigate(from, { replace: true });
    } catch (erro) {
      const data = erro.response?.data;
      const detail = data?.non_field_errors?.[0] || data?.email?.[0] || data?.password?.[0] || data?.detail;
      setError(detail || (modo === 'cadastro' ? 'Nao foi possivel criar sua conta.' : 'Email ou senha invalidos.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: CORES.fundoAzulTotal, display: 'grid', placeItems: 'center', padding: '32px', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '440px', backgroundColor: 'white', padding: '34px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.28)', borderTop: `8px solid ${CORES.azulUfersa}` }}>
        <h1 style={{ margin: '0 0 8px', color: CORES.azulUfersa, fontSize: '26px' }}>
          {modo === 'cadastro' ? 'Criar conta' : 'Entrar'}
        </h1>
        <p style={{ margin: '0 0 22px', color: '#5f6c7b' }}>
          {modo === 'cadastro' ? 'Crie sua conta de usuario comum.' : 'Entre como usuario comum para solicitar manutencao.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '22px' }}>
          <button type="button" onClick={() => setModo('login')} style={tabStyle(modo === 'login')}>Login</button>
          <button type="button" onClick={() => setModo('cadastro')} style={tabStyle(modo === 'cadastro')}>Cadastro</button>
        </div>

        {modo === 'cadastro' && (
          <>
            <label style={labelStyle}>Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              autoComplete="name"
              style={inputStyle}
            />
          </>
        )}

        <label style={labelStyle}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          style={inputStyle}
        />

        <label style={labelStyle}>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={modo === 'cadastro' ? 8 : undefined}
          autoComplete={modo === 'cadastro' ? 'new-password' : 'current-password'}
          style={inputStyle}
        />

        {error && <div style={errorStyle}>{error}</div>}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px 16px', border: 0, borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', backgroundColor: loading ? '#7f8c8d' : CORES.azulUfersa, color: 'white', fontWeight: 700, fontSize: '15px' }}>
          {loading ? 'Processando...' : modo === 'cadastro' ? 'Criar conta' : 'Entrar'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '18px', fontSize: '14px' }}>
          <Link to="/eventos" style={{ color: CORES.azulUfersa, fontWeight: 700, textDecoration: 'none' }}>Ver eventos</Link>
          <Link to="/admin-login" style={{ color: CORES.azulUfersa, fontWeight: 700, textDecoration: 'none' }}>Entrar como Admin</Link>
        </div>
      </form>
    </div>
  );
}

function tabStyle(active) {
  return {
    padding: '10px 14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: active ? CORES.azulUfersa : CORES.cinzaBotao,
    color: active ? 'white' : CORES.azulUfersa,
    fontWeight: 700,
  };
}

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 700,
  color: CORES.textoEscuro,
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  borderRadius: '6px',
  border: '1px solid #dcdfe6',
  marginBottom: '18px',
  fontSize: '14px',
};

const errorStyle = {
  padding: '12px 14px',
  backgroundColor: '#fdedec',
  color: CORES.vermelhoErro,
  borderRadius: '6px',
  marginBottom: '18px',
  fontWeight: 600,
};
