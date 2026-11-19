import type { ReactNode } from "react";

import {
  aboutContentSchema,
  approachContentSchema,
  audienceContentSchema,
  contactContentSchema,
  educationContentSchema,
  faqContentSchema,
  heroContentSchema,
  howItWorksContentSchema,
  locationContentSchema,
  recognitionContentSchema,
  servicesContentSchema,
  specialtiesContentSchema,
  specialtiesSettingsSchema,
} from "@/modules/schemas";
import type { ModuleKey } from "@/modules/registry";
import {
  professionalDisplayName,
  whatsappHref,
  type SiteDocument,
  type SiteDocumentSection,
} from "@/lib/sites/document";
import { homeSections, sectionHasNavContent } from "@/templates/shared";

type SectionProps = {
  section: SiteDocumentSection;
  document: SiteDocument;
};

export function renderAcolhedorSection(
  section: SiteDocumentSection,
  document: SiteDocument,
) {
  const Component = sectionComponents[section.module as ModuleKey];
  if (!Component) {
    return null;
  }
  return (
    <Component
      key={section.key}
      section={section}
      document={document}
    />
  );
}

const sectionComponents: Record<
  ModuleKey,
  (props: SectionProps) => ReactNode
> = {
  hero: HeroSection,
  recognition: RecognitionSection,
  about: AboutSection,
  approach: ApproachSection,
  services: ServicesSection,
  specialties: SpecialtiesSection,
  how_it_works: HowItWorksSection,
  location: LocationSection,
  audience: AudienceSection,
  contact: ContactSection,
  education: EducationSection,
  faq: FaqSection,
};

function HeroSection({ section, document }: SectionProps) {
  const content = heroContentSchema.parse(section.content ?? {});
  const name = professionalDisplayName(document.professional);
  const whatsapp = whatsappHref(document.professional.whatsapp);
  const headline = content.headline.trim() || name;
  const support =
    content.support.trim() ||
    "Acompanhamento psicológico com escuta atenta e presença.";
  const imageUrl = content.image_url || document.professional.photo_url;
  const servicesSection = homeSections(document).find(
    (item) => item.module === "services" && sectionHasNavContent(item),
  );

  return (
    <section id={section.key} className="acolhedor-hero">
      <div className="acolhedor-wrap acolhedor-hero-grid">
        <div>
          <p className="acolhedor-kicker">Atendimento clínico</p>
          <h1 className="acolhedor-title">{headline}</h1>
          <p className="acolhedor-lead">{support}</p>
          <div className="acolhedor-hero-actions">
            {whatsapp ? (
              <a
                href={whatsapp}
                className="acolhedor-btn"
                target="_blank"
                rel="noreferrer"
              >
                Entrar em contato
              </a>
            ) : null}
            {servicesSection ? (
              <a
                href={`#${servicesSection.key}`}
                className={`acolhedor-btn${whatsapp ? " acolhedor-btn-ghost" : ""}`}
              >
                Conhecer serviços
              </a>
            ) : null}
          </div>
          {content.badges.length > 0 ? (
            <div className="acolhedor-hero-badges">
              {content.badges.map((badge) => {
                const [label, ...rest] = badge.split(/[:·\-–—]/);
                const detail = rest.join(" ").trim();
                return (
                  <div key={badge} className="acolhedor-badge">
                    <span className="acolhedor-badge-label">
                      {label.trim() || badge}
                    </span>
                    {detail ? (
                      <span className="acolhedor-badge-detail">{detail}</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
        {imageUrl ? (
          <div className="acolhedor-media-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={content.image_url ? "" : name}
              className="acolhedor-media"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function RecognitionSection({ section }: SectionProps) {
  const content = recognitionContentSchema.parse(section.content ?? {});
  if (!content.title && content.items.length === 0) {
    return null;
  }
  return (
    <section id={section.key} className="acolhedor-section acolhedor-section-dark">
      <div className="acolhedor-wrap">
        <p className="acolhedor-kicker">Reconhecimento</p>
        {content.title ? (
          <h2 className="acolhedor-title acolhedor-title-wide">{content.title}</h2>
        ) : null}
        <ul className="acolhedor-list acolhedor-list-plain">
          {content.items.map((item) => (
            <li key={`${item.title}-${item.detail}`}>
              <strong>{item.title}</strong>
              {item.detail ? ` — ${item.detail}` : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AboutSection({ section }: SectionProps) {
  const content = aboutContentSchema.parse(section.content ?? {});
  if (!content.title && !content.body && !content.image_url) {
    return null;
  }
  return (
    <section id={section.key} className="acolhedor-section">
      <div className="acolhedor-wrap acolhedor-about-grid">
        {content.image_url ? (
          <div className="acolhedor-about-visual">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.image_url}
              alt=""
              className="acolhedor-media"
            />
          </div>
        ) : null}
        <div>
          <p className="acolhedor-kicker">Sobre</p>
          {content.title ? (
            <h2 className="acolhedor-title">{content.title}</h2>
          ) : null}
          {content.body ? <p className="acolhedor-body">{content.body}</p> : null}
          {content.credential ? (
            <span className="acolhedor-credential">{content.credential}</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ApproachSection({ section }: SectionProps) {
  const content = approachContentSchema.parse(section.content ?? {});
  if (!content.title && content.pillars.length === 0) {
    return null;
  }
  return (
    <section id={section.key} className="acolhedor-section acolhedor-section-warm">
      <div className="acolhedor-wrap">
        <p className="acolhedor-kicker">Abordagem</p>
        {content.title ? (
          <h2 className="acolhedor-title">{content.title}</h2>
        ) : null}
        <ul className="acolhedor-list acolhedor-list-rows">
          {content.pillars.map((item) => (
            <li key={`${item.title}-${item.body}`}>
              <p className="acolhedor-item-title">{item.title}</p>
              {item.body ? (
                <p className="acolhedor-item-body">{item.body}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ServicesSection({ section }: SectionProps) {
  const content = servicesContentSchema.parse(section.content ?? {});
  if (!content.title && content.items.length === 0) {
    return null;
  }
  return (
    <section id={section.key} className="acolhedor-section acolhedor-section-dark">
      <div className="acolhedor-wrap">
        <p className="acolhedor-kicker">Serviços</p>
        {content.title ? (
          <h2 className="acolhedor-title acolhedor-title-wide">{content.title}</h2>
        ) : null}
        <ul className="acolhedor-list acolhedor-list-cards acolhedor-grid-2">
          {content.items.map((item) => (
            <li key={`${item.title}-${item.body}`}>
              <p className="acolhedor-item-title">{item.title}</p>
              {item.body ? (
                <p className="acolhedor-item-body">{item.body}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SpecialtiesSection({ section }: SectionProps) {
  const content = specialtiesContentSchema.parse(section.content ?? {});
  const settings = specialtiesSettingsSchema.parse(section.settings ?? {});
  if (!content.title && content.items.length === 0) {
    return null;
  }
  return (
    <section id={section.key} className="acolhedor-section">
      <div className="acolhedor-wrap">
        <p className="acolhedor-kicker">Especialidades</p>
        {content.title ? (
          <h2 className="acolhedor-title">{content.title}</h2>
        ) : null}
        {settings.display === "cards" ? (
          <div className="acolhedor-specialty-grid">
            {content.items.map((item) => (
              <div key={item} className="acolhedor-specialty">
                {item}
              </div>
            ))}
          </div>
        ) : (
          <div className="acolhedor-tags">
            {content.items.map((item) => (
              <span key={item} className="acolhedor-tag">
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HowItWorksSection({ section }: SectionProps) {
  const content = howItWorksContentSchema.parse(section.content ?? {});
  if (!content.title && content.steps.length === 0) {
    return null;
  }
  return (
    <section id={section.key} className="acolhedor-section acolhedor-section-warm">
      <div className="acolhedor-wrap">
        <p className="acolhedor-kicker">Como funciona</p>
        {content.title ? (
          <h2 className="acolhedor-title">{content.title}</h2>
        ) : null}
        <ol className="acolhedor-list acolhedor-steps">
          {content.steps.map((item) => (
            <li key={`${item.title}-${item.body}`}>
              <p className="acolhedor-item-title">{item.title}</p>
              {item.body ? (
                <p className="acolhedor-item-body">{item.body}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function LocationSection({ section }: SectionProps) {
  const content = locationContentSchema.parse(section.content ?? {});
  if (!content.title && !content.body && content.modes.length === 0) {
    return null;
  }
  const modeLabels = content.modes.map((mode) =>
    mode === "in_person" ? "Presencial" : "Online",
  );
  return (
    <section id={section.key} className="acolhedor-section">
      <div className="acolhedor-wrap-narrow">
        <p className="acolhedor-kicker">Atendimento</p>
        {content.title ? (
          <h2 className="acolhedor-title">{content.title}</h2>
        ) : null}
        {content.body ? <p className="acolhedor-body">{content.body}</p> : null}
        {modeLabels.length > 0 ? (
          <div className="acolhedor-tags">
            {modeLabels.map((label) => (
              <span key={label} className="acolhedor-tag">
                {label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function AudienceSection({ section }: SectionProps) {
  const content = audienceContentSchema.parse(section.content ?? {});
  if (!content.title && !content.body) {
    return null;
  }
  return (
    <section id={section.key} className="acolhedor-section acolhedor-section-warm">
      <div className="acolhedor-wrap-narrow">
        <p className="acolhedor-kicker">Para quem</p>
        {content.title ? (
          <h2 className="acolhedor-title">{content.title}</h2>
        ) : null}
        {content.body ? <p className="acolhedor-body">{content.body}</p> : null}
      </div>
    </section>
  );
}

function ContactSection({ section, document }: SectionProps) {
  const content = contactContentSchema.parse(section.content ?? {});
  const whatsapp = whatsappHref(document.professional.whatsapp);
  const email = document.professional.email?.trim();
  return (
    <section id={section.key} className="acolhedor-cta">
      <div className="acolhedor-wrap">
        <div className="acolhedor-cta-inner">
          <p className="acolhedor-kicker">Vamos conversar</p>
          <h2 className="acolhedor-title">
            {content.title.trim() || "O primeiro passo pode ser agora"}
          </h2>
          {content.city ? (
            <p className="acolhedor-lead">{content.city}</p>
          ) : null}
          {content.note ? (
            <p className="acolhedor-body">{content.note}</p>
          ) : null}
          <div className="acolhedor-cta-actions">
            {whatsapp ? (
              <a
                href={whatsapp}
                className="acolhedor-btn acolhedor-btn-light"
                target="_blank"
                rel="noreferrer"
              >
                Entrar em contato
              </a>
            ) : null}
            {email ? (
              <a
                href={`mailto:${email}`}
                className="acolhedor-btn acolhedor-btn-on-dark"
              >
                {email}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function EducationSection({ section }: SectionProps) {
  const content = educationContentSchema.parse(section.content ?? {});
  if (!content.title && content.items.length === 0) {
    return null;
  }
  return (
    <section id={section.key} className="acolhedor-section">
      <div className="acolhedor-wrap">
        <p className="acolhedor-kicker">Formação</p>
        {content.title ? (
          <h2 className="acolhedor-title">{content.title}</h2>
        ) : null}
        <ul className="acolhedor-list acolhedor-list-rows">
          {content.items.map((item) => (
            <li key={item}>
              <p className="acolhedor-item-title">{item}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FaqSection({ section }: SectionProps) {
  const content = faqContentSchema.parse(section.content ?? {});
  if (!content.title && content.items.length === 0) {
    return null;
  }
  return (
    <section id={section.key} className="acolhedor-section acolhedor-section-warm">
      <div className="acolhedor-wrap">
        <p className="acolhedor-kicker">Dúvidas</p>
        {content.title ? (
          <h2 className="acolhedor-title">{content.title}</h2>
        ) : null}
        <ul className="acolhedor-list acolhedor-list-rows">
          {content.items.map((item) => (
            <li key={item.question}>
              <p className="acolhedor-item-title">{item.question}</p>
              <p className="acolhedor-item-body">{item.answer}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
