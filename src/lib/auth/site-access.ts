import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type SiteEditorAccess =
  | { kind: "admin" }
  | { kind: "owner"; professionalId: string };

/** Admin da equipe ou dono do site via professional_users. */
export async function requireSiteEditor(
  siteId: string,
): Promise<SiteEditorAccess> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (admin) {
    return { kind: "admin" };
  }

  const { data: site } = await supabase
    .from("sites")
    .select("id, professional_id")
    .eq("id", siteId)
    .maybeSingle();

  if (!site) {
    redirect("/app");
  }

  return { kind: "owner", professionalId: site.professional_id };
}
