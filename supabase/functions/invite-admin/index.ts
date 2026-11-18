import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const roles = ["editor", "admin", "super_admin"] as const;
type AdminRole = (typeof roles)[number];

type InviteBody = {
  email?: string;
  full_name?: string;
  role?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
    callerProfile.role !== "super_admin"
  ) {
    return json({ error: "Apenas super_admin pode convidar." }, 403);
  }

  let body: InviteBody;
  try {
    body = (await req.json()) as InviteBody;
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const fullName = String(body.full_name ?? "").trim();
  const role = String(body.role ?? "").trim();

  if (!email || !email.includes("@") || email.length > 320) {
    return json({ error: "Informe um e-mail válido." }, 400);
  }
  if (fullName.length < 1 || fullName.length > 200) {
    return json({ error: "Informe o nome completo." }, 400);
  }
  if (!isAdminRole(role)) {
    return json({ error: "Papel inválido." }, 400);
  }

  const { data: existingMember } = await adminClient
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingMember) {
    return json({ error: "Este e-mail já faz parte da equipe." }, 409);
  }

  const { data: invited, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: Deno.env.get("SITE_URL") ?? undefined,
    });

  if (inviteError || !invited.user) {
    const message = inviteError?.message ?? "Falha ao convidar.";
    if (/already|registered|exists/i.test(message)) {
      return json(
        {
          error:
            "Este e-mail já tem conta no Auth. Peça para a pessoa entrar e peça a um super_admin para vinculá-la, ou use outro e-mail.",
        },
        409,
      );
    }
    return json({ error: humanizeAuthError(message) }, 400);
  }

  const { error: insertError } = await adminClient.from("admin_users").insert({
    id: invited.user.id,
    full_name: fullName,
    role,
    email,
    is_active: true,
  });

  if (insertError) {
    // Evita usuário Auth órfão sem perfil de equipe quando possível.
    await adminClient.auth.admin.deleteUser(invited.user.id);
    if (insertError.message.includes("admin_users_email_key")) {
      return json({ error: "Este e-mail já faz parte da equipe." }, 409);
    }
    return json({ error: "Não foi possível gravar o membro da equipe." }, 500);
  }

  return json({
    id: invited.user.id,
    email,
    full_name: fullName,
    role,
  });
});

function isAdminRole(value: string): value is AdminRole {
  return roles.some((role) => role === value);
}

function humanizeAuthError(message: string) {
  if (/rate limit|too many/i.test(message)) {
    return "Muitos convites em pouco tempo. Tente de novo em instantes.";
  }
  return "Não foi possível enviar o convite.";
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
