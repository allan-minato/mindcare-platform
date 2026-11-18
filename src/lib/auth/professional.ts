import "server-only";

import { connection } from "next/server";
import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type ProfessionalAccessProfile = {
  authUserId: string;
  professionalId: string;
  email: string;
  fullName: string;
};

export type ProfessionalAccess =
  | { status: "ok"; profile: ProfessionalAccessProfile }
  | { status: "denied" };

type LinkRow = {
  auth_user_id: string;
  professional_id: string;
  email: string;
  is_active: boolean;
  professionals:
    | { full_name: string; professional_name: string | null }
    | { full_name: string; professional_name: string | null }[]
    | null;
};

export const requireProfessional = cache(
  async (): Promise<ProfessionalAccess> => {
    await connection();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data, error } = await supabase
      .from("professional_users")
      .select(
        "auth_user_id, professional_id, email, is_active, professionals(full_name, professional_name)",
      )
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (error || !data?.is_active) {
      return { status: "denied" };
    }

    const row = data as LinkRow;
    const professional = Array.isArray(row.professionals)
      ? row.professionals[0]
      : row.professionals;

    return {
      status: "ok",
      profile: {
        authUserId: row.auth_user_id,
        professionalId: row.professional_id,
        email: row.email,
        fullName:
          professional?.professional_name?.trim() ||
          professional?.full_name ||
          "Profissional",
      },
    };
  },
);

export async function requireProfessionalProfile(): Promise<ProfessionalAccessProfile> {
  const access = await requireProfessional();
  if (access.status === "denied") {
    redirect("/login");
  }
  return access.profile;
}

export async function resolvePostLoginPath(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "/login";
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (admin) {
    return "/admin";
  }

  const { data: professional } = await supabase
    .from("professional_users")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (professional) {
    return "/app";
  }

  return "/login";
}
