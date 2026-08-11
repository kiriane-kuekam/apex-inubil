import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./router/ProtectedRoute";
import Login from "./pages/Login";
import DashboardResponsable from "./pages/DashboardResponsable";
import DashboardEnseignant from "./pages/DashboardEnseignant";
import DashboardAdmin from "./pages/DashboardAdmin";
import GestionUtilisateurs from "./pages/GestionUtilisateurs";
import GestionFilieres from "./pages/GestionFilieres";
import FicheEtudiant from "./pages/FicheEtudiant";
import Alertes from "./pages/Alertes";
import Statistiques from "./pages/Statistiques";
import ImportEtudiants from "./pages/ImportEtudiants";

const HOME_BY_ROLE = {
  administrateur: DashboardAdmin,
  enseignant: DashboardEnseignant,
  responsable_pedagogique: DashboardResponsable,
};

function Home() {
  const { user } = useAuth();
  const HomeComponent = HOME_BY_ROLE[user?.role] || DashboardResponsable;
  return <HomeComponent />;
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

          <Route path="/importer" element={
            <ProtectedRoute roles={["responsable_pedagogique"]}><ImportEtudiants /></ProtectedRoute>
          } />

          <Route path="/utilisateurs" element={
            <ProtectedRoute roles={["administrateur"]}><GestionUtilisateurs /></ProtectedRoute>
          } />

          <Route path="/filieres" element={
            <ProtectedRoute roles={["administrateur"]}><GestionFilieres /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
