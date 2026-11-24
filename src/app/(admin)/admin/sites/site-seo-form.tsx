"use client";

import { useActionState, useState } from "react";

import { type SeoActionState } from "@/app/(admin)/admin/sites/seo-actions";
import {
  resolveServiceScope,
  type SeoServiceScope,
  type SiteSeoFields,
} from "@/lib/sites/seo";

type SiteSeoFormProps = {
  action: (
    state: SeoActionState,
    formData: FormData,
  ) => Promise<SeoActionState>;
  initial: SiteSeoFields;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackImageUrl?: string | null;
  siteHostLabel?: string;
  attendanceModes?: string[] | null;
};

const initialState: SeoActionState = {};

const inputClass =
  "w-full rounded-[10px] border border-[rgba(20,18,16,0.16)] bg-[rgba(255,252,248,0.9)] px-3 py-2 text-sm text-[#141210] outline-none transition focus:border-[#a68655] focus:shadow-[0_0_0_3px_rgba(166,134,85,0.14)]";

export function SiteSeoForm({
  action,
  initial,
  fallbackTitle,
  fallbackDescription,
  fallbackImageUrl,
  siteHostLabel = "seusite.com.br",
  attendanceModes,
}: SiteSeoFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [title, setTitle] = useState(initial.title ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [ogImage, setOgImage] = useState(initial.og_image_url ?? "");
  const [locality, setLocality] = useState(initial.locality ?? "");
  const [region, setRegion] = useState(initial.region ?? "");
  const [serviceScope, setServiceScope] = useState<SeoServiceScope>(() =>
    resolveServiceScope(initial.service_scope, attendanceModes),
  );

  const previewTitle = title.trim() || fallbackTitle;
  const previewDescription = description.trim() || fallbackDescription;
  const previewImage = ogImage.trim() || fallbackImageUrl?.trim() || "";
  const locationLabel = [locality.trim(), region.trim()].filter(Boolean).join(" · ");
  const isOnlineScope = serviceScope === "online";
  const isHybridScope = serviceScope === "hybrid";

  return (
    <div className="seo-workspace">
      <div className="seo-workspace-main">
        <form action={formAction} className="seo-form">
          {state.error ? (
            <p role="alert" className="portal-error">
              {state.error}
            </p>
          ) : null}
          {state.saved ? (
            <div className="seo-banner seo-banner-success">
              <strong>SEO salvo no rascunho.</strong>
              <span> Publique o site de novo para essas mudanças irem ao ar.</span>
            </div>
          ) : null}

          <fieldset className="seo-fieldset">
            <legend className="seo-legend">
              <span className="seo-legend-step">1</span>
              Como aparece na busca
            </legend>
            <p className="seo-legend-desc">
              É o que o Google mostra como título azul e texto cinza. Frases
              claras convertem melhor do que jargão.
            </p>

            <div className="seo-fields">
              <div className="seo-field">
                <div className="seo-label-row">
                  <label htmlFor="seo-title" className="text-sm font-medium">
                    Título da página
                  </label>
                  <span
                    className={`seo-counter${title.length > 60 ? " seo-counter-warn" : ""}`}
                  >
                    {title.length}/70
                  </span>
                </div>
                <p className="seo-field-desc">
                  Nome clicável que aparece no Google e na aba do navegador.
                  Ex.: “Dra. Ana — Psicologia clínica em Curitiba”.
                </p>
                <input
                  id="seo-title"
                  name="title"
                  maxLength={70}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex.: Dra. Ana — Psicologia clínica em Curitiba"
                  className={inputClass}
                />
                {state.fieldErrors?.title?.[0] ? (
                  <p className="portal-error">{state.fieldErrors.title[0]}</p>
                ) : (
                  <p className="portal-hint">
                    Ideal até ~60 caracteres. Inclua especialidade e cidade se
                    fizer sentido.
                  </p>
                )}
              </div>

              <div className="seo-field">
                <div className="seo-label-row">
                  <label htmlFor="seo-description" className="text-sm font-medium">
                    Descrição curta
                  </label>
                  <span
                    className={`seo-counter${description.length > 155 ? " seo-counter-warn" : ""}`}
                  >
                    {description.length}/170
                  </span>
                </div>
                <p className="seo-field-desc">
                  Texto cinza abaixo do título na busca. Explique o atendimento
                  e para quem é — em 1 ou 2 frases.
                </p>
                <textarea
                  id="seo-description"
                  name="description"
                  rows={3}
                  maxLength={170}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ex.: Psicoterapia para adultos. Ansiedade e esgotamento. Atendimento online."
                  className={inputClass}
                />
                {state.fieldErrors?.description?.[0] ? (
                  <p className="portal-error">
                    {state.fieldErrors.description[0]}
                  </p>
                ) : (
                  <p className="portal-hint">
                    Evite listas longas. A prévia à direita mostra o resultado.
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          <fieldset className="seo-fieldset">
            <legend className="seo-legend">
              <span className="seo-legend-step">2</span>
              Onde você atende
            </legend>
            <p className="seo-legend-desc">
              {isOnlineScope
                ? "No online, a cidade é só a sua base (opcional). O schema marca atendimento em todo o Brasil."
                : isHybridScope
                  ? "Híbrido: cidade ajuda quem busca presencial perto de você; o online cobre o Brasil."
                  : "Ajuda busca local e respostas de IA (“psicólogo em [cidade]”). Se vazio, usamos o endereço do cadastro."}
            </p>

            <div
              className="seo-scope-options"
              role="radiogroup"
              aria-label="Modo de atendimento para SEO"
            >
              {(
                [
                  {
                    value: "local" as const,
                    label: "Presencial / local",
                    hint: "Consultório ou cidade de atendimento",
                  },
                  {
                    value: "online" as const,
                    label: "Só online",
                    hint: "Teleconsulta · Brasil",
                  },
                  {
                    value: "hybrid" as const,
                    label: "Híbrido",
                    hint: "Presencial + online",
                  },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={`seo-scope-option${
                    serviceScope === option.value ? " is-active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="service_scope"
                    value={option.value}
                    checked={serviceScope === option.value}
                    onChange={() => setServiceScope(option.value)}
                  />
                  <span className="seo-scope-option-label">{option.label}</span>
                  <span className="seo-scope-option-hint">{option.hint}</span>
                </label>
              ))}
            </div>

            <div className="seo-fields seo-fields-2">
              <div className="seo-field">
                <label htmlFor="seo-locality" className="text-sm font-medium">
                  {isOnlineScope ? "Cidade-base (opcional)" : "Cidade de atendimento"}
                </label>
                <p className="seo-field-desc">
                  {isOnlineScope
                    ? "Onde você mora ou atua — não precisa ser consultório. Ajuda buscas do tipo “psicólogo online em SC”."
                    : "Cidade em que as pessoas devem te encontrar na busca local."}
                </p>
                <input
                  id="seo-locality"
                  name="locality"
                  maxLength={80}
                  value={locality}
                  onChange={(event) => setLocality(event.target.value)}
                  placeholder={
                    isOnlineScope ? "Ex.: Sombrio" : "Ex.: Curitiba"
                  }
                  className={inputClass}
                />
                {state.fieldErrors?.locality?.[0] ? (
                  <p className="portal-error">{state.fieldErrors.locality[0]}</p>
                ) : null}
              </div>
              <div className="seo-field">
                <label htmlFor="seo-region" className="text-sm font-medium">
                  Estado / UF
                </label>
                <p className="seo-field-desc">
                  Complementa a cidade (ex.: SC ou Santa Catarina).
                </p>
                <input
                  id="seo-region"
                  name="region"
                  maxLength={40}
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  placeholder="Ex.: SC"
                  className={inputClass}
                />
                {state.fieldErrors?.region?.[0] ? (
                  <p className="portal-error">{state.fieldErrors.region[0]}</p>
                ) : null}
              </div>
            </div>
          </fieldset>

          <fieldset className="seo-fieldset">
            <legend className="seo-legend">
              <span className="seo-legend-step">3</span>
              Compartilhamento e verificação
            </legend>
            <p className="seo-legend-desc">
              Defina a imagem do link quando alguém compartilha o site, e
              conecte ferramentas do Google (opcional).
            </p>

            <div className="seo-fields">
              <div className="seo-field">
                <label htmlFor="seo-og" className="text-sm font-medium">
                  Imagem ao compartilhar o link
                </label>
                <p className="seo-field-desc">
                  Foto ou arte que aparece no WhatsApp, Instagram, LinkedIn etc.
                  quando alguém manda o link do site. Cole o endereço completo
                  da imagem (começa com https://).
                </p>
                <input
                  id="seo-og"
                  name="og_image_url"
                  type="url"
                  inputMode="url"
                  value={ogImage}
                  onChange={(event) => setOgImage(event.target.value)}
                  placeholder="https://exemplo.com/minha-imagem.jpg"
                  className={inputClass}
                />
                {state.fieldErrors?.og_image_url?.[0] ? (
                  <p className="portal-error">
                    {state.fieldErrors.og_image_url[0]}
                  </p>
                ) : (
                  <p className="portal-hint">
                    Melhor em formato paisagem (~1200×630). Se deixar vazio,
                    usamos a foto do perfil — a prévia à direita mostra o
                    resultado.
                  </p>
                )}
              </div>

              <div className="seo-field">
                <label htmlFor="seo-gmb" className="text-sm font-medium">
                  Link do Google Meu Negócio
                </label>
                <p className="seo-field-desc">
                  Se você tem perfil no Google Maps / Meu Negócio, cole o link
                  aqui. Isso ajuda a ligar o site ao perfil local (opcional).
                </p>
                <input
                  id="seo-gmb"
                  name="google_business_url"
                  type="url"
                  inputMode="url"
                  defaultValue={initial.google_business_url ?? ""}
                  placeholder="https://g.page/… ou https://maps.google.com/…"
                  className={inputClass}
                />
                {state.fieldErrors?.google_business_url?.[0] ? (
                  <p className="portal-error">
                    {state.fieldErrors.google_business_url[0]}
                  </p>
                ) : (
                  <p className="portal-hint">
                    Não cria o perfil — só registra o link no site.
                  </p>
                )}
              </div>

              <div className="seo-field seo-field-advanced">
                <div className="seo-field-title-row">
                  <label htmlFor="seo-gsc" className="text-sm font-medium">
                    Verificação do Google Search Console
                  </label>
                  <span className="seo-optional-badge">Opcional · avançado</span>
                </div>
                <p className="seo-field-desc">
                  Serve para o Google confirmar que o site é seu. Depois disso
                  você vê no Search Console quantas pessoas te encontram na
                  busca. <strong>Não é obrigatório</strong> para o site
                  funcionar.
                </p>

                <details className="seo-guide">
                  <summary>Como pegar esse código (passo a passo)</summary>
                  <ol className="seo-guide-steps">
                    <li>
                      Abra o{" "}
                      <a
                        href="https://search.google.com/search-console"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Google Search Console
                      </a>{" "}
                      e faça login.
                    </li>
                    <li>
                      Clique em <strong>Adicionar propriedade</strong> e escolha{" "}
                      <strong>Prefixo do URL</strong>.
                    </li>
                    <li>
                      Cole a URL pública do site (ex.:{" "}
                      <code className="seo-code">https://{siteHostLabel}/</code>
                      ).
                    </li>
                    <li>
                      Em verificação, escolha{" "}
                      <strong>Tag HTML</strong> (não arquivo HTML, não DNS).
                    </li>
                    <li>
                      O Google mostra uma linha parecida com a caixa abaixo.
                      Copie <strong>apenas o trecho destacado</strong> — o
                      código entre aspas do{" "}
                      <code className="seo-code">content</code>.
                    </li>
                    <li>
                      Cole aqui, salve o SEO e <strong>publique o site</strong>.
                      Só então volte ao Google e clique em Verificar.
                    </li>
                  </ol>

                  <div className="seo-guide-example" aria-hidden="true">
                    <p className="seo-guide-example-label">
                      Exemplo da tag que o Google mostra
                    </p>
                    <pre className="seo-guide-example-code">
                      <span className="seo-guide-muted">
                        {'<meta name="google-site-verification" content="'}
                      </span>
                      <mark className="seo-guide-mark">AbCdEfGhIjKlMnOp123</mark>
                      <span className="seo-guide-muted">{'">'}</span>
                    </pre>
                    <p className="seo-guide-example-note">
                      ↑ Copie só o amarelo. Não cole a tag inteira com{" "}
                      <code className="seo-code">&lt;meta …&gt;</code>.
                    </p>
                  </div>
                </details>

                <input
                  id="seo-gsc"
                  name="google_site_verification"
                  defaultValue={initial.google_site_verification ?? ""}
                  placeholder="Cole aqui só o código, ex.: AbCdEfGhIjKlMnOp123"
                  className={inputClass}
                  autoComplete="off"
                  spellCheck={false}
                />
                {state.fieldErrors?.google_site_verification?.[0] ? (
                  <p className="portal-error">
                    {state.fieldErrors.google_site_verification[0]}
                  </p>
                ) : (
                  <p className="portal-hint">
                    Sem letras a mais, sem aspas e sem a tag HTML. Se ainda não
                    usa Search Console, deixe em branco.
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={pending}
            className="portal-btn portal-btn-primary justify-self-start disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Salvar SEO"}
          </button>
        </form>
      </div>

      <aside className="seo-workspace-aside" aria-label="Prévia ao vivo">
        <div className="seo-preview-block">
          <div className="seo-preview-head">
            <p className="seo-preview-kicker">Prévia · busca</p>
            <p className="seo-preview-note">Atualiza enquanto você digita</p>
          </div>
          <div className="seo-serp">
            <p className="seo-serp-url">
              https://{siteHostLabel}
              {locationLabel ? ` · ${locationLabel}` : ""}
            </p>
            <p className="seo-serp-title">{previewTitle}</p>
            <p className="seo-serp-desc">{previewDescription}</p>
          </div>
        </div>

        <div className="seo-preview-block">
          <div className="seo-preview-head">
            <p className="seo-preview-kicker">Prévia · compartilhar</p>
            <p className="seo-preview-note">WhatsApp, LinkedIn, etc.</p>
          </div>
          <div className="seo-share">
            <div className="seo-share-media">
              {previewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewImage} alt="" />
              ) : (
                <span>Sem imagem · usa foto do perfil ou fica vazio</span>
              )}
            </div>
            <div className="seo-share-body">
              <p className="seo-share-host">{siteHostLabel}</p>
              <p className="seo-share-title">{previewTitle}</p>
              <p className="seo-share-desc">{previewDescription}</p>
            </div>
          </div>
        </div>

        <div className="seo-tips">
          <p className="seo-tips-title">Dicas rápidas</p>
          <ul>
            <li>Salvar aqui só atualiza o rascunho.</li>
            <li>Publique o site para o Google e o compartilhamento verem a versão nova.</li>
            <li>Ative o FAQ na home — perguntas reais ajudam busca e IA.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
