import type { LevelContent } from "@/content/types";
import type { PlayState, PlayStats } from "@/game/state";

export type Status = "draft" | "review" | "published" | "archived";

export type AuthUser = { id: string; email: string | null; anonymous: boolean };

export type Profile = {
  id: string; email: string | null; display_name: string;
  is_animateur: boolean; is_admin: boolean; created_at: string;
};

export type World = { id: string; position: number; title: string; subtitle: string };

export type Level = {
  id: string; world_id: string; position: number; age_band: string; status: Status;
  release_at: string | null; content: LevelContent; last_note: string;
  updated_at: string; published_at: string | null;
};

export type LevelVersion = {
  id: number; level_id: string; status: Status; content: LevelContent; note: string;
  changed_by: string | null; changed_at: string;
};

export type ChildSettings = {
  sound?: boolean; voice?: boolean; puzzleN?: 2 | 3 | 4; dailyMinutes?: number | null;
};

export type Child = {
  id: string; parent_id: string | null; group_id: string | null;
  pseudonym: string; avatar: string; age_band: string; settings: ChildSettings; created_at: string;
};

export type Group = { id: string; animateur_id: string; name: string; age_band: string; created_at: string };

export type ScreenResult = { state?: PlayState; stats?: PlayStats; completed_at?: string | null };

export type Session = {
  id: string; group_id: string; animateur_id: string; title: string; goal: string;
  level_ids: string[]; mode: "screen" | "devices"; status: "prepared" | "live" | "done";
  join_code: string | null; screen_results: Record<string, ScreenResult>;
  started_at: string | null; ended_at: string | null; created_at: string;
};

export type Progress = {
  child_id: string; level_id: string; session_id: string | null;
  state: PlayState | Record<string, never>; stats: PlayStats | Record<string, never>;
  stars: number; badges: string[]; started_at: string; completed_at: string | null; updated_at: string;
};

export type ProgressWrite = Pick<Progress, "child_id" | "level_id"> & Partial<Pick<Progress, "session_id" | "state" | "stats" | "stars" | "badges" | "completed_at">>;

export type DeviceLink = { user_id: string; child_id: string; session_id: string; expires_at: string };

export type JoinInfo = {
  session_id: string; group_name: string; title: string; level_ids: string[];
  kids: { id: string; pseudonym: string; avatar: string }[];
};

export type MediaFile = { name: string; url: string; size?: number; created_at?: string };

export type AdminStats = {
  parents: number; animateurs: number; children: number; group_children: number; groups: number;
  sessions: number; levels_started: number; levels_completed: number;
  by_level: Record<string, { started: number; completed: number }>;
};
