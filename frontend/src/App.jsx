import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./router/ProtectedRoute";
import Login from "./pages/Login";
import DashboardResponsable from "./pages/DashboardResponsable";
import DashboardEnseignant from "./pages/DashboardEnseignant";
import FicheEtudiant from "./pages/FicheEtudiant";
import Alertes from "./pages/Alertes";
import Statistiques from "./pages/Statistiques";

function Home() {
  const { user } = useAuth();
  return user?.role === "enseignant" ? <DashboardEnseignant /> : <DashboardResponsable />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />

          <Route path="/etudiants/:id" element={
            <ProtectedRoute><FicheEtudiant /></ProtectedRoute>
          } />

          <Route path="/alertes" element={
            <ProtectedRoute><Alertes /></ProtectedRoute>
          } />

          <Route path="/statistiques" element={
            <ProtectedRoute roles={["responsable_pedagogique"]}><Statistiques /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
