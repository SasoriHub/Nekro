import { Logo } from "@/components/Logo";

const quickLinks = [
  { label: "О сайте", href: "#about" },
  { label: "Лицензии", href: "#licenses" },
  { label: "DMCA", href: "#dmca" },
];

const legalLinks = [
  { label: "Пользовательское соглашение", href: "#terms" },
  { label: "Политика конфиденциальности", href: "#privacy" },
  { label: "Дисклеймер", href: "#disclaimer" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-sm text-muted-foreground">
              Премиальная платформа для просмотра аниме, чтения манги и манхвы.
              Персонализированные рекомендации и высокое качество контента.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Быстрые ссылки</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Правовая информация</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Контент</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/anime"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                >
                  Аниме
                </a>
              </li>
              <li>
                <a
                  href="/manga"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                >
                  Манга
                </a>
              </li>
              <li>
                <a
                  href="/manhwa"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                >
                  Манхва
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border/40 pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} NEKORA — Все права защищены
          </p>
        </div>
      </div>
    </footer>
  );
}
