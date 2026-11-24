type SeoPageIntroProps = {
  publishNote: string;
};

export function SeoPageIntro({ publishNote }: SeoPageIntroProps) {
  return (
    <div className="seo-intro">
      <h2 className="seo-intro-title">Como o mundo encontra este site</h2>
      <p className="seo-intro-body">
        SEO não é um truque: é a forma como o site se apresenta na busca, no
        WhatsApp e em ferramentas que leem a web (incluindo respostas com
        pesquisa). Preencha com a linguagem do paciente — clara e local.
      </p>
      <ol className="seo-intro-steps">
        <li>
          <span className="seo-intro-num">1</span>
          <span>
            <strong>Escreva título e descrição</strong> e veja a prévia ao lado.
          </span>
        </li>
        <li>
          <span className="seo-intro-num">2</span>
          <span>
            <strong>Informe cidade</strong> e, se tiver, Google Business.
          </span>
        </li>
        <li>
          <span className="seo-intro-num">3</span>
          <span>
            <strong>Salve e publique</strong> — {publishNote}
          </span>
        </li>
      </ol>
    </div>
  );
}
