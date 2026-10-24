import { NavLink } from "react-router-dom";
import { Icon } from "@/ui/kit";

export function AdminNav() {
  return (
    <nav className="seg admin-tabs" aria-label="Administration">
      <NavLink to="/admin" end><Icon name="chart" size={16} />Tableau de bord</NavLink>
      <NavLink to="/admin/niveaux"><Icon name="book" size={16} />Contenus</NavLink>
      <NavLink to="/admin/medias"><Icon name="image" size={16} />Médias</NavLink>
      <NavLink to="/admin/utilisateurs"><Icon name="users" size={16} />Utilisateurs</NavLink>
    </nav>
  );
}
