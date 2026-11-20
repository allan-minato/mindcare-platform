type StatusChipProps = {
  live?: boolean;
  label?: string;
};

export function StatusChip({ live = false, label }: StatusChipProps) {
  return (
    <span className={`portal-chip ${live ? "portal-chip-live" : "portal-chip-draft"}`}>
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "currentColor",
          opacity: 0.85,
        }}
      />
      {label ?? (live ? "No ar" : "Rascunho")}
    </span>
  );
}
