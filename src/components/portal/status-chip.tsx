type StatusChipProps = {
  live?: boolean;
  pending?: boolean;
  label?: string;
};

export function StatusChip({
  live = false,
  pending = false,
  label,
}: StatusChipProps) {
  const tone = pending
    ? "portal-chip-pending"
    : live
      ? "portal-chip-live"
      : "portal-chip-draft";

  return (
    <span className={`portal-chip ${tone}`}>
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
      {label ??
        (pending
          ? "No ar · republicar"
          : live
            ? "No ar"
            : "Rascunho")}
    </span>
  );
}
