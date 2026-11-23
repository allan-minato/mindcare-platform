"use client";

/** Ano no cliente — evita Date no pré-render (Cache Components). */
export function CurrentYear() {
  return <>{new Date().getFullYear()}</>;
}
