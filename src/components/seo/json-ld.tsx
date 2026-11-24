import {
  professionalDisplayName,
  type SiteDocument,
  type SiteDocumentBlogPost,
} from "@/lib/sites/document";
import {
  buildAreaServed,
  documentFaqItems,
  postSeoMetadata,
  seoFromDocument,
  socialProfileUrls,
} from "@/lib/sites/seo";

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export function SiteJsonLd({
  document,
  url,
}: {
  document: SiteDocument;
  url: string;
}) {
  const seo = seoFromDocument(document);
  const name = professionalDisplayName(document.professional);
  const pro = document.professional;
  const sameAs = [
    ...socialProfileUrls(document),
    ...(seo.googleBusinessUrl ? [seo.googleBusinessUrl] : []),
  ];
  const faqItems = documentFaqItems(document);

  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": `${url}#person`,
    name,
    url,
  };
  if (seo.ogImage || pro.photo_url) {
    person.image = seo.ogImage || pro.photo_url;
  }
  if (pro.specialty) {
    person.jobTitle = pro.specialty;
  }
  if (pro.email) {
    person.email = pro.email;
  }
  if (pro.phone) {
    person.telephone = pro.phone;
  }
  if (sameAs.length > 0) {
    person.sameAs = sameAs;
  }

  const address = officeAddress(
    pro.office_address,
    seo.serviceScope === "online" ? null : seo.locality,
    seo.serviceScope === "online" ? null : seo.region,
  );

  const useLocalBusiness =
    seo.serviceScope !== "online" && Boolean(address);

  const orgType = useLocalBusiness
    ? (["LocalBusiness", "ProfessionalService"] as const)
    : ("ProfessionalService" as const);

  const service: Record<string, unknown> = {
    "@type": orgType,
    "@id": `${url}#service`,
    name,
    url,
    description: seo.description,
    provider: { "@id": `${url}#person` },
  };

  if (seo.ogImage) {
    service.image = seo.ogImage;
  }
  if (pro.phone) {
    service.telephone = pro.phone;
  }
  if (pro.email) {
    service.email = pro.email;
  }
  if (pro.specialty) {
    service.knowsAbout = pro.specialty;
  }
  if (sameAs.length > 0) {
    service.sameAs = sameAs;
  }

  if (address) {
    service.address = address;
    person.address = address;
  } else if (seo.serviceScope === "online" && (seo.locality || seo.region)) {
    // Base do profissional (não consultório presencial).
    person.homeLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(seo.locality ? { addressLocality: seo.locality } : {}),
        ...(seo.region ? { addressRegion: seo.region } : {}),
        addressCountry: "BR",
      },
    };
  }

  const areaServed = buildAreaServed({
    serviceScope: seo.serviceScope,
    locality: seo.locality,
    region: seo.region,
  });
  if (areaServed) {
    service.areaServed = areaServed;
  }

  const modesFromProfile = pro.attendance_modes?.filter(Boolean) ?? [];
  const modes =
    modesFromProfile.length > 0
      ? modesFromProfile
      : seo.serviceScope === "online"
        ? ["online"]
        : seo.serviceScope === "hybrid"
          ? ["online", "in_person"]
          : ["in_person"];

  service.availableChannel = modes.map((mode) => ({
    "@type": "ServiceChannel",
    serviceType: mode === "online" ? "Online" : "Presencial",
    ...(mode === "online" ? { serviceUrl: url } : {}),
  }));

  const graph: Record<string, unknown>[] = [person, service];

  if (faqItems.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@graph": graph,
      }}
    />
  );
}

export function ArticleJsonLd({
  document,
  post,
  url,
  homeUrl,
  blogUrl,
}: {
  document: SiteDocument;
  post: SiteDocumentBlogPost;
  url: string;
  homeUrl: string;
  blogUrl: string;
}) {
  const meta = postSeoMetadata(document, post);
  const author = professionalDisplayName(document.professional);
  const seo = seoFromDocument(document);
  const publishedAt = post.published_at ?? undefined;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    url,
    inLanguage: "pt-BR",
    author: {
      "@type": "Person",
      name: author,
      ...(seo.locality
        ? {
            address: {
              "@type": "PostalAddress",
              addressLocality: seo.locality,
            },
          }
        : {}),
    },
  };

  if (meta.ogImage) {
    data.image = meta.ogImage;
  }
  if (publishedAt) {
    data.datePublished = publishedAt;
    data.dateModified = publishedAt;
  }

  return (
    <>
      <JsonLdScript data={data} />
      <BreadcrumbJsonLd
        items={[
          { name: "Início", url: homeUrl },
          { name: document.blog.title || "Blog", url: blogUrl },
          { name: post.title, url },
        ]}
      />
    </>
  );
}

function officeAddress(
  value: unknown,
  localityFallback: string | null,
  regionFallback: string | null,
): Record<string, unknown> | null {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const street = stringField(raw.street ?? raw.line1 ?? raw.address);
  const city = stringField(raw.city) ?? localityFallback;
  const region = stringField(raw.state ?? raw.region) ?? regionFallback;
  const postal = stringField(raw.postal_code ?? raw.zip);
  if (!street && !city) {
    return null;
  }
  return {
    "@type": "PostalAddress",
    ...(street ? { streetAddress: street } : {}),
    ...(city ? { addressLocality: city } : {}),
    ...(region ? { addressRegion: region } : {}),
    ...(postal ? { postalCode: postal } : {}),
    addressCountry: stringField(raw.country) ?? "BR",
  };
}

function stringField(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
