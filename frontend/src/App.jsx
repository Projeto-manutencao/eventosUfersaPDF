import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import EventosPage from './pages/EventosPage';
import LoginPage from './pages/LoginPage';
import SolicitacaoForm from './pages/SolicitacaoForm';
import SolicitacoesPage from './pages/SolicitacoesPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/eventos" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/solicitar" element={<SolicitacaoForm />} />
          <Route
            path="/eventos"
            element={
              <ProtectedRoute>
                <EventosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventos/novo"
            element={
              <ProtectedRoute adminOnly>
                <Navigate to="/eventos" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventos/editar/:id"
            element={
              <ProtectedRoute adminOnly>
                <Navigate to="/eventos" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/solicitacoes"
            element={
              <ProtectedRoute adminOnly>
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
