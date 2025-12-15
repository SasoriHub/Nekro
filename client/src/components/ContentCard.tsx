import { Link } from "wouter";
import { Star, Play, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Content } from "@shared/schema";

interface ContentCardProps {
  content: Content;
  className?: string;
}

export function ContentCard({ content, className }: ContentCardProps) {
  const statusColors: Record<string, string> = {
    ongoing: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    upcoming: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    hiatus: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  const statusLabels: Record<string, string> = {
    ongoing: "Онгоинг",
    completed: "Завершён",
    upcoming: "Скоро",
    hiatus: "Перерыв",
  };

  const typeLabels: Record<string, string> = {
    anime: "Аниме",
    manga: "Манга",
    manhwa: "Манхва",
  };

  const getContentUrl = () => {
    return `/${content.type}/${content.id}`;
  };

  const getCountLabel = () => {
    if (content.type === "anime") {
      return content.episodeCount
        ? `${content.episodeCount} эп.`
        : "? эп.";
    }
    return content.chapterCount
      ? `${content.chapterCount} гл.`
      : "? гл.";
  };

  return (
    <Link href={getContentUrl()}>
      <div
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-lg bg-card transition-all duration-200",
          "hover:scale-[1.02] hover:ring-1 hover:ring-neon-purple/50",
          className
        )}
        data-testid={`card-content-${content.id}`}
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          {content.posterUrl ? (
            <img
              src={content.posterUrl}
              alt={content.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-pink/20">
              {content.type === "anime" ? (
                <Play className="h-12 w-12 text-muted-foreground" />
              ) : (
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Badge
              variant="secondary"
              className="bg-neon-purple/80 text-white border-none text-xs"
            >
              {typeLabels[content.type] || content.type}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-black/60 text-white border-none text-xs"
            >
              {getCountLabel()}
            </Badge>
          </div>

          {content.status && (
            <Badge
              variant="outline"
              className={cn(
                "absolute left-2 top-2 border text-xs",
                statusColors[content.status]
              )}
            >
              {statusLabels[content.status] || content.status}
            </Badge>
          )}
        </div>
        
        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-neon-purple">
            {content.title}
          </h3>
          
          <div className="mt-auto flex items-center gap-2">
            {content.rating && content.rating > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-foreground">
                  {content.rating.toFixed(1)}
                </span>
              </div>
            ) : null}
            
            {content.year && (
              <span className="text-xs text-muted-foreground">{content.year}</span>
            )}
          </div>
          
          {content.genres && content.genres.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {content.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="rounded-sm bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ContentCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-card">
      <div className="aspect-[2/3] animate-pulse bg-secondary" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}
