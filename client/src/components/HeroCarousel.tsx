import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Play, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Content } from "@shared/schema";

interface HeroCarouselProps {
  items: Content[];
  autoPlayInterval?: number;
}

export function HeroCarousel({ items, autoPlayInterval = 5000 }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, items.length, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % items.length;
    goToSlide(newIndex);
  }, [currentIndex, items.length, goToSlide]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [goToNext, autoPlayInterval, items.length]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="relative h-[400px] w-full overflow-hidden md:h-[500px] lg:h-[600px]" data-testid="hero-carousel">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <div className="absolute inset-0">
            {item.backdropUrl || item.posterUrl ? (
              <img
                src={item.backdropUrl || item.posterUrl || ""}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-neon-purple/30 to-neon-pink/30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        </div>
      ))}

      <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-4 md:px-6 lg:px-8">
        <div className="flex max-w-xl flex-col gap-4 animate-fade-up">
          <div className="flex flex-wrap items-center gap-2">
            {currentItem.genres?.slice(0, 3).map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="bg-neon-purple/20 text-neon-purple border-neon-purple/30"
              >
                {genre}
              </Badge>
            ))}
            {currentItem.year && (
              <Badge variant="outline" className="border-white/20 text-white/80">
                {currentItem.year}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {currentItem.title}
          </h1>

          {currentItem.titleOriginal && currentItem.titleOriginal !== currentItem.title && (
            <p className="text-lg text-white/70">{currentItem.titleOriginal}</p>
          )}

          <div className="flex items-center gap-4 text-white/80">
            {currentItem.rating && currentItem.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{currentItem.rating.toFixed(1)}</span>
              </div>
            )}
            {currentItem.type === "anime" && currentItem.episodeCount && (
              <span>{currentItem.episodeCount} эпизодов</span>
            )}
            {(currentItem.type === "manga" || currentItem.type === "manhwa") && currentItem.chapterCount && (
              <span>{currentItem.chapterCount} глав</span>
            )}
            {currentItem.status && (
              <Badge
                variant="outline"
                className={cn(
                  "border-none",
                  currentItem.status === "ongoing" && "bg-neon-cyan/20 text-neon-cyan",
                  currentItem.status === "completed" && "bg-green-500/20 text-green-400"
                )}
              >
                {currentItem.status === "ongoing" ? "Онгоинг" : currentItem.status === "completed" ? "Завершён" : currentItem.status}
              </Badge>
            )}
          </div>

          {currentItem.description && (
            <p className="line-clamp-3 text-white/70 md:line-clamp-4">
              {currentItem.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-neon-purple text-white hover:bg-neon-purple/90"
              data-testid="button-watch-now"
            >
              <Link href={`/${currentItem.type}/${currentItem.id}`}>
                <Play className="mr-2 h-5 w-5" />
                {currentItem.type === "anime" ? "Смотреть" : "Читать"}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 z-30 h-12 w-12 -translate-y-1/2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
        data-testid="button-carousel-prev"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        className="absolute right-4 top-1/2 z-30 h-12 w-12 -translate-y-1/2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
        data-testid="button-carousel-next"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-8 bg-neon-purple"
                  : "w-2 bg-white/40 hover:bg-white/60"
              )}
              data-testid={`carousel-dot-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <div className="relative h-[400px] w-full overflow-hidden bg-card md:h-[500px] lg:h-[600px]">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="mx-auto flex h-full max-w-7xl items-center px-4 md:px-6 lg:px-8">
        <div className="flex max-w-xl flex-col gap-4">
          <div className="flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded bg-secondary" />
            <div className="h-6 w-16 animate-pulse rounded bg-secondary" />
          </div>
          <div className="h-12 w-3/4 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-secondary" />
          <div className="h-20 w-full animate-pulse rounded bg-secondary" />
          <div className="h-10 w-32 animate-pulse rounded bg-secondary" />
        </div>
      </div>
    </div>
  );
}
