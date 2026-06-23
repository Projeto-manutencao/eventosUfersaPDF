import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const CORES = {
  fundoAzulTotal: '#002244',
  azulUfersa: '#003366',
  cinzaBotao: '#e2e8f0',
  vermelhoErro: '#c0392b',
  textoEscuro: '#2c3e50',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/eventos" replace />;
  }

  const from = location.state?.from?.pathname || '/eventos';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch {
      setError('Email ou senha invalidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: CORES.fundoAzulTotal, display: 'grid', placeItems: 'center', padding: '32px', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '420px', backgroundColor: 'white', padding: '34px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.28)', borderTop: `8px solid ${CORES.azulUfersa}` }}>
        <h1 style={{ margin: '0 0 8px', color: CORES.azulUfersa, fontSize: '26px' }}>Entrar</h1>
        <p style={{ margin: '0 0 26px', color: '#5f6c7b' }}>Acesse sua conta para visualizar eventos.</p>

        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: CORES.textoEscuro }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcdfe6', marginBottom: '18px', fontSize: '14px' }}
        />

        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: CORES.textoEscuro }}>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="current-password"
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '6px', border: '1px solid #dcdfe6', marginBottom: '18px', fontSize: '14px' }}
        />

        {error && (
          <div style={{ padding: '12px 14px', backgroundColor: '#fdedec', color: CORES.vermelhoErro, borderRadius: '6px', marginBottom: '18px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px 16px', border: 0, borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', backgroundColor: loading ? '#7f8c8d' : CORES.azulUfersa, color: 'white', fontWeight: 700, fontSize: '15px' }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
