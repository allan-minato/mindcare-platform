import { z } from "zod";

import { reservedSlugs } from "@/lib/sites/schema";

export const domainVerificationStatuses = [
  "pending",
  "verified",
  "failed",
] as const;

export const domainConfigurationStatuses = [
  "pending",
  "configured",
  "misconfigured",
] as const;

export type DomainVerificationStatus =
  (typeof domainVerificationStatuses)[number];
export type DomainConfigurationStatus =
  (typeof domainConfigurationStatuses)[number];

export type SiteDomain = {
  id: string;
  site_id: string;
  domain: string;
  is_primary: boolean;
  verification_status: DomainVerificationStatus;
  configuration_status: DomainConfigurationStatus;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

const fqdnRegex =
  /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export const siteDomainInputSchema = z.object({
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .transform((value) =>
      value.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, ""),
    )
    .pipe(
      z
        .string()
        .min(1, "Informe o domínio.")
        .max(253, "Domínio com no máximo 253 caracteres.")
        .regex(fqdnRegex, "Informe um domínio válido, como clinica.exemplo.com.br.")
        .refine((value) => {
          const first = value.split(".")[0] ?? "";
          return !(reservedSlugs as readonly string[]).includes(first);
        }, "Este domínio usa um prefixo reservado."),
    ),
});

export function parseSiteDomainForm(formData: FormData) {
  return siteDomainInputSchema.safeParse({
    domain: String(formData.get("domain") ?? ""),
  });
}

export function isDomainVerificationStatus(
  value: string,
): value is DomainVerificationStatus {
  return domainVerificationStatuses.some((status) => status === value);
}

export function isDomainConfigurationStatus(
  value: string,
): value is DomainConfigurationStatus {
  return domainConfigurationStatuses.some((status) => status === value);
}

export function verificationLabel(status: DomainVerificationStatus) {
  switch (status) {
    case "verified":
      return "Verificado";
    case "failed":
      return "Falhou";
    default:
      return "Pendente";
  }
}

export function configurationLabel(status: DomainConfigurationStatus) {
  switch (status) {
    case "configured":
      return "Configurado";
    case "misconfigured":
      return "Desconfigurado";
    default:
      return "Pendente";
  }
}
