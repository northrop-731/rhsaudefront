
import { Route, Routes, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoutes';

import CadastroServidorPage from '../pages/servidores/CadastroServidorPage';
import { ServidoresPage } from '../pages/servidores/ServidoresPage';

export function PrivateRoutes() {
  return (
    <Routes>
      <Route
        path="/servidores"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <ServidoresPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/servidores/cadastro"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <CadastroServidorPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/app/servidores" replace />}
      />
    </Routes>
  );
}
