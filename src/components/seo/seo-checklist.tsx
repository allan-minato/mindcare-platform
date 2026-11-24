import type {
  SeoChecklistGroup,
  SeoChecklistItem,
} from "@/lib/sites/seo";

type SeoChecklistProps = {
  items: SeoChecklistItem[];
};

const groupLabels: Record<SeoChecklistGroup, string> = {
  basico: "Básico",
  descoberta: "Descoberta (busca e IA)",
  conteudo: "Conteúdo",
};

const groupOrder: SeoChecklistGroup[] = ["basico", "descoberta", "conteudo"];

export function SeoChecklist({ items }: SeoChecklistProps) {
  const done = items.filter((item) => item.ok).length;

  return (
    <div className="grid gap-4">
      <p className="portal-hint" style={{ margin: 0 }}>
        {done} de {items.length} itens prontos · ajuda Google e recomendações
        (ex.: ChatGPT com busca na web)
      </p>
      {groupOrder.map((group) => {
        const groupItems = items.filter((item) => item.group === group);
        if (groupItems.length === 0) {
          return null;
        }
        return (
          <div key={group} className="grid gap-2">
            <p
              className="text-xs font-medium uppercase tracking-wide text-zinc-500"
              style={{ margin: 0 }}
            >
              {groupLabels[group]}
            </p>
            <ul
              className="grid gap-2"
              style={{ margin: 0, padding: 0, listStyle: "none" }}
            >
              {groupItems.map((item) => (
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
      })}
    </div>
  );
}
