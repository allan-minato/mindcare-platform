export const templateKeys = ["acolhedor", "minimalista", "premium"] as const;

export type TemplateKey = (typeof templateKeys)[number];

export type SectionBlueprint = {
  section_key: string;
  module_key: string;
  is_visible: boolean;
};

/** Blueprint compartilhado pelos três templates nesta etapa. */
export const sharedSectionBlueprint: readonly SectionBlueprint[] = [
  { section_key: "inicio", module_key: "hero", is_visible: true },
  { section_key: "reconhecimento", module_key: "recognition", is_visible: true },
  { section_key: "sobre", module_key: "about", is_visible: true },
  { section_key: "abordagem", module_key: "approach", is_visible: true },
  { section_key: "servicos", module_key: "services", is_visible: true },
  { section_key: "especialidades", module_key: "specialties", is_visible: true },
  { section_key: "como-funciona", module_key: "how_it_works", is_visible: true },
  { section_key: "localizacao", module_key: "location", is_visible: true },
  { section_key: "para-quem", module_key: "audience", is_visible: true },
  { section_key: "contato", module_key: "contact", is_visible: true },
  { section_key: "formacao", module_key: "education", is_visible: false },
  { section_key: "faq", module_key: "faq", is_visible: true },
] as const;

export function isTemplateKey(value: string): value is TemplateKey {
  return templateKeys.some((key) => key === value);
}

export function templateLabel(key: TemplateKey) {
  switch (key) {
    case "acolhedor":
      return "Acolhedor";
    case "minimalista":
      return "Minimalista";
    case "premium":
      return "Premium";
  }
}

export function sectionsForTemplate(key: TemplateKey): SectionBlueprint[] {
  if (!isTemplateKey(key)) {
    return [];
  }
  return sharedSectionBlueprint.map((section) => ({ ...section }));
}
