type SeoCrawlLinksProps = {
  /** Origem pública canônica, sem barra final. Ex.: https://clinica.com.br */
  publicOrigin: string;
  isLive: boolean;
};

export function SeoCrawlLinks({ publicOrigin, isLive }: SeoCrawlLinksProps) {
  const origin = publicOrigin.replace(/\/$/, "");
  const robotsUrl = `${origin}/robots.txt`;
  const sitemapUrl = `${origin}/sitemap.xml`;
  const richResultsUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(`${origin}/`)}`;
  const gscUrl = "https://search.google.com/search-console";

  return (
    <div className="seo-crawl-links">
      <p className="portal-hint" style={{ marginTop: 0 }}>
        {isLive
          ? "URLs que o Google usa para rastrear o site publicado. Abra e confira se respondem."
          : "Estas URLs só respondem depois que o site estiver publicado no ar."}
      </p>
      <ul className="seo-crawl-list">
        <li>
          <span className="seo-crawl-label">robots.txt</span>
          <a
            href={robotsUrl}
            target="_blank"
            rel="noreferrer"
            className="seo-crawl-url"
          >
            {robotsUrl}
          </a>
        </li>
        <li>
          <span className="seo-crawl-label">sitemap.xml</span>
          <a
            href={sitemapUrl}
            target="_blank"
            rel="noreferrer"
            className="seo-crawl-url"
          >
            {sitemapUrl}
          </a>
        </li>
      </ul>
      <div className="seo-crawl-actions">
        <a
          href={richResultsUrl}
          target="_blank"
          rel="noreferrer"
          className="portal-btn portal-btn-ghost"
        >
          Testar rich results
        </a>
        <a
          href={gscUrl}
          target="_blank"
          rel="noreferrer"
          className="portal-btn portal-btn-ghost"
        >
          Search Console
        </a>
      </div>
    </div>
  );
}
