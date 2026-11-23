/** CSS puro (server-safe). Não colocar em arquivo `"use client"`. */
export const scrollRevealCss = `
.site-reveal {
  opacity: 0;
  transform: translate3d(0, 1.75rem, 0);
  transition:
    opacity 0.95s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.95s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}
.site-reveal.is-in {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}
.site-reveal:not(.is-in) {
  /* saída mais rápida para poder revelar de novo na próxima entrada */
  transition-duration: 0.35s;
  transition-delay: 0ms !important;
}
@media (prefers-reduced-motion: reduce) {
  .site-reveal,
  .site-reveal.is-in {
    opacity: 1;
    transform: none;
    transition: none;
    will-change: auto;
  }
}
`;
