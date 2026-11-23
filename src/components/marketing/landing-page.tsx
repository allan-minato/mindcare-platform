import Link from "next/link";

import "@/components/marketing/marketing.css";

const LOGIN_PRO = "/login?as=profissional";
const LOGIN_TEAM = "/login?as=equipe";

export function LandingPage() {
  return (
    <div className="marketing-root">
      <header className="marketing-hero">
        <nav className="marketing-nav" aria-label="Principal">
          <Link href="/" className="marketing-brand" style={{ color: "#fffcf8" }}>
            Mind<em>Care</em>
          </Link>
          <div className="marketing-nav-actions">
            <Link href={LOGIN_PRO} className="marketing-btn marketing-btn-on-dark">
              Entrar no portal
            </Link>
          </div>
        </nav>

        <div className="marketing-hero-copy">
          <h1 className="marketing-hero-brand marketing-rise">
            Mind<em>Care</em>
          </h1>
          <p className="marketing-hero-headline marketing-rise marketing-rise-delay-1">
            Seu site profissional de saúde mental, com prévia ao vivo.
          </p>
          <p className="marketing-hero-lead marketing-rise marketing-rise-delay-2">
            Edite textos, blog e páginas no portal. A equipe MindCare cuida da
            publicação e do domínio.
          </p>
          <div className="marketing-hero-ctas marketing-rise marketing-rise-delay-3">
            <Link href={LOGIN_PRO} className="marketing-btn marketing-btn-on-dark">
              Entrar no portal
            </Link>
            <Link
              href={LOGIN_TEAM}
              className="marketing-btn marketing-btn-ghost-on-dark"
            >
              Acesso da equipe
            </Link>
          </div>
        </div>

        <div className="marketing-hero-stage" aria-hidden="true">
          <div className="marketing-device marketing-stage-in">
            <div className="marketing-device-bar">
              <span className="marketing-device-dot" />
              <span className="marketing-device-dot" />
              <span className="marketing-device-dot" />
              <span className="marketing-device-url">seusite.mindcare.app</span>
            </div>
            <div className="marketing-device-body">
              <div className="marketing-device-copy">
                <p className="marketing-device-kicker">Site profissional</p>
                <p className="marketing-device-title">Presença clara. Tom acolhedor.</p>
                <p className="marketing-device-text">
                  Templates pensados para psicologia e psiquiatria, com blog e
                  contato integrados.
                </p>
              </div>
              <div className="marketing-device-portrait" />
            </div>
          </div>
        </div>
      </header>

      <section className="marketing-section">
        <div className="marketing-section-inner">
          <p className="marketing-section-kicker">O produto</p>
          <h2 className="marketing-section-title">
            Site, blog e prévia no mesmo lugar
          </h2>
          <p className="marketing-section-lead">
            Monte a página inicial, publique reflexões no blog e veja o resultado
            em desktop e celular antes de ir ao ar — sem depender de agência a
            cada ajuste.
          </p>
        </div>
      </section>

      <section className="marketing-section marketing-split">
        <div className="marketing-section-inner">
          <p className="marketing-section-kicker">Como funciona</p>
          <h2 className="marketing-section-title">Você edita. A equipe publica.</h2>
          <p className="marketing-section-lead">
            O portal é seu espaço de trabalho. A equipe MindCare revisa, publica
            o snapshot e conecta o domínio quando estiver pronto.
          </p>
          <div className="marketing-steps">
            <div>
              <span className="marketing-step-index">01</span>
              <h3 className="marketing-step-title">Acesso ao portal</h3>
              <p className="marketing-step-text">
                Sua conta é criada pela equipe. Entre e complete perfil e site.
              </p>
            </div>
            <div>
              <span className="marketing-step-index">02</span>
              <h3 className="marketing-step-title">Edição com prévia</h3>
              <p className="marketing-step-text">
                Ajuste seções, textos e posts vendo o site ao vivo enquanto edita.
              </p>
            </div>
            <div>
              <span className="marketing-step-index">03</span>
              <h3 className="marketing-step-title">Publicação</h3>
              <p className="marketing-step-text">
                A MindCare coloca no ar a versão revisada e cuida do domínio.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-close">
        <div className="marketing-section-inner">
          <p className="marketing-section-kicker">Portal</p>
          <h2 className="marketing-section-title">Pronto para continuar?</h2>
          <p className="marketing-section-lead">
            Acesse o portal do profissional com o e-mail e a senha que a equipe
            enviou.
          </p>
          <div style={{ marginTop: "0.5rem" }}>
            <Link href={LOGIN_PRO} className="marketing-btn marketing-btn-primary">
              Entrar no portal
            </Link>
          </div>
        </div>
      </section>

      <footer className="marketing-footer">
        <Link href="/" className="marketing-footer-brand">
          Mind<em style={{ fontStyle: "italic", fontWeight: 400 }}>Care</em>
        </Link>
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          <Link href={LOGIN_PRO}>Entrar no portal</Link>
          <Link href={LOGIN_TEAM}>Acesso da equipe</Link>
        </div>
      </footer>
    </div>
  );
}
