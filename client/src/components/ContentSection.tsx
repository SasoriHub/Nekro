import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentCard, ContentCardSkeleton } from "@/components/ContentCard";
import type { Content } from "@shared/schema";

interface ContentSectionProps {
  title: string;
  items: Content[];
  viewAllLink?: string;
  isLoading?: boolean;
}

export function ContentSection({ title, items, viewAllLink, isLoading }: ContentSectionProps) {
  if (isLoading) {
    return (
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="h-8 w-48 animate-pulse rounded bg-secondary" />
            <div className="h-8 w-24 animate-pulse rounded bg-secondary" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-8" data-testid={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-foreground md:text-2xl">{title}</h2>
          {viewAllLink && (
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href={viewAllLink}>
                Все
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ContinueWatchingSectionProps {
  items: Array<{
    content: Content;
    progress: number;
    duration: number;
    episodeNumber?: number;
  }>;
  isLoading?: boolean;
}

export function ContinueWatchingSection({ items, isLoading }: ContinueWatchingSectionProps) {
  if (isLoading) {
    return (
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mb-4 h-8 w-48 animate-pulse rounded bg-secondary" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-video animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-8" data-testid="section-continue-watching">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground md:text-2xl">
          Продолжить просмотр
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.content.id}
              href={`/anime/${item.content.id}/watch`}
            >
              <div className="group relative overflow-hidden rounded-lg bg-card transition-transform hover:scale-[1.02]">
                <div className="aspect-video overflow-hidden">
                  {item.content.backdropUrl || item.content.posterUrl ? (
                    <img
                      src={item.content.backdropUrl || item.content.posterUrl || ""}
                      alt={item.content.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-pink/20">
                      <span className="text-4xl text-muted-foreground">▶</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="line-clamp-1 text-sm font-medium text-white">
                    {item.content.title}
                  </h3>
                  {item.episodeNumber && (
                    <p className="text-xs text-white/70">Эпизод {item.episodeNumber}</p>
                  )}
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/30">
                    <div
                      className="h-full rounded-full bg-neon-purple"
                      style={{
                        width: `${(item.progress / item.duration) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
