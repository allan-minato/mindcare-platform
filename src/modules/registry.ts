import { z } from "zod";

import {
  aboutContentSchema,
  approachContentSchema,
  audienceContentSchema,
  contactContentSchema,
  educationContentSchema,
  emptySettingsSchema,
  faqContentSchema,
  heroContentSchema,
  howItWorksContentSchema,
  locationContentSchema,
  recognitionContentSchema,
  servicesContentSchema,
  specialtiesContentSchema,
  specialtiesSettingsSchema,
} from "@/modules/schemas";

export const moduleKeys = [
  "hero",
  "recognition",
  "about",
  "approach",
  "services",
  "specialties",
  "how_it_works",
  "location",
  "audience",
  "contact",
  "education",
  "faq",
] as const;

export type ModuleKey = (typeof moduleKeys)[number];

type ModuleDefinition = {
  key: ModuleKey;
  label: string;
  contentSchema: z.ZodType<Record<string, unknown>>;
  settingsSchema: z.ZodType<Record<string, unknown>>;
  defaultContent: Record<string, unknown>;
  defaultSettings: Record<string, unknown>;
};

function defineModule<TContent extends z.ZodType, TSettings extends z.ZodType>(
  key: ModuleKey,
  label: string,
  contentSchema: TContent,
  settingsSchema: TSettings,
): ModuleDefinition {
  return {
    key,
    label,
    contentSchema: contentSchema as z.ZodType<Record<string, unknown>>,
    settingsSchema: settingsSchema as z.ZodType<Record<string, unknown>>,
    defaultContent: contentSchema.parse({}) as Record<string, unknown>,
    defaultSettings: settingsSchema.parse({}) as Record<string, unknown>,
  };
}

export const moduleRegistry: Record<ModuleKey, ModuleDefinition> = {
  hero: defineModule("hero", "Hero", heroContentSchema, emptySettingsSchema),
  recognition: defineModule(
    "recognition",
    "Reconhecimento",
    recognitionContentSchema,
    emptySettingsSchema,
  ),
  about: defineModule("about", "Sobre", aboutContentSchema, emptySettingsSchema),
  approach: defineModule(
    "approach",
    "Abordagem",
    approachContentSchema,
    emptySettingsSchema,
  ),
  services: defineModule(
    "services",
    "Serviços",
    servicesContentSchema,
    emptySettingsSchema,
  ),
  specialties: defineModule(
    "specialties",
    "Especialidades",
    specialtiesContentSchema,
    specialtiesSettingsSchema,
  ),
  how_it_works: defineModule(
    "how_it_works",
    "Como funciona",
    howItWorksContentSchema,
    emptySettingsSchema,
  ),
  location: defineModule(
    "location",
    "Localização",
    locationContentSchema,
    emptySettingsSchema,
  ),
  audience: defineModule(
    "audience",
    "Para quem",
    audienceContentSchema,
    emptySettingsSchema,
  ),
  contact: defineModule(
    "contact",
    "Contato",
    contactContentSchema,
    emptySettingsSchema,
  ),
  education: defineModule(
    "education",
    "Formação",
    educationContentSchema,
    emptySettingsSchema,
  ),
  faq: defineModule("faq", "FAQ", faqContentSchema, emptySettingsSchema),
};

export function isModuleKey(value: string): value is ModuleKey {
  return moduleKeys.some((key) => key === value);
}

export function getModuleDefinition(moduleKey: string): ModuleDefinition | null {
  if (!isModuleKey(moduleKey)) {
    return null;
  }
  return moduleRegistry[moduleKey];
}

export function parseModuleContent(
  moduleKey: string,
  content: unknown,
):
  | { success: true; data: Record<string, unknown> }
  | { success: false; error: string } {
  const definition = getModuleDefinition(moduleKey);
  if (!definition) {
    return { success: false, error: `Módulo desconhecido: ${moduleKey}` };
  }

  const parsed = definition.contentSchema.safeParse(
    content && typeof content === "object" ? content : {},
  );
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Conteúdo inválido.",
    };
  }
  return { success: true, data: parsed.data };
}

export function parseModuleSettings(
  moduleKey: string,
  settings: unknown,
):
  | { success: true; data: Record<string, unknown> }
  | { success: false; error: string } {
  const definition = getModuleDefinition(moduleKey);
  if (!definition) {
    return { success: false, error: `Módulo desconhecido: ${moduleKey}` };
  }

  const parsed = definition.settingsSchema.safeParse(
    settings && typeof settings === "object" ? settings : {},
  );
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Configuração inválida.",
    };
  }
  return { success: true, data: parsed.data };
}

export function normalizeSectionPayload(
  moduleKey: string,
  content: unknown,
  settings: unknown,
) {
  const contentResult = parseModuleContent(moduleKey, content);
  if (!contentResult.success) {
    return contentResult;
  }
  const settingsResult = parseModuleSettings(moduleKey, settings);
  if (!settingsResult.success) {
    return settingsResult;
  }
  return {
    success: true as const,
    data: {
      content: contentResult.data,
      settings: settingsResult.data,
    },
  };
}

export function moduleLabel(moduleKey: string) {
  return getModuleDefinition(moduleKey)?.label ?? moduleKey;
}
