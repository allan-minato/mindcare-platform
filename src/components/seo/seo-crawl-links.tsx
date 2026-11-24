type SeoCrawlLinksProps = {
  /** Origem pública canônica, sem barra final. Ex.: https://clinica.com.br */
  publicOrigin: string;
  isLive: boolean;
};

/**
 * Atalhos opcionais para validar o site no Google.
 * Só aparece (recolhido) quando o site está publicado — não é passo obrigatório do SEO.
 */
export function SeoCrawlLinks({ publicOrigin, isLive }: SeoCrawlLinksProps) {
  if (!isLive) {
    return null;
  }

  const origin = publicOrigin.replace(/\/$/, "");
  const robotsUrl = `${origin}/robots.txt`;
  const sitemapUrl = `${origin}/sitemap.xml`;
  const richResultsUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(`${origin}/`)}`;
  const gscUrl = "https://search.google.com/search-console";

  return (
    <details className="seo-guide seo-crawl-disclosure">
      <summary>Avançado: conferir no Google (opcional)</summary>
      <p className="portal-hint" style={{ marginTop: "0.75rem" }}>
        Não edita o SEO. Só atalhos para validar o site já publicado — robots,
        sitemap e ferramentas oficiais.
      </p>
      <div className="seo-crawl-links">
        <div className="seo-crawl-item">
          <div className="seo-crawl-item-copy">
            <p className="seo-crawl-label">robots.txt</p>
            <p className="seo-crawl-help">
              Confirme que abre e aponta o{" "}
              <code className="seo-code">sitemap.xml</code>.
            </p>
          </div>
          <a
            href={robotsUrl}
            target="_blank"
            rel="noreferrer"
            className="seo-crawl-url"
          >
            {robotsUrl}
          </a>
        </div>

        <div className="seo-crawl-item">
          <div className="seo-crawl-item-copy">
            <p className="seo-crawl-label">sitemap.xml</p>
            <p className="seo-crawl-help">
              Lista home, blog e posts com as URLs públicas.
            </p>
          </div>
          <a
            href={sitemapUrl}
            target="_blank"
            rel="noreferrer"
            className="seo-crawl-url"
          >
            {sitemapUrl}
          </a>
        </div>

        <div className="seo-crawl-item">
          <div className="seo-crawl-item-copy">
            <p className="seo-crawl-label">Search Console</p>
            <p className="seo-crawl-help">
              Confirmar propriedade, enviar sitemap e pedir indexação.
            </p>
          </div>
          <a
            href={gscUrl}
            target="_blank"
            rel="noreferrer"
            className="portal-btn portal-btn-ghost"
          >
            Abrir Search Console
          </a>
        </div>

        <div className="seo-crawl-item">
          <div className="seo-crawl-item-copy">
            <p className="seo-crawl-label">Teste de rich results</p>
            <p className="seo-crawl-help">
              Valida se o Google lê o markup (FAQ, artigo, etc.).
            </p>
          </div>
          <a
            href={richResultsUrl}
            target="_blank"
            rel="noreferrer"
            className="portal-btn portal-btn-ghost"
          >
            Testar URL publicada
          </a>
        </div>
      </div>
    </details>
  );
}
