import { z } from "zod";

export const professionalStatuses = ["active", "inactive", "archived"] as const;
export const professionalCouncils = ["crp", "crm"] as const;
export const attendanceModes = ["in_person", "online"] as const;

export type ProfessionalStatus = (typeof professionalStatuses)[number];
export type ProfessionalCouncil = (typeof professionalCouncils)[number];
export type AttendanceMode = (typeof attendanceModes)[number];

export type Professional = {
  id: string;
  full_name: string;
  professional_name: string | null;
  council: ProfessionalCouncil | null;
  registration_number: string | null;
  specialty_registration: string | null;
  specialty: string | null;
  bio: string | null;
  education: string[];
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  photo_url: string | null;
  social_links: {
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  office_address: {
    street?: string;
    city?: string;
    state?: string;
    cep?: string;
  };
  attendance_modes: AttendanceMode[];
  status: ProfessionalStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfessionalListItem = Pick<
  Professional,
  "id" | "full_name" | "council" | "registration_number" | "status" | "updated_at"
>;

const emptyToNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const optionalDigits = z
  .string()
  .transform((value) => {
    const digits = digitsOnly(value);
    return digits.length === 0 ? null : digits;
  })
  .refine((value) => value === null || /^[0-9]{10,15}$/.test(value), {
    message: "Use 10 a 15 dígitos, com DDI e DDD.",
  });

const optionalHttpsUrl = z
  .string()
  .transform(emptyToNull)
  .refine((value) => value === null || /^https:\/\//.test(value), {
    message: "A URL da foto precisa começar com https://.",
  });

const optionalEmail = z
  .string()
  .transform(emptyToNull)
  .refine(
    (value) =>
      value === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    { message: "E-mail inválido." },
  );

export const professionalFormSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, "Informe o nome completo.")
      .max(200, "Nome completo com no máximo 200 caracteres."),
    professional_name: z
      .string()
      .transform(emptyToNull)
      .refine((value) => value === null || value.length <= 200, {
        message: "Nome profissional com no máximo 200 caracteres.",
      }),
    status: z.enum(professionalStatuses),
    council: z
      .string()
      .transform((value) => {
        const trimmed = value.trim();
        return trimmed.length === 0 ? null : trimmed;
      })
      .refine(
        (value) =>
          value === null ||
          professionalCouncils.includes(value as ProfessionalCouncil),
        { message: "Conselho inválido." },
      ),
    registration_number: z
      .string()
      .transform(emptyToNull)
      .refine((value) => value === null || value.length <= 40, {
        message: "Registro com no máximo 40 caracteres.",
      }),
    specialty_registration: z
      .string()
      .transform(emptyToNull)
      .refine((value) => value === null || value.length <= 40, {
        message: "RQE com no máximo 40 caracteres.",
      }),
    specialty: z
      .string()
      .transform(emptyToNull)
      .refine((value) => value === null || value.length <= 200, {
        message: "Especialidade com no máximo 200 caracteres.",
      }),
    bio: z
      .string()
      .transform(emptyToNull)
      .refine((value) => value === null || value.length <= 10000, {
        message: "Bio com no máximo 10.000 caracteres.",
      }),
    education: z.string().transform((value) =>
      value
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    ),
    phone: optionalDigits,
    whatsapp: optionalDigits,
    email: optionalEmail,
    photo_url: optionalHttpsUrl,
    attendance_modes: z.array(z.enum(attendanceModes)).default([]),
    street: z.string().transform(emptyToNull),
    city: z.string().transform(emptyToNull),
    state: z.string().transform(emptyToNull),
    cep: z.string().transform(emptyToNull),
    instagram: z.string().transform(emptyToNull),
    linkedin: z.string().transform(emptyToNull),
    website: z.string().transform(emptyToNull),
    internal_notes: z
      .string()
      .transform(emptyToNull)
      .refine((value) => value === null || value.length <= 10000, {
        message: "Nota interna com no máximo 10.000 caracteres.",
      }),
  })
  .superRefine((data, ctx) => {
    const hasCouncil = data.council !== null;
    const hasRegistration = data.registration_number !== null;
    if (hasCouncil !== hasRegistration) {
      ctx.addIssue({
        code: "custom",
        path: ["registration_number"],
        message: "Informe o conselho e o número de registro juntos.",
      });
    }
  });

export type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;

export type ProfessionalWritePayload = {
  full_name: string;
  professional_name: string | null;
  status: ProfessionalStatus;
  council: ProfessionalCouncil | null;
  registration_number: string | null;
  specialty_registration: string | null;
  specialty: string | null;
  bio: string | null;
  education: string[];
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  photo_url: string | null;
  attendance_modes: AttendanceMode[];
  office_address: Professional["office_address"];
  social_links: Professional["social_links"];
  internal_notes: string | null;
};

export function toWritePayload(
  values: ProfessionalFormValues,
): ProfessionalWritePayload {
  const office_address: Professional["office_address"] = {};
  if (values.street) office_address.street = values.street;
  if (values.city) office_address.city = values.city;
  if (values.state) office_address.state = values.state;
  if (values.cep) office_address.cep = values.cep;

  const social_links: Professional["social_links"] = {};
  if (values.instagram) social_links.instagram = values.instagram;
  if (values.linkedin) social_links.linkedin = values.linkedin;
  if (values.website) social_links.website = values.website;

  return {
    full_name: values.full_name,
    professional_name: values.professional_name,
    status: values.status,
    council: values.council as ProfessionalCouncil | null,
    registration_number: values.registration_number,
    specialty_registration: values.specialty_registration,
    specialty: values.specialty,
    bio: values.bio,
    education: values.education,
    phone: values.phone,
    whatsapp: values.whatsapp,
    email: values.email,
    photo_url: values.photo_url,
    attendance_modes: values.attendance_modes,
    office_address,
    social_links,
    internal_notes: values.internal_notes,
  };
}

export function parseProfessionalForm(formData: FormData) {
  return professionalFormSchema.safeParse({
    full_name: String(formData.get("full_name") ?? ""),
    professional_name: String(formData.get("professional_name") ?? ""),
    status: String(formData.get("status") ?? "active"),
    council: String(formData.get("council") ?? ""),
    registration_number: String(formData.get("registration_number") ?? ""),
    specialty_registration: String(formData.get("specialty_registration") ?? ""),
    specialty: String(formData.get("specialty") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    education: String(formData.get("education") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    email: String(formData.get("email") ?? ""),
    photo_url: String(formData.get("photo_url") ?? ""),
    attendance_modes: formData.getAll("attendance_modes").map(String),
    street: String(formData.get("street") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    cep: String(formData.get("cep") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    linkedin: String(formData.get("linkedin") ?? ""),
    website: String(formData.get("website") ?? ""),
    internal_notes: String(formData.get("internal_notes") ?? ""),
  });
}

export function professionalStatusLabel(status: ProfessionalStatus) {
  switch (status) {
    case "active":
      return "Ativo";
    case "inactive":
      return "Inativo";
    case "archived":
      return "Arquivado";
  }
}

export function councilLabel(council: ProfessionalCouncil) {
  return council.toUpperCase();
}
