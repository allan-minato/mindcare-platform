import type {
  SiteDocument,
  SiteDocumentProfessional,
  SiteDocumentSection,
} from "@/lib/sites/document";
import { isModuleKey } from "@/modules/registry";
import {
  isTemplateKey,
  type TemplateKey,
} from "@/lib/templates/registry";

export type LiveEditorSection = {
  id: string;
  module_key: string;
  section_key: string;
  is_visible: boolean;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
};

export function buildLiveDocument(
  baseDocument: SiteDocument,
  sections: LiveEditorSection[],
): SiteDocument {
  const liveSections: SiteDocumentSection[] = sections
    .filter((section) => section.is_visible)
    .flatMap((section) => {
      if (!isModuleKey(section.module_key)) {
        return [];
      }
      return [
        {
          key: section.section_key,
          module: section.module_key,
          content: section.content,
          settings: section.settings,
        },
      ];
    });

  const hasHome = baseDocument.pages.some((page) => page.path === "/");
  const pages =
    baseDocument.pages.length > 0
      ? baseDocument.pages.map((page, index) => {
          const isHome = hasHome ? page.path === "/" : index === 0;
          return isHome ? { ...page, sections: liveSections } : page;
        })
      : [
          {
            path: "/",
            title: "Início",
            seo: {},
            sections: liveSections,
          },
        ];

  return {
    ...baseDocument,
    pages,
  };
}

export function buildCreatePreviewDocument(input: {
  templateKey: TemplateKey;
  slug: string;
  professional: {
    full_name: string;
    professional_name: string | null;
  };
}): SiteDocument {
  const name =
    input.professional.professional_name?.trim() ||
    input.professional.full_name.trim() ||
    "Profissional";

  const professional: SiteDocumentProfessional = {
    full_name: input.professional.full_name,
    professional_name: input.professional.professional_name,
    specialty: "Psicologia Clínica",
    council: "crp",
    registration_number: "00/00000",
    whatsapp: "11999999999",
    email: null,
    photo_url: null,
  };

  const key = isTemplateKey(input.templateKey)
    ? input.templateKey
    : "acolhedor";

  return {
    schema_version: 1,
    site: {
      slug: input.slug.trim() || "novo-site",
      template: { key, version: 1 },
      theme: {},
      seo: {},
    },
    professional,
    pages: [
      {
        path: "/",
        title: "Início",
        seo: {},
        sections: [
          {
            key: "inicio",
            module: "hero",
            content: {
              headline: `Acompanhamento com ${name}`,
              support:
                "Prévia do template. As seções completas são geradas ao criar o site.",
              badges: ["CRP", "Online"],
              image_url: "",
            },
            settings: {},
          },
          {
            key: "sobre",
            module: "about",
            content: {
              title: "Sobre o atendimento",
              body: "Textos, serviços e seções serão editáveis depois da criação.",
              credential: "CRP 00/00000",
              image_url: "",
            },
            settings: {},
          },
          {
            key: "contato",
            module: "contact",
            content: {
              title: "Vamos conversar?",
              city: "Atendimento online",
              note: "Esta é só uma prévia do visual do template.",
            },
            settings: {},
          },
        ],
      },
    ],
  };
}
