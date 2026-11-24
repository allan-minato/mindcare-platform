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

function HeroSection({ section, document }: TemplateSectionProps) {
  const content = heroContentSchema.parse(section.content ?? {});
  const hero = heroDefaults(document, content.headline, content.support);
  const image = content.image_url || hero.photoUrl;

  return (
    <section id={section.key} className="premium-hero">
      <div className="premium-wrap premium-hero-grid">
        <div>
          <p className="premium-kicker">Atendimento clínico</p>
          <h1 className="premium-title">{hero.headline}</h1>
          <p className="premium-lead">{hero.support}</p>
          {content.badges.length > 0 ? (
            <div className="premium-tags">
              {content.badges.map((badge) => (
                <span key={badge} className="premium-tag">
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
          {hero.whatsapp ? (
            <a
              href={hero.whatsapp}
              className="premium-button"
              target="_blank"
              rel="noreferrer"
            >
              Agendar pelo WhatsApp
            </a>
          ) : null}
        </div>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={hero.name} className="premium-media" />
        ) : null}
      </div>
    </section>
  );
}

function RecognitionSection({ section }: TemplateSectionProps) {
  const content = recognitionContentSchema.parse(section.content ?? {});
  if (!content.title && content.items.length === 0) return null;
  return (
    <section id={section.key} className="premium-section">
      <div className="premium-wrap">
        {content.title ? (
          <h2 className="premium-title">{content.title}</h2>
        ) : null}
        <ul className="premium-list premium-grid-3">
          {content.items.map((item) => (
            <li key={`${item.title}-${item.detail}`} className="premium-item">
              <p className="premium-item-title">{item.title}</p>
              {item.detail ? (
                <p className="premium-item-body">{item.detail}</p>
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
