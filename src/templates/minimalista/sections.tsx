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

export function renderMinimalistaSection(
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
    <section id={section.key} className="minimalista-hero">
      <div className="minimalista-wrap">
        <p className="minimalista-kicker">Atendimento clínico</p>
        <h1 className="minimalista-title">{hero.headline}</h1>
        <p className="minimalista-lead">{hero.support}</p>
        {content.badges.length > 0 ? (
          <div className="minimalista-tags">
            {content.badges.map((badge) => (
              <span key={badge} className="minimalista-tag">
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        {hero.whatsapp ? (
          <a
            href={hero.whatsapp}
            className="minimalista-link"
            target="_blank"
            rel="noreferrer"
          >
            Agendar pelo WhatsApp
          </a>
        ) : null}
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={hero.name} className="minimalista-hero-media" />
        ) : null}
      </div>
    </section>
  );
}

function RecognitionSection({ section }: TemplateSectionProps) {
  const content = recognitionContentSchema.parse(section.content ?? {});
  if (!content.title && content.items.length === 0) return null;
  return (
    <section id={section.key} className="minimalista-section">
      <div className="minimalista-wrap">
        {content.title ? (
          <h2 className="minimalista-title">{content.title}</h2>
        ) : null}
        <ul className="minimalista-list">
          {content.items.map((item) => (
            <li key={`${item.title}-${item.detail}`}>
              <p className="minimalista-item-title">{item.title}</p>
              {item.detail ? (
                <p className="minimalista-item-body">{item.detail}</p>
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
    <section id={section.key} className="minimalista-section">
      <div className="minimalista-wrap">
        {content.title ? (
          <h2 className="minimalista-title">{content.title}</h2>
        ) : null}
        {content.body ? (
          <p className="minimalista-body">{content.body}</p>
        ) : null}
        {content.credential ? (
          <p className="minimalista-muted" style={{ marginTop: "1rem" }}>
            {content.credential}
          </p>
        ) : null}
        {content.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.image_url}
            alt={content.title?.trim() || "Sobre o profissional"}
            className="minimalista-hero-media"
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
    />
  );
}

function ServicesSection({ section }: TemplateSectionProps) {
  const content = servicesContentSchema.parse(section.content ?? {});
  return (
    <TitleItems id={section.key} title={content.title} items={content.items} />
  );
}

function SpecialtiesSection({ section }: TemplateSectionProps) {
  const content = specialtiesContentSchema.parse(section.content ?? {});
  specialtiesSettingsSchema.parse(section.settings ?? {});
  if (!content.title && content.items.length === 0) return null;
  return (
    <section id={section.key} className="minimalista-section">
      <div className="minimalista-wrap">
        {content.title ? (
          <h2 className="minimalista-title">{content.title}</h2>
        ) : null}
        <div className="minimalista-tags">
          {content.items.map((item) => (
            <span key={item} className="minimalista-tag">
              {item}
            </span>
          ))}
        </div>
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
    />
  );
}

function LocationSection({ section }: TemplateSectionProps) {
  const content = locationContentSchema.parse(section.content ?? {});
  if (!content.title && !content.body && content.modes.length === 0) {
    return null;
  }
  return (
    <section id={section.key} className="minimalista-section">
      <div className="minimalista-wrap">
        {content.title ? (
          <h2 className="minimalista-title">{content.title}</h2>
        ) : null}
        {content.body ? (
          <p className="minimalista-body">{content.body}</p>
        ) : null}
        {content.modes.length > 0 ? (
          <div className="minimalista-tags">
            {content.modes.map((mode) => (
              <span key={mode} className="minimalista-tag">
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
    <section id={section.key} className="minimalista-section">
      <div className="minimalista-wrap">
        {content.title ? (
          <h2 className="minimalista-title">{content.title}</h2>
        ) : null}
        {content.body ? (
          <p className="minimalista-body">{content.body}</p>
        ) : null}
      </div>
    </section>
  );
}

function ContactSection({ section, document }: TemplateSectionProps) {
  const content = contactContentSchema.parse(section.content ?? {});
  const whatsapp = whatsappHref(document.professional.whatsapp);
  const email = document.professional.email?.trim();
  return (
    <section id={section.key} className="minimalista-section">
      <div className="minimalista-wrap">
        <h2 className="minimalista-title">
          {content.title.trim() || "Contato"}
        </h2>
        {content.city ? (
          <p className="minimalista-lead">{content.city}</p>
        ) : null}
        {content.note ? (
          <p className="minimalista-body">{content.note}</p>
        ) : null}
        {whatsapp ? (
          <a
            href={whatsapp}
            className="minimalista-link"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        ) : null}
        {email ? (
          <p className="minimalista-muted" style={{ marginTop: "1rem" }}>
            <a href={`mailto:${email}`}>{email}</a>
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
    <section id={section.key} className="minimalista-section">
      <div className="minimalista-wrap">
        {content.title ? (
          <h2 className="minimalista-title">{content.title}</h2>
        ) : null}
        <ul className="minimalista-list">
          {content.items.map((item) => (
            <li key={item}>
              <p className="minimalista-item-title">{item}</p>
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
    <section id={section.key} className="minimalista-section">
      <div className="minimalista-wrap">
        {content.title ? (
          <h2 className="minimalista-title">{content.title}</h2>
        ) : null}
        <ul className="minimalista-list">
          {content.items.map((item) => (
            <li key={item.question}>
              <p className="minimalista-item-title">{item.question}</p>
              <p className="minimalista-item-body">{item.answer}</p>
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
}: {
  id: string;
  title: string;
  items: Array<{ title: string; body: string }>;
}) {
  if (!title && items.length === 0) return null;
  return (
    <section id={id} className="minimalista-section">
      <div className="minimalista-wrap">
        {title ? <h2 className="minimalista-title">{title}</h2> : null}
        <ul className="minimalista-list">
          {items.map((item) => (
            <li key={`${item.title}-${item.body}`}>
              <p className="minimalista-item-title">{item.title}</p>
              {item.body ? (
                <p className="minimalista-item-body">{item.body}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
