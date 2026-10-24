import type { Api } from "./api";
import { createSupabaseApi } from "./api-supabase";
import { createDemoApi } from "./api-demo";

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY_ = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const DEMO_FLAG = "abiq-demo";

export const configured = !!(URL_ && KEY_);

function wantsDemo() {
  try {
    const q = new URLSearchParams(location.search).get("demo");
    if (q === "1") localStorage.setItem(DEMO_FLAG, "1");
    if (q === "0") localStorage.removeItem(DEMO_FLAG);
    return !configured || localStorage.getItem(DEMO_FLAG) === "1";
  } catch { return !configured; }
}

export const api: Api = wantsDemo() ? createDemoApi() : createSupabaseApi(URL_!, KEY_!);

/** Ouvre la démo directement connectée, avec une famille et un groupe d'exemple. */
export function enterDemo() { try { localStorage.setItem(DEMO_FLAG, "1"); localStorage.setItem("abiq-demo-auto", "1"); } catch { /* ignore */ } location.href = "/famille"; }
export function leaveDemo() { try { localStorage.removeItem(DEMO_FLAG); } catch { /* ignore */ } location.href = "/"; }

export { errorMessage } from "./api";
export * from "./types";
