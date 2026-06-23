import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import EventosPage from './pages/EventosPage';
import LoginPage from './pages/LoginPage';
import SolicitacaoForm from './pages/SolicitacaoForm';
import SolicitacoesPage from './pages/SolicitacoesPage';
import AdminLoginPage from './pages/AdminLoginPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/eventos" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route
            path="/solicitar"
            element={
              <ProtectedRoute>
                <SolicitacaoForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventos"
            element={<EventosPage />}
          />
          <Route
            path="/eventos/novo"
            element={
              <ProtectedRoute adminOnly loginPath="/admin-login">
                <Navigate to="/eventos" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventos/editar/:id"
            element={
              <ProtectedRoute adminOnly loginPath="/admin-login">
                <Navigate to="/eventos" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/solicitacoes"
            element={
              <ProtectedRoute adminOnly loginPath="/admin-login">
                <SolicitacoesPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/eventos" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
