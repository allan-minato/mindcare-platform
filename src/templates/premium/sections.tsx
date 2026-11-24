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
  attendanceModeLabel,
  formatCouncil,
  heroDefaults,
  whatsappHref,
  type TemplateSectionProps,
} from "@/templates/shared";

export function renderPremiumSection(
  section: TemplateSectionProps["section"],
  document: TemplateSectionProps["document"],
) {
  const Component = sectionComponents[section.module as ModuleKey];
  if (!Component) {
    return null;
  }
  return <Component key={section.key} section={section} document={document} />;
}

const sectionComponents: Record<
  ModuleKey,
  (props: TemplateSectionProps) => ReactNode
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

const featureIcons = [
  // shield / confidentiality
  "M12 3l7 3v5c0 4.4-2.9 8.4-7 9.9C7.9 19.4 5 15.4 5 11V6l7-3z",
  // book / evidence
  "M5 4h10a2 2 0 012 2v13l-6-2-6 2V6a2 2 0 012-2zm0 0V3",
  // pin / in person
  "M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11zm0-8.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z",
  // video / online
  "M4 7h10a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2zm14 2l4-2v10l-4-2V9z",
];

function HeroSection({ section, document }: TemplateSectionProps) {
  const content = heroContentSchema.parse(section.content ?? {});
  const hero = heroDefaults(document, content.headline, content.support);
  const image = content.image_url || hero.photoUrl;
  const sealText = resolveHeroSeal(document);
  const badges = content.badges.slice(0, 3);
  const council = formatCouncil(document.professional);

  return (
    <section id={section.key} className="premium-hero">
      <div className="premium-wrap premium-hero-grid">
        <div className="premium-hero-copy">
          <h1 className="premium-hero-title">{hero.headline}</h1>
          {hero.support ? (
            <p className="premium-lead premium-hero-support">{hero.support}</p>
          ) : null}
          {badges.length > 0 ? (
            <ul className="premium-hero-features">
              {badges.map((badge, index) => (
                <li key={badge} className="premium-hero-feature">
                  <svg
                    className="premium-hero-feature-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={featureIcons[index % featureIcons.length]} />
                  </svg>
                  <span>{badge}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="premium-hero-signoff">
            <p className="premium-hero-signature">{hero.name}</p>
            {council ? (
              <p className="premium-hero-credential">{council}</p>
            ) : null}
          </div>
        </div>
        {image ? (
          <div className="premium-hero-media-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={hero.name}
              className="premium-media premium-hero-media"
            />
            {sealText ? (
              <div className="premium-hero-seal" aria-hidden="true">
                {sealText}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function resolveHeroSeal(
  document: TemplateSectionProps["document"],
): string | null {
  const specialty = document.professional.specialty?.trim();
  if (specialty) {
    return specialty.length > 72 ? `${specialty.slice(0, 69)}…` : specialty;
  }
  const council = formatCouncil(document.professional);
  if (council) {
    return council;
  }
  return null;
}

function RecognitionSection({ section }: TemplateSectionProps) {
  const content = recognitionContentSchema.parse(section.content ?? {});
  if (!content.title && content.items.length === 0) return null;

  // Conteúdo do módulo é identificação/dores — não inventar estrelas nem depoimentos.
  return (
    <section id={section.key} className="premium-identify">
      <div className="premium-wrap">
        {content.title ? (
          <h2 className="premium-identify-title">{content.title}</h2>
        ) : null}
        <ul className="premium-identify-grid">
          {content.items.map((item) => (
            <li
              key={`${item.title}-${item.detail}`}
              className="premium-identify-card"
            >
              <p className="premium-identify-card-title">{item.title}</p>
              {item.detail ? (
                <p className="premium-identify-card-body">{item.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AboutSection({ section }: TemplateSectionProps) {
  const content = aboutContentSchema.parse(section.content ?? {});
  if (!content.title && !content.body && !content.image_url) return null;
  return (
    <section id={section.key} className="premium-section">
      <div className="premium-wrap premium-hero-grid">
        <div>
          {content.title ? (
            <h2 className="premium-title">{content.title}</h2>
          ) : null}
          {content.body ? (
            <p className="premium-body">{content.body}</p>
          ) : null}
          {content.credential ? (
            <p className="premium-kicker" style={{ marginTop: "1.5rem" }}>
              {content.credential}
            </p>
          ) : null}
        </div>
        {content.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.image_url}
            alt={content.title?.trim() || "Sobre o profissional"}
            className="premium-media"
          />
        ) : null}
      </div>
    </section>
  );
}

function ApproachSection({ section }: TemplateSectionProps) {
  const content = approachContentSchema.parse(section.content ?? {});
  return (
    <TitleItems
      id={section.key}
      title={content.title}
      items={content.pillars}
      columns="3"
    />
  );
}

function ServicesSection({ section }: TemplateSectionProps) {
  const content = servicesContentSchema.parse(section.content ?? {});
  return (
    <TitleItems
      id={section.key}
      title={content.title}
      items={content.items}
      columns="2"
    />
  );
}

function SpecialtiesSection({ section }: TemplateSectionProps) {
  const content = specialtiesContentSchema.parse(section.content ?? {});
  const settings = specialtiesSettingsSchema.parse(section.settings ?? {});
  if (!content.title && content.items.length === 0) return null;
  return (
    <section id={section.key} className="premium-section">
      <div className="premium-wrap">
        {content.title ? (
          <h2 className="premium-title">{content.title}</h2>
        ) : null}
        {settings.display === "cards" ? (
          <ul className="premium-list premium-grid-3">
            {content.items.map((item) => (
              <li key={item} className="premium-item">
                <p className="premium-item-title">{item}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="premium-tags">
            {content.items.map((item) => (
              <span key={item} className="premium-tag">
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HowItWorksSection({ section }: TemplateSectionProps) {
  const content = howItWorksContentSchema.parse(section.content ?? {});
  return (
    <TitleItems
      id={section.key}
      title={content.title}
      items={content.steps.map((item, index) => ({
        title: `${index + 1}. ${item.title}`,
        body: item.body,
      }))}
      columns="3"
    />
  );
}

function LocationSection({ section }: TemplateSectionProps) {
  const content = locationContentSchema.parse(section.content ?? {});
  if (!content.title && !content.body && content.modes.length === 0) {
    return null;
  }
  return (
    <section id={section.key} className="premium-section">
      <div className="premium-wrap">
        {content.title ? (
          <h2 className="premium-title">{content.title}</h2>
        ) : null}
        {content.body ? <p className="premium-body">{content.body}</p> : null}
        {content.modes.length > 0 ? (
          <div className="premium-tags">
            {content.modes.map((mode) => (
              <span key={mode} className="premium-tag">
                {attendanceModeLabel(mode)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function AudienceSection({ section }: TemplateSectionProps) {
  const content = audienceContentSchema.parse(section.content ?? {});
  if (!content.title && !content.body) return null;
  return (
    <section id={section.key} className="premium-section">
      <div className="premium-wrap">
        {content.title ? (
          <h2 className="premium-title">{content.title}</h2>
        ) : null}
        {content.body ? <p className="premium-body">{content.body}</p> : null}
      </div>
    </section>
  );
}

function ContactSection({ section, document }: TemplateSectionProps) {
  const content = contactContentSchema.parse(section.content ?? {});
  const whatsapp = whatsappHref(document.professional.whatsapp);
  const email = document.professional.email?.trim();
  return (
    <section id={section.key} className="premium-section">
      <div className="premium-wrap">
        <h2 className="premium-title">
          {content.title.trim() || "Contato"}
        </h2>
        {content.city ? <p className="premium-lead">{content.city}</p> : null}
        {content.note ? <p className="premium-body">{content.note}</p> : null}
        {whatsapp ? (
          <a
            href={whatsapp}
            className="premium-button"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
            <span aria-hidden="true">→</span>
          </a>
        ) : null}
        {email ? (
          <p className="premium-muted" style={{ marginTop: "1rem" }}>
            <a href={`mailto:${email}`} style={{ color: "inherit" }}>
              {email}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}

function EducationSection({ section }: TemplateSectionProps) {
  const content = educationContentSchema.parse(section.content ?? {});
  if (!content.title && content.items.length === 0) return null;
  return (
    <section id={section.key} className="premium-section">
      <div className="premium-wrap">
        {content.title ? (
          <h2 className="premium-title">{content.title}</h2>
        ) : null}
        <ul className="premium-list">
          {content.items.map((item) => (
            <li key={item} className="premium-item">
              <p className="premium-item-title">{item}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FaqSection({ section }: TemplateSectionProps) {
  const content = faqContentSchema.parse(section.content ?? {});
  if (!content.title && content.items.length === 0) return null;
  return (
    <section id={section.key} className="premium-section">
      <div className="premium-wrap">
        {content.title ? (
          <h2 className="premium-title">{content.title}</h2>
        ) : null}
        <ul className="premium-list">
          {content.items.map((item) => (
            <li key={item.question} className="premium-item">
              <p className="premium-item-title">{item.question}</p>
              <p className="premium-item-body">{item.answer}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TitleItems({
  id,
  title,
  items,
  columns,
}: {
  id: string;
  title: string;
  items: Array<{ title: string; body: string }>;
  columns: "2" | "3";
}) {
  if (!title && items.length === 0) return null;
  return (
    <section id={id} className="premium-section">
      <div className="premium-wrap">
        {title ? <h2 className="premium-title">{title}</h2> : null}
        <ul
          className={`premium-list ${
            columns === "3" ? "premium-grid-3" : "premium-grid-2"
          }`}
        >
          {items.map((item) => (
            <li key={`${item.title}-${item.body}`} className="premium-item">
              <p className="premium-item-title">{item.title}</p>
              {item.body ? (
                <p className="premium-item-body">{item.body}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
