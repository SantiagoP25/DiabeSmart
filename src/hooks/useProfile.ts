import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { buildUserStorageKey } from "@/lib/userStorage";

export interface ProfileData {
  display_name: string | null;
  weight: number | null;
  height: number | null;
  diabetes_type: string | null;
  debut_date: string | null;
  insulin_ratio: number | null;
  insulin_sensitivity: number | null;
  glucose_min: number | null;
  glucose_max: number | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const selectWithSensitivity = "display_name, weight, height, diabetes_type, debut_date, insulin_ratio, insulin_sensitivity, glucose_min, glucose_max";
  const selectWithoutSensitivity = "display_name, weight, height, diabetes_type, debut_date, insulin_ratio, glucose_min, glucose_max";
  const sensitivityKey = buildUserStorageKey("diabesmart_insulin_sensitivity", user?.id);

  const readLocalSensitivity = () => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(sensitivityKey);
    if (!raw) return null;
    const value = parseFloat(raw);
    return Number.isFinite(value) ? value : null;
  };

  const writeLocalSensitivity = (value: number | null) => {
    if (typeof window === "undefined") return;
    if (value === null || value === undefined || Number.isNaN(value)) {
      localStorage.removeItem(sensitivityKey);
      return;
    }
    localStorage.setItem(sensitivityKey, String(value));
  };

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(selectWithSensitivity)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error?.message?.includes("insulin_sensitivity")) {
      const fallback = await supabase
        .from("profiles")
        .select(selectWithoutSensitivity)
        .eq("user_id", user.id)
        .maybeSingle();
      const localSensitivity = readLocalSensitivity();
      setProfile({
        ...(fallback.data as ProfileData | null),
        insulin_sensitivity: localSensitivity,
      } as ProfileData | null);
    } else {
      const localSensitivity = readLocalSensitivity();
      const merged = data ? { ...data } : null;
      if (merged && (merged.insulin_sensitivity === null || merged.insulin_sensitivity === undefined)) {
        merged.insulin_sensitivity = localSensitivity;
      }
      setProfile(merged as ProfileData | null);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, [user]);

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      ...updates,
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select(selectWithSensitivity)
      .single();

    if (!error) {
      setProfile(data as ProfileData);
      return { error: null };
    }

    if (error?.message?.includes("insulin_sensitivity")) {
      if ("insulin_sensitivity" in updates) {
        const localValue = updates.insulin_sensitivity ?? null;
        writeLocalSensitivity(typeof localValue === "number" ? localValue : null);
        setProfile((prev) => (prev ? { ...prev, insulin_sensitivity: typeof localValue === "number" ? localValue : null } : prev));
        return { error: null };
      }

      const fallback = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "user_id" })
        .select(selectWithoutSensitivity)
        .single();
      if (!fallback.error) {
        const localSensitivity = readLocalSensitivity();
        setProfile({
          ...(fallback.data as ProfileData),
          insulin_sensitivity: localSensitivity,
        } as ProfileData);
        return { error: null };
      }
      return { error: fallback.error };
    }

    return { error };
  };

  const isProfileComplete = profile
    ? !!(profile.display_name && profile.diabetes_type)
    : false;

  return { profile, loading, updateProfile, refetch: fetchProfile, isProfileComplete };
};
