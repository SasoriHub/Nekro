import { Link } from "wouter";
import { Play, BookOpen, Sparkles, Zap, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const features = [
  {
    icon: Play,
    title: "HD Качество",
    description: "Смотрите аниме в высоком качестве с адаптивным плеером",
  },
  {
    icon: BookOpen,
    title: "Манга и Манхва",
    description: "Читайте любимые тайтлы онлайн с удобной навигацией",
  },
  {
    icon: Sparkles,
    title: "Рекомендации",
    description: "Персональные рекомендации на основе ваших предпочтений",
  },
  {
    icon: Zap,
    title: "Быстрая загрузка",
    description: "Мгновенный доступ к контенту без долгих ожиданий",
  },
  {
    icon: Shield,
    title: "Без рекламы",
    description: "Наслаждайтесь просмотром без отвлекающей рекламы",
  },
  {
    icon: Star,
    title: "Сообщество",
    description: "Обсуждайте серии, ставьте оценки и делитесь мнением",
  },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 via-transparent to-neon-pink/10" />
          <div className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-neon-purple/20 blur-3xl" />
          <div className="absolute -right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-neon-pink/20 blur-3xl" />
          
          <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 flex justify-center">
                <Logo size="lg" />
              </div>
              
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Твоя
                <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent">
                  {" "}аниме-платформа{" "}
                </span>
                нового поколения
              </h1>
              
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                Смотри аниме, читай мангу и манхву в одном месте. 
                Премиальный плеер, персональные рекомендации и огромная библиотека контента.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-neon-purple text-white hover:bg-neon-purple/90"
                  data-testid="button-start-watching"
                >
                  <a href="/api/login">
                    <Play className="mr-2 h-5 w-5" />
                    Начать смотреть
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-border"
                  data-testid="button-browse-catalog"
                >
                  <Link href="/anime">
                    Каталог аниме
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/40 bg-card/30 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
                Почему NEKORA?
              </h2>
              <p className="text-muted-foreground">
                Всё, что нужно для настоящего аниме-фаната
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group rounded-lg border border-border/40 bg-card/50 p-6 transition-colors hover:border-neon-purple/40 hover:bg-card"
                  data-testid={`feature-${index}`}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-neon-purple/10 text-neon-purple transition-colors group-hover:bg-neon-purple/20">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-purple/5 p-6 text-center">
                <div className="mb-2 text-4xl font-bold text-neon-purple">10K+</div>
                <div className="text-muted-foreground">Аниме тайтлов</div>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-neon-pink/20 to-neon-pink/5 p-6 text-center">
                <div className="mb-2 text-4xl font-bold text-neon-pink">50K+</div>
                <div className="text-muted-foreground">Глав манги</div>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/5 p-6 text-center">
                <div className="mb-2 text-4xl font-bold text-neon-cyan">1M+</div>
                <div className="text-muted-foreground">Пользователей</div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/40 bg-gradient-to-b from-card/30 to-background py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 text-center md:px-6 lg:px-8">
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
              Готовы начать?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Присоединяйтесь к сообществу и откройте для себя мир аниме
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-neon-purple to-neon-pink text-white hover:opacity-90"
              data-testid="button-join"
            >
              <a href="/api/login">
                Присоединиться бесплатно
              </a>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
