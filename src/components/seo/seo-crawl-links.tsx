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

  if (!isLive) {
    return (
      <div className="seo-crawl-links">
        <p className="portal-hint" style={{ margin: 0 }}>
          Esta área só libera depois que o site estiver <strong>publicado</strong>.
          Aqui você não edita SEO — só <strong>confere</strong> se o Google
          consegue achar e ler o site no ar (robots, sitemap e ferramentas
          oficiais).
        </p>
      </div>
    );
  }

  return (
    <div className="seo-crawl-links">
      <p className="portal-hint" style={{ marginTop: 0 }}>
        Use estes atalhos para <strong>verificar</strong> o site publicado. Nada
        aqui altera o SEO — a edição fica em Metadados (acima). Abra cada link e
        confira se responde.
      </p>

      <div className="seo-crawl-item">
        <div className="seo-crawl-item-copy">
          <p className="seo-crawl-label">1. Abrir robots.txt</p>
          <p className="seo-crawl-help">
            Arquivo que o Google lê primeiro: o que pode rastrear e onde está o
            mapa do site. Confirme que abre e que aponta o{" "}
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
          <p className="seo-crawl-label">2. Abrir sitemap.xml</p>
          <p className="seo-crawl-help">
            Lista home, blog e posts. Confirme as URLs (domínio próprio, se
            houver). Ajuda o Google a achar páginas — não garante aparecer na
            busca.
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
          <p className="seo-crawl-label">3. Search Console</p>
          <p className="seo-crawl-help">
            Painel do Google: confirmar propriedade (código no formulário
            acima), enviar o sitemap e pedir indexação da home.
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
          <p className="seo-crawl-label">4. Teste de rich results</p>
          <p className="seo-crawl-help">
            Valida se o Google entende o markup do site (FAQ, artigo, dados do
            profissional). Rode na URL pública da home.
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
  );
}
