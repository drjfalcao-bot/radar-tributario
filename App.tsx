import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccessPendingPage } from "@/pages/AccessPendingPage";
import { AdminUsersPage } from "@/pages/AdminUsersPage";
import { DiagnosticPage } from "@/pages/DiagnosticPage";
import { DocumentosPage } from "@/pages/DocumentosPage";
import { GuidedDiagnosticPage } from "@/pages/GuidedDiagnosticPage";
import { LeadDetailPage } from "@/pages/LeadDetailPage";
import { LeadsPage } from "@/pages/LeadsPage";
import { LoginPage } from "@/pages/LoginPage";
import { ParecerPage } from "@/pages/ParecerPage";
import { PrintPage } from "@/pages/PrintPage";
import { PublicRadarPage } from "@/pages/PublicRadarPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRadarPage />} />
      <Route path="/diagnostico/:id" element={<DiagnosticPage />} />
      <Route path="/share/:id" element={<DiagnosticPage readOnly />} />
      <Route path="/print/:id" element={<PrintPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/acesso-pendente" element={<AccessPendingPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Navigate to="/app/leads" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/leads"
        element={
          <ProtectedRoute>
            <LeadsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/diagnostico/novo"
        element={
          <ProtectedRoute>
            <GuidedDiagnosticPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/leads/:id"
        element={
          <ProtectedRoute>
            <LeadDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/leads/:id/documentos"
        element={
          <ProtectedRoute>
            <DocumentosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/leads/:id/parecer"
        element={
          <ProtectedRoute>
            <ParecerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
