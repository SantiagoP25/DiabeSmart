import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProfileData {
  display_name: string | null;
  weight: number | null;
  height: number | null;
  diabetes_type: string | null;
  debut_date: string | null;
  insulin_ratio: number | null;
  glucose_min: number | null;
  glucose_max: number | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("display_name, weight, height, diabetes_type, debut_date, insulin_ratio, glucose_min, glucose_max")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile(data);
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
      .select("display_name, weight, height, diabetes_type, debut_date, insulin_ratio, glucose_min, glucose_max")
      .single();

    if (!error) {
      setProfile(data);
    }

    return { error };
  };

  const isProfileComplete = profile
    ? !!(profile.display_name && profile.diabetes_type)
    : false;

  return { profile, loading, updateProfile, refetch: fetchProfile, isProfileComplete };
};
