import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const CORES = {
  fundoAzulTotal: '#002244',
  azulUfersa: '#003366',
  vermelhoErro: '#c0392b',
  textoEscuro: '#2c3e50',
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/eventos" replace />;
  }

  const from = location.state?.from?.pathname || '/eventos';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin({ email, password });
      navigate(from, { replace: true });
    } catch (erro) {
      const detail = erro.response?.data?.non_field_errors?.[0] || erro.response?.data?.detail;
      setError(detail || 'Email ou senha de administrador invalidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: CORES.fundoAzulTotal, display: 'grid', placeItems: 'center', padding: '32px', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '420px', backgroundColor: 'white', padding: '34px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.28)', borderTop: `8px solid ${CORES.azulUfersa}` }}>
        <h1 style={{ margin: '0 0 8px', color: CORES.azulUfersa, fontSize: '26px' }}>Entrar como Admin</h1>
        <p style={{ margin: '0 0 26px', color: '#5f6c7b' }}>Use uma conta criada via createsuperuser.</p>

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
          autoComplete="current-password"
          style={inputStyle}
        />

        {error && <div style={errorStyle}>{error}</div>}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px 16px', border: 0, borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', backgroundColor: loading ? '#7f8c8d' : CORES.azulUfersa, color: 'white', fontWeight: 700, fontSize: '15px' }}>
          {loading ? 'Entrando...' : 'Entrar como Admin'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '18px', fontSize: '14px' }}>
          <Link to="/eventos" style={{ color: CORES.azulUfersa, fontWeight: 700, textDecoration: 'none' }}>Ver eventos</Link>
          <Link to="/login" style={{ color: CORES.azulUfersa, fontWeight: 700, textDecoration: 'none' }}>Entrar como usuario</Link>
        </div>
      </form>
    </div>
  );
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
