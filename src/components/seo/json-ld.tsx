import {
  professionalDisplayName,
  type SiteDocument,
  type SiteDocumentBlogPost,
} from "@/lib/sites/document";
import { postSeoMetadata, seoFromDocument } from "@/lib/sites/seo";

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name,
    url,
    description: seo.description,
  };

  if (seo.ogImage) {
    data.image = seo.ogImage;
  }
  if (pro.phone) {
    data.telephone = pro.phone;
  }
  if (pro.email) {
    data.email = pro.email;
  }
  if (pro.specialty) {
    data.knowsAbout = pro.specialty;
  }

  const address = officeAddress(pro.office_address);
  if (address) {
    data.address = address;
  }

  return <JsonLdScript data={data} />;
}

export function ArticleJsonLd({
  document,
  post,
  url,
}: {
  document: SiteDocument;
  post: SiteDocumentBlogPost;
  url: string;
}) {
  const meta = postSeoMetadata(document, post);
  const author = professionalDisplayName(document.professional);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    url,
    author: {
      "@type": "Person",
      name: author,
    },
  };

  if (meta.ogImage) {
    data.image = meta.ogImage;
  }
  if (post.published_at) {
    data.datePublished = post.published_at;
  }

  return <JsonLdScript data={data} />;
}

function officeAddress(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const raw = value as Record<string, unknown>;
  const street = stringField(raw.street ?? raw.line1 ?? raw.address);
  const city = stringField(raw.city);
  const region = stringField(raw.state ?? raw.region);
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
