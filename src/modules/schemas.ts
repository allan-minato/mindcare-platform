import { z } from "zod";

const titleBodyItem = z.object({
  title: z.string().trim().min(1, "Informe o título do item.").max(200),
  body: z.string().trim().min(1, "Informe o texto do item.").max(5000),
});

const optionalHttpsUrl = z
  .string()
  .trim()
  .default("")
  .refine(
    (value) =>
      value.length === 0 ||
      /^https:\/\//.test(value) ||
      /^\/media\//.test(value),
    {
      message:
        "A URL da imagem precisa ser https:// ou um caminho /media/….",
    },
  );

export const heroContentSchema = z.object({
  headline: z.string().trim().max(200).default(""),
  support: z.string().trim().max(2000).default(""),
  badges: z.array(z.string().trim().min(1).max(80)).default([]),
  image_url: optionalHttpsUrl,
});

export const recognitionContentSchema = z.object({
  title: z.string().trim().max(200).default(""),
  items: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Informe o título.").max(200),
        detail: z.string().trim().max(1000).default(""),
      }),
    )
    .default([]),
});

export const aboutContentSchema = z.object({
  title: z.string().trim().max(200).default(""),
  body: z.string().trim().max(10000).default(""),
  credential: z.string().trim().max(200).default(""),
  image_url: optionalHttpsUrl,
});

export const approachContentSchema = z.object({
  title: z.string().trim().max(200).default(""),
  pillars: z.array(titleBodyItem).default([]),
});

export const servicesContentSchema = z.object({
  title: z.string().trim().max(200).default(""),
  items: z.array(titleBodyItem).default([]),
});

export const specialtiesContentSchema = z.object({
  title: z.string().trim().max(200).default(""),
  items: z.array(z.string().trim().min(1).max(120)).default([]),
});

export const specialtiesSettingsSchema = z.object({
  display: z.enum(["tags", "cards"]).default("tags"),
});

export const howItWorksContentSchema = z.object({
  title: z.string().trim().max(200).default(""),
  steps: z.array(titleBodyItem).default([]),
});

export const locationContentSchema = z.object({
  title: z.string().trim().max(200).default(""),
  body: z.string().trim().max(5000).default(""),
  modes: z.array(z.enum(["in_person", "online"])).default([]),
});

export const audienceContentSchema = z.object({
  title: z.string().trim().max(200).default(""),
  body: z.string().trim().max(5000).default(""),
});

export const contactContentSchema = z.object({
  title: z.string().trim().max(200).default(""),
  city: z.string().trim().max(120).default(""),
  note: z.string().trim().max(2000).default(""),
});

export const educationContentSchema = z.object({
  title: z.string().trim().max(200).default(""),
  items: z.array(z.string().trim().min(1).max(300)).default([]),
});

export const faqContentSchema = z.object({
  title: z.string().trim().max(200).default(""),
  items: z
    .array(
      z.object({
        question: z.string().trim().min(1, "Informe a pergunta.").max(300),
        answer: z.string().trim().min(1, "Informe a resposta.").max(5000),
      }),
    )
    .default([]),
});

export const emptySettingsSchema = z.object({}).default({});
