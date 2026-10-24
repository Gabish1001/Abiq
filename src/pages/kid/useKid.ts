import { api } from "@/lib";
import { useLoad } from "@/lib/hooks";
import { levelStatuses, mergePending } from "@/game/progress";

/** Données de l'espace d'un enfant : son profil, les mondes, les niveaux publiés et sa progression. */
export function useKid(childId: string | undefined, key = "") {
  const q = useLoad(async () => {
    if (!childId) throw new Error("Enfant introuvable");
    const [child, worlds, levels, server] = await Promise.all([api.child(childId), api.worlds(), api.levels(), api.progressFor([childId])]);
    const progress = mergePending(server, childId);
    if (!child) throw new Error("Ce profil n'existe plus.");
    return { child, worlds, levels, progress, statuses: levelStatuses(levels, progress) };
  }, [childId, key]);
  return q;
}
