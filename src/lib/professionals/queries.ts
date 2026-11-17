import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import {
  type AttendanceMode,
  type Professional,
  type ProfessionalCouncil,
  type ProfessionalListItem,
  type ProfessionalStatus,
} from "@/lib/professionals/schema";
import { createClient } from "@/lib/supabase/server";

type ProfessionalRow = {
  id: string;
  full_name: string;
  professional_name: string | null;
  council: string | null;
  registration_number: string | null;
  specialty_registration: string | null;
  specialty: string | null;
  bio: string | null;
  education: unknown;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  photo_url: string | null;
  social_links: unknown;
  office_address: unknown;
  attendance_modes: string[] | null;
  status: string;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listProfessionals(): Promise<ProfessionalListItem[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .select("id, full_name, council, registration_number, status, updated_at")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os profissionais.");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    full_name: row.full_name,
    council: (row.council as ProfessionalCouncil | null) ?? null,
    registration_number: row.registration_number,
    status: row.status as ProfessionalStatus,
    updated_at: row.updated_at,
  }));
}

export async function getProfessional(
  id: string,
): Promise<Professional | null> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .select(
      "id, full_name, professional_name, council, registration_number, specialty_registration, specialty, bio, education, phone, whatsapp, email, photo_url, social_links, office_address, attendance_modes, status, internal_notes, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle<ProfessionalRow>();

  if (error) {
    throw new Error("Não foi possível carregar o profissional.");
  }

  if (!data) {
    return null;
  }

  return mapProfessional(data);
}

function mapProfessional(row: ProfessionalRow): Professional {
  return {
    id: row.id,
    full_name: row.full_name,
    professional_name: row.professional_name,
    council: (row.council as ProfessionalCouncil | null) ?? null,
    registration_number: row.registration_number,
    specialty_registration: row.specialty_registration,
    specialty: row.specialty,
    bio: row.bio,
    education: Array.isArray(row.education)
      ? row.education.filter((item): item is string => typeof item === "string")
      : [],
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    photo_url: row.photo_url,
    social_links: asStringRecord(row.social_links),
    office_address: asStringRecord(row.office_address),
    attendance_modes: Array.isArray(row.attendance_modes)
      ? row.attendance_modes.filter((mode): mode is AttendanceMode =>
          mode === "in_person" || mode === "online",
        )
      : [],
    status: row.status as ProfessionalStatus,
    internal_notes: row.internal_notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string" && entry.trim().length > 0) {
      result[key] = entry;
    }
  }
  return result;
}
