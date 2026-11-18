import "server-only";

import { requireSiteEditor } from "@/lib/auth/site-access";
import {
  parseSiteDocument,
  type SiteDocument,
} from "@/lib/sites/document";
import { createClient } from "@/lib/supabase/server";

export async function getPreviewDocument(
  siteId: string,
): Promise<SiteDocument | null> {
  await requireSiteEditor(siteId);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("preview_site", {
    p_site_id: siteId,
  });

  if (error) {
    if (
      error.code === "PGRST116" ||
      error.code === "P0002" ||
      /não encontrado|not found/i.test(error.message)
    ) {
      return null;
    }
    if (
      error.code === "42501" ||
      /acesso negado|insufficient_privilege/i.test(error.message)
    ) {
      return null;
    }
    throw new Error("Não foi possível montar a prévia do site.");
  }

  return parseSiteDocument(data);
}
