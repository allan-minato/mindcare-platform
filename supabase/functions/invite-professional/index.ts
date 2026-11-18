import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "npm:@supabase/supabase-js@2.49.1";

type InviteBody = {
  professional_id?: string;
  email?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return json({ error: "Configuração da function incompleta." }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Não autenticado." }, 401);
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user: caller },
    error: callerError,
  } = await callerClient.auth.getUser();

  if (callerError || !caller) {
    return json({ error: "Sessão inválida." }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerProfile, error: profileError } = await adminClient
    .from("admin_users")
    .select("id, role, is_active")
    .eq("id", caller.id)
    .maybeSingle();

  if (
    profileError ||
    !callerProfile?.is_active ||
    !["admin", "super_admin"].includes(String(callerProfile.role))
  ) {
    return json({ error: "Apenas admin pode convidar profissionais." }, 403);
  }

  let body: InviteBody;
  try {
    body = (await req.json()) as InviteBody;
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  const professionalId = String(body.professional_id ?? "").trim();
  if (!uuidRegex.test(professionalId)) {
    return json({ error: "Profissional inválido." }, 400);
  }

  const { data: professional, error: professionalError } = await adminClient
    .from("professionals")
    .select("id, full_name, email, status")
    .eq("id", professionalId)
    .maybeSingle();

  if (professionalError || !professional) {
    return json({ error: "Profissional não encontrado." }, 404);
  }

  if (professional.status === "archived") {
    return json({ error: "Profissional arquivado não pode receber acesso." }, 400);
  }

  const email = String(body.email ?? professional.email ?? "")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@") || email.length > 320) {
    return json({ error: "Informe um e-mail válido para o convite." }, 400);
  }

  const { data: staffConflict } = await adminClient
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (staffConflict) {
    return json(
      { error: "Este e-mail já pertence à equipe interna." },
      409,
    );
  }

  const { data: linkByProfessional } = await adminClient
    .from("professional_users")
    .select("auth_user_id")
    .eq("professional_id", professionalId)
    .maybeSingle();

  if (linkByProfessional) {
    return json(
      { error: "Este profissional já tem acesso ao portal." },
      409,
    );
  }

  const { data: linkByEmail } = await adminClient
    .from("professional_users")
    .select("auth_user_id")
    .eq("email", email)
    .maybeSingle();

  if (linkByEmail) {
    return json(
      { error: "Este e-mail já está vinculado a outro profissional." },
      409,
    );
  }

  const { data: invited, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: professional.full_name,
        professional_id: professionalId,
      },
      redirectTo: Deno.env.get("SITE_URL")
        ? `${Deno.env.get("SITE_URL")}/login`
        : undefined,
    });

  if (inviteError || !invited.user) {
    const message = inviteError?.message ?? "Falha ao convidar.";
    if (/already|registered|exists/i.test(message)) {
      return json(
        {
          error:
            "Este e-mail já tem conta no Auth. Use outro e-mail ou vincule manualmente.",
        },
        409,
      );
    }
    if (/rate limit|too many/i.test(message)) {
      return json(
        { error: "Muitos convites em pouco tempo. Tente de novo em instantes." },
        429,
      );
    }
    return json({ error: "Não foi possível enviar o convite." }, 400);
  }

  const { error: insertError } = await adminClient
    .from("professional_users")
    .insert({
      auth_user_id: invited.user.id,
      professional_id: professionalId,
      email,
      is_active: true,
    });

  if (insertError) {
    await adminClient.auth.admin.deleteUser(invited.user.id);
    return json({ error: "Não foi possível gravar o acesso do portal." }, 500);
  }

  return json({
    auth_user_id: invited.user.id,
    professional_id: professionalId,
    email,
  });
});

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
