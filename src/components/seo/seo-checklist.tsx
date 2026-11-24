import type { SeoChecklistItem } from "@/lib/sites/seo";

type SeoChecklistProps = {
  items: SeoChecklistItem[];
};

export function SeoChecklist({ items }: SeoChecklistProps) {
  const done = items.filter((item) => item.ok).length;

  return (
    <div className="grid gap-3">
      <p className="portal-hint" style={{ margin: 0 }}>
        {done} de {items.length} itens prontos
      </p>
      <ul className="grid gap-2" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((item) => (
          <li key={item.id} className="grid gap-0.5">
            <span className="text-sm font-medium">
              {item.ok ? "✓" : "○"} {item.label}
            </span>
            {!item.ok && item.hint ? (
              <span className="portal-hint" style={{ margin: 0 }}>
                {item.hint}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
