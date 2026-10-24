// Génère supabase/seed.sql à partir des contenus de src/content (mondes + 8 pages publiées).
// Usage : npm run seed     Variables : SEED_OPEN=n (pages ouvertes dès le départ, 1 par défaut)
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const SRC = "src/content", TMP = "node_modules/.abiq-seed";
mkdirSync(TMP, { recursive: true });
for (const f of readdirSync(SRC).filter(f => f.endsWith(".ts"))) {
  const js = ts.transpileModule(readFileSync(join(SRC, f), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: false } }).outputText
    .replace(/from "\.\/([\w-]+)"/g, 'from "./$1.mjs"');
  writeFileSync(join(TMP, f.replace(/\.ts$/, ".mjs")), js);
}
const { WORLDS, LEVELS } = await import(pathToFileURL(join(TMP, "index.mjs")).href);
const open = Math.max(1, Number(process.env.SEED_OPEN || 1));
const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const json = o => "$abiq$" + JSON.stringify(o) + "$abiq$::jsonb";

let sql = `-- ABIQ : contenu de départ. Généré par scripts/gen-seed.mjs, ne pas modifier à la main.
-- À exécuter une fois, APRÈS schema.sql, dans Supabase > SQL Editor. Relancer ce script ne modifie pas les pages déjà présentes.
-- Dates de sortie : ${open} page(s) ouverte(s) tout de suite, puis une nouvelle chaque dimanche à 6 h (heure d'Abidjan),
-- à partir du dimanche qui suit l'exécution. Elles se modifient ensuite dans Administration > Contenus.

create or replace function pg_temp.abiq_sunday(n int) returns timestamptz language sql as $$
  select (date_trunc('week', now()) + interval '6 days 6 hours'
    + case when date_trunc('week', now()) + interval '6 days 6 hours' <= now() then interval '7 days' else interval '0' end
    + (n - 1) * interval '7 days');
$$;

insert into public.worlds (id, position, title, subtitle) values
${WORLDS.map(w => `  (${q(w.id)}, ${w.position}, ${q(w.title)}, ${q(w.subtitle)})`).join(",\n")}
on conflict (id) do nothing;

`;
for (const l of LEVELS) {
  const rel = l.position <= open ? "null" : `pg_temp.abiq_sunday(${l.position - open})`;
  sql += `insert into public.levels (id, world_id, position, age_band, status, release_at, content, last_note, published_at)
values (${q(l.id)}, ${q(l.worldId)}, ${l.position}, '6-8', 'published', ${rel}, ${json(l.content)}, 'Contenu de départ', now())
on conflict (id) do nothing;\n\n`;
}
writeFileSync("supabase/seed.sql", sql);
console.log(`supabase/seed.sql : ${WORLDS.length} mondes, ${LEVELS.length} pages (${open} ouverte(s) d'emblée).`);
