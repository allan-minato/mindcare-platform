import type {
  SeoChecklistGroup,
  SeoChecklistItem,
} from "@/lib/sites/seo";

type SeoChecklistProps = {
  items: SeoChecklistItem[];
};

const groupMeta: Record<
  SeoChecklistGroup,
  { label: string; blurb: string }
> = {
  basico: {
    label: "Fundação",
    blurb: "Sem isso, o site mal se apresenta na busca.",
  },
  descoberta: {
    label: "Descoberta",
    blurb: "Sinais locais e de entidade para Google e respostas com web.",
  },
  conteudo: {
    label: "Conteúdo",
    blurb: "Blog reforça autoridade; resumo e capa ajudam o clique.",
  },
};

const groupOrder: SeoChecklistGroup[] = ["basico", "descoberta", "conteudo"];

export function SeoChecklist({ items }: SeoChecklistProps) {
  const done = items.filter((item) => item.ok).length;
  const total = items.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="seo-check">
      <div className="seo-check-summary">
        <div className="seo-check-score" aria-hidden="true">
          <svg viewBox="0 0 36 36" className="seo-check-ring">
            <path
              className="seo-check-ring-bg"
              d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 1 1 0-31"
            />
            <path
              className="seo-check-ring-fg"
              strokeDasharray={`${percent}, 100`}
              d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 1 1 0-31"
            />
          </svg>
          <span className="seo-check-score-label">{percent}%</span>
        </div>
        <div className="seo-check-summary-copy">
          <p className="seo-check-summary-title">
            {done} de {total} prontos
          </p>
          <p className="seo-check-summary-desc">
            Cada item aumenta a chance de o site ser entendido e citado em busca
            e em ferramentas com pesquisa na web.
          </p>
        </div>
      </div>

      <div className="seo-check-groups">
        {groupOrder.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) {
            return null;
          }
          const groupDone = groupItems.filter((item) => item.ok).length;
          const meta = groupMeta[group];

          return (
            <section key={group} className="seo-check-group">
              <header className="seo-check-group-head">
                <div>
                  <h3 className="seo-check-group-title">{meta.label}</h3>
                  <p className="seo-check-group-blurb">{meta.blurb}</p>
                </div>
                <span className="seo-check-group-count">
                  {groupDone}/{groupItems.length}
                </span>
              </header>
              <ul className="seo-check-list">
                {groupItems.map((item) => (
                  <li
                    key={item.id}
                    className={`seo-check-item${item.ok ? " is-ok" : " is-todo"}`}
                  >
                    <span className="seo-check-mark" aria-hidden="true">
                      {item.ok ? "✓" : "!"}
                    </span>
                    <div className="seo-check-item-copy">
                      <p className="seo-check-item-label">{item.label}</p>
                      {item.hint ? (
                        <p className="seo-check-item-hint">{item.hint}</p>
                      ) : item.ok ? (
                        <p className="seo-check-item-hint">Pronto.</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
