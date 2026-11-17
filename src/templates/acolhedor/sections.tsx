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

  return (
    <section id={section.key} className="acolhedor-hero">
      <div className="acolhedor-wrap acolhedor-hero-grid">
        <div>
          <p className="acolhedor-kicker" style={{ color: "#c9e6dc" }}>
            Atendimento clínico
          </p>
          <h1 className="acolhedor-title">{headline}</h1>
          <p className="acolhedor-lead">{support}</p>
          {content.badges.length > 0 ? (
            <div className="acolhedor-hero-badges">
              {content.badges.map((badge) => (
                <span key={badge} className="acolhedor-badge">
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
          {whatsapp ? (
            <p style={{ marginTop: "1.75rem" }}>
              <a
                href={whatsapp}
                className="acolhedor-button"
                target="_blank"
                rel="noreferrer"
                style={{ background: "#fff", color: "#1f4d42" }}
              >
                Agendar pelo WhatsApp
              </a>
            </p>
          ) : null}
        </div>
        {content.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.image_url}
            alt=""
            className="acolhedor-media"
          />
        ) : document.professional.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={document.professional.photo_url}
            alt={name}
            className="acolhedor-media"
          />
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
    <section id={section.key} className="acolhedor-section">
      <div className="acolhedor-wrap">
        {content.title ? (
          <h2 className="acolhedor-title">{content.title}</h2>
        ) : null}
        <ul className="acolhedor-list acolhedor-grid-3">
          {content.items.map((item) => (
            <li key={`${item.title}-${item.detail}`}>
              <p className="acolhedor-item-title">{item.title}</p>
              {item.detail ? (
                <p className="acolhedor-item-body">{item.detail}</p>
              ) : null}
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
        <div>
          {content.title ? (
            <h2 className="acolhedor-title">{content.title}</h2>
          ) : null}
          {content.body ? <p className="acolhedor-body">{content.body}</p> : null}
          {content.credential ? (
            <span className="acolhedor-credential">{content.credential}</span>
          ) : null}
        </div>
        {content.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.image_url}
            alt=""
            className="acolhedor-media"
          />
        ) : null}
      </div>
    </section>
  );
}

function ApproachSection({ section }: SectionProps) {
  const content = approachContentSchema.parse(section.content ?? {});
  return (
    <TitleItemsSection
      id={section.key}
      title={content.title}
      items={content.pillars.map((item) => ({
        title: item.title,
        body: item.body,
      }))}
      columns="3"
    />
  );
}

function ServicesSection({ section }: SectionProps) {
  const content = servicesContentSchema.parse(section.content ?? {});
  return (
    <TitleItemsSection
      id={section.key}
      title={content.title}
      items={content.items.map((item) => ({
        title: item.title,
        body: item.body,
      }))}
      columns="2"
    />
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
        {content.title ? (
          <h2 className="acolhedor-title">{content.title}</h2>
        ) : null}
        {settings.display === "cards" ? (
          <ul className="acolhedor-list acolhedor-grid-3">
            {content.items.map((item) => (
              <li key={item}>
                <p className="acolhedor-item-title">{item}</p>
              </li>
            ))}
          </ul>
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
  return (
    <TitleItemsSection
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
      <div className="acolhedor-wrap">
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
    <section id={section.key} className="acolhedor-section">
      <div className="acolhedor-wrap">
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
    <section id={section.key} className="acolhedor-section">
      <div className="acolhedor-wrap">
        <h2 className="acolhedor-title">
          {content.title.trim() || "Contato"}
        </h2>
        {content.city ? (
          <p className="acolhedor-lead">{content.city}</p>
        ) : null}
        {content.note ? <p className="acolhedor-body">{content.note}</p> : null}
        <div className="acolhedor-tags" style={{ marginTop: "1.75rem" }}>
          {whatsapp ? (
            <a
              href={whatsapp}
              className="acolhedor-button"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className="acolhedor-tag">
              {email}
            </a>
          ) : null}
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
        {content.title ? (
          <h2 className="acolhedor-title">{content.title}</h2>
        ) : null}
        <ul className="acolhedor-list">
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
    <section id={section.key} className="acolhedor-section">
      <div className="acolhedor-wrap">
        {content.title ? (
          <h2 className="acolhedor-title">{content.title}</h2>
        ) : null}
        <ul className="acolhedor-list">
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

function TitleItemsSection({
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
  if (!title && items.length === 0) {
    return null;
  }
  return (
    <section id={id} className="acolhedor-section">
      <div className="acolhedor-wrap">
        {title ? <h2 className="acolhedor-title">{title}</h2> : null}
        <ul
          className={`acolhedor-list ${
            columns === "3" ? "acolhedor-grid-3" : "acolhedor-grid-2"
          }`}
        >
          {items.map((item) => (
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
