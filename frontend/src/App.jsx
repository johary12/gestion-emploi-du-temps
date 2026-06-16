// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import NavbarAdmin from './components/NavbarAdmin';
import NavbarProf from './components/NavbarProf';

// Pages Admin
import AdminDashboard from './pagesAdmin/AdminDashboard';
import AdminEmploiDuTemps from './pagesAdmin/AdminEmploiDuTemps';
import AdminProfs from './pagesAdmin/AdminProfs';
import AdminSalles from './pagesAdmin/AdminSalles';
import AdminEtudiants from './pagesAdmin/AdminEtudiants';
import AdminDisponibilites from './pagesAdmin/AdminDisponibilites';
import AdminParametre from './pagesAdmin/AdminParametre';
import AdminAide from './pagesAdmin/AdminAide';

// Pages Professeur
import ProfDashboard from './pagesProf/ProfDashboard';
import ProfDisponibilites from './pagesProf/ProfDisponibilites';
import ProfEmploiDuTemps from './pagesProf/ProfEmploiDuTemps';

// Pages publiques
import Login from './pages/Login';
import PublicEmploiDuTemps from './pages/PublicEmploiDuTemps';

// Composant de protection des routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={styles.loading}>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/emploi-du-temps-public" replace />;
  }

  return children;
};

// ✅ AppContent avec les routes
function AppContent() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<PublicEmploiDuTemps />} />
      <Route path="/emploi-du-temps-public" element={<PublicEmploiDuTemps />} />
      <Route path="/login" element={<Login />} />

      {/* Routes Administrateur */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <NavbarAdmin><AdminDashboard /></NavbarAdmin>
        </ProtectedRoute>
      } />
      <Route path="/admin/edt" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <NavbarAdmin><AdminEmploiDuTemps /></NavbarAdmin>
        </ProtectedRoute>
      } />
      <Route path="/admin/profs" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <NavbarAdmin><AdminProfs /></NavbarAdmin>
        </ProtectedRoute>
      } />
      <Route path="/admin/salles" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <NavbarAdmin><AdminSalles /></NavbarAdmin>
        </ProtectedRoute>
      } />
      <Route path="/admin/etudiants" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <NavbarAdmin><AdminEtudiants /></NavbarAdmin>
        </ProtectedRoute>
      } />
      <Route path="/admin/dispos" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <NavbarAdmin><AdminDisponibilites /></NavbarAdmin>
        </ProtectedRoute>
      } />
      <Route path="/admin/parametres" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <NavbarAdmin><AdminParametre /></NavbarAdmin>
        </ProtectedRoute>
      } />
      <Route path="/admin/aide" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <NavbarAdmin><AdminAide /></NavbarAdmin>
        </ProtectedRoute>
      } />

      {/* Routes Professeur */}
      <Route path="/prof/dashboard" element={
        <ProtectedRoute allowedRoles={['prof']}>
          <NavbarProf><ProfDashboard /></NavbarProf>
        </ProtectedRoute>
      } />
      <Route path="/prof/disponibilites" element={
        <ProtectedRoute allowedRoles={['prof']}>
          <NavbarProf><ProfDisponibilites /></NavbarProf>
        </ProtectedRoute>
      } />
      <Route path="/prof/emploi" element={
        <ProtectedRoute allowedRoles={['prof']}>
          <NavbarProf><ProfEmploiDuTemps /></NavbarProf>
        </ProtectedRoute>
      } />

      {/* Redirection 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ✅ App wrapper avec ThemeProvider
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: 'var(--text-primary, #1e293b)',
  },
};

export default App;