import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Manrope } from "next/font/google";

import { LoginForm } from "@/app/login/login-form";
import "@/components/marketing/marketing.css";

export const instant = false;

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesso ao portal do profissional ou ao painel da equipe MindCare.",
};

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-marketing-display",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-marketing-sans",
});

type PageProps = {
  searchParams: Promise<{ as?: string }>;
};

function resolveAudience(raw: string | undefined): "profissional" | "equipe" {
  return raw === "equipe" ? "equipe" : "profissional";
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const audience = resolveAudience(params.as);
  const isTeam = audience === "equipe";

  return (
    <div
      className={`${display.variable} ${sans.variable} marketing-root`}
    >
      <div className="marketing-login">
        <nav className="marketing-login-nav">
          <Link href="/" className="marketing-brand">
            Mind<em>Care</em>
          </Link>
          <Link href="/" className="marketing-btn marketing-btn-ghost">
            Voltar
          </Link>
        </nav>

        <main className="marketing-login-main">
          <div>
            <p className="marketing-login-kicker">
              {isTeam ? "Equipe MindCare" : "Portal do profissional"}
            </p>
            <h1 className="marketing-login-title">Entrar</h1>
            <p className="marketing-login-lead">
              {isTeam
                ? "Acesso da equipe ao painel: profissionais, sites, publicação e domínios."
                : "Acesse o portal para editar seu site, blog e perfil. Use o e-mail e a senha enviados pela equipe MindCare."}
            </p>
          </div>

          <LoginForm />

          <p className="marketing-login-alt">
            {isTeam ? (
              <>
                É profissional?{" "}
                <Link href="/login?as=profissional">Entrar no portal</Link>
              </>
            ) : (
              <>
                Faz parte da equipe?{" "}
                <Link href="/login?as=equipe">Acesso da equipe</Link>
              </>
            )}
          </p>
        </main>
      </div>
    </div>
  );
}
