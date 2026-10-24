import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/ui/kit";
import { Landing } from "@/pages/public/Landing";
import { Login, Signup, Forgot, NewPassword } from "@/pages/public/Auth";
import { Privacy, Terms } from "@/pages/public/Legal";
import { Join } from "@/pages/public/Join";
import { FamilyHome } from "@/pages/family/FamilyHome";
import { ChildPage } from "@/pages/family/ChildPage";
import { Account } from "@/pages/family/Account";
import { KidHome } from "@/pages/kid/KidHome";
import { KidCollection } from "@/pages/kid/KidCollection";
import { KidPlay } from "@/pages/kid/KidPlay";
import { SessionPlay } from "@/pages/kid/SessionPlay";
import { AnimHome } from "@/pages/anim/AnimHome";
import { GroupPage } from "@/pages/anim/GroupPage";
import { SessionPage } from "@/pages/anim/SessionPage";
import { ScreenPage } from "@/pages/anim/ScreenPage";

// L'administration n'est chargée que par les administrateurs
const AdminHome = lazy(() => import("@/pages/admin/AdminHome").then(m => ({ default: m.AdminHome })));
const AdminLevels = lazy(() => import("@/pages/admin/AdminLevels").then(m => ({ default: m.AdminLevels })));
const LevelEditor = lazy(() => import("@/pages/admin/LevelEditor").then(m => ({ default: m.LevelEditor })));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers").then(m => ({ default: m.AdminUsers })));
const AdminMedia = lazy(() => import("@/pages/admin/AdminMedia").then(m => ({ default: m.AdminMedia })));

function RequireAdult({ children, role }: { children: ReactNode; role?: "animateur" | "admin" }) {
  const { user, profile, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Spinner />;
  if (!user || user.anonymous || !profile) return <Navigate to={`/connexion?suite=${encodeURIComponent(loc.pathname)}`} replace />;
  if (role === "admin" && !profile.is_admin) return <Navigate to="/famille" replace />;
  if (role === "animateur" && !profile.is_animateur) return <Navigate to="/famille/compte?animateur=1" replace />;
  return <>{children}</>;
}

function Espace() {
  const { user, profile, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user || user.anonymous || !profile) return <Navigate to="/connexion" replace />;
  return <Navigate to="/famille" replace />;
}

export function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Signup />} />
        <Route path="/mot-de-passe-oublie" element={<Forgot />} />
        <Route path="/nouveau-mot-de-passe" element={<NewPassword />} />
        <Route path="/confidentialite" element={<Privacy />} />
        <Route path="/conditions" element={<Terms />} />
        <Route path="/rejoindre" element={<Join />} />
        <Route path="/rejoindre/:code" element={<Join />} />
        <Route path="/seance/jouer" element={<SessionPlay />} />
        <Route path="/espace" element={<Espace />} />

        <Route path="/famille" element={<RequireAdult><FamilyHome /></RequireAdult>} />
        <Route path="/famille/enfant/:id" element={<RequireAdult><ChildPage /></RequireAdult>} />
        <Route path="/famille/compte" element={<RequireAdult><Account /></RequireAdult>} />

        <Route path="/jouer/:childId" element={<RequireAdult><KidHome /></RequireAdult>} />
        <Route path="/jouer/:childId/collection" element={<RequireAdult><KidCollection /></RequireAdult>} />
        <Route path="/jouer/:childId/niveau/:levelId" element={<RequireAdult><KidPlay /></RequireAdult>} />

        <Route path="/animateur" element={<RequireAdult role="animateur"><AnimHome /></RequireAdult>} />
        <Route path="/animateur/groupe/:id" element={<RequireAdult role="animateur"><GroupPage /></RequireAdult>} />
        <Route path="/animateur/seance/:id" element={<RequireAdult role="animateur"><SessionPage /></RequireAdult>} />
        <Route path="/animateur/seance/:id/ecran" element={<RequireAdult role="animateur"><ScreenPage /></RequireAdult>} />

        <Route path="/admin" element={<RequireAdult role="admin"><AdminHome /></RequireAdult>} />
        <Route path="/admin/niveaux" element={<RequireAdult role="admin"><AdminLevels /></RequireAdult>} />
        <Route path="/admin/niveaux/:id" element={<RequireAdult role="admin"><LevelEditor /></RequireAdult>} />
        <Route path="/admin/utilisateurs" element={<RequireAdult role="admin"><AdminUsers /></RequireAdult>} />
        <Route path="/admin/medias" element={<RequireAdult role="admin"><AdminMedia /></RequireAdult>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
