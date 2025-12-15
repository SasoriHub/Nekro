import { useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/Header";
import { HLSVideoPlayer } from "@/components/HLSVideoPlayer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { ContentWithEpisodes, Episode, WatchHistory } from "@shared/schema";

export default function Watch() {
  const params = useParams<{ id: string; episodeId: string }>();
  const { id, episodeId } = params;
  const [, setLocation] = useLocation();

  const { data: content, isLoading } = useQuery<ContentWithEpisodes>({
    queryKey: ["/api/content", id],
  });

  const { data: watchHistory } = useQuery<WatchHistory | null>({
    queryKey: ["/api/history", id, episodeId],
    enabled: !!episodeId,
  });

  const updateHistoryMutation = useMutation({
    mutationFn: async (progress: number) => {
      await apiRequest("POST", "/api/history", {
        contentId: id,
        episodeId,
        progress,
        duration: currentEpisode?.duration || 0,
        completed: currentEpisode?.duration
          ? progress >= currentEpisode.duration * 0.9
          : false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/history"] });
    },
  });

  const episodes = content?.episodes || [];
  const currentEpisode = episodes.find((ep) => ep.id === episodeId);
  const currentIndex = episodes.findIndex((ep) => ep.id === episodeId);
  const previousEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode =
    currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  const handleProgress = (progress: number) => {
    if (Math.floor(progress) % 30 === 0) {
      updateHistoryMutation.mutate(progress);
    }
  };

  const handleEnded = () => {
    updateHistoryMutation.mutate(currentEpisode?.duration || 0);
  };

  const goToEpisode = (ep: Episode) => {
    setLocation(`/anime/${id}/watch/${ep.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <div className="aspect-video w-full animate-pulse bg-gray-900" />
      </div>
    );
  }

  if (!content || !currentEpisode) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Эпизод не найден
            </h1>
            <Button asChild className="mt-4">
              <Link href={`/anime/${id}`}>К аниме</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <header className="flex items-center justify-between gap-4 bg-black/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <Link href={`/anime/${id}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Назад
            </Link>
          </Button>
          <div>
            <h1 className="text-sm font-medium text-white">{content.title}</h1>
            <p className="text-xs text-white/60">
              Эпизод {currentEpisode.number}
              {currentEpisode.title && ` — ${currentEpisode.title}`}
            </p>
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
              data-testid="button-episode-list"
            >
              <List className="mr-2 h-4 w-4" />
              Эпизоды
            </Button>
          </SheetTrigger>
          <SheetContent className="w-80 bg-background">
            <SheetHeader>
              <SheetTitle>Эпизоды</SheetTitle>
            </SheetHeader>
            <ScrollArea className="mt-4 h-[calc(100vh-8rem)]">
              <div className="space-y-1 pr-4">
                {episodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => goToEpisode(ep)}
                    className={cn(
                      "w-full rounded-lg p-3 text-left transition-colors",
                      ep.id === currentEpisode.id
                        ? "bg-neon-purple text-white"
                        : "hover:bg-secondary"
                    )}
                    data-testid={`episode-item-${ep.number}`}
                  >
                    <div className="font-medium">Эпизод {ep.number}</div>
                    {ep.title && (
                      <div className="mt-0.5 line-clamp-1 text-sm opacity-80">
                        {ep.title}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-7xl">
          <HLSVideoPlayer
            src={currentEpisode.videoUrl || ""}
            poster={currentEpisode.thumbnailUrl || content.backdropUrl || undefined}
            title={currentEpisode.title || undefined}
            episodeNumber={currentEpisode.number}
            initialProgress={watchHistory?.progress || 0}
            onProgress={handleProgress}
            onEnded={handleEnded}
            openingStart={currentEpisode.openingStart || undefined}
            openingEnd={currentEpisode.openingEnd || undefined}
            endingStart={currentEpisode.endingStart || undefined}
            endingEnd={currentEpisode.endingEnd || undefined}
            hasPreviousEpisode={!!previousEpisode}
            hasNextEpisode={!!nextEpisode}
            onPreviousEpisode={
              previousEpisode ? () => goToEpisode(previousEpisode) : undefined
            }
            onNextEpisode={
              nextEpisode ? () => goToEpisode(nextEpisode) : undefined
            }
          />
        </div>

        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 p-4">
          {previousEpisode ? (
            <Button
              variant="outline"
              onClick={() => goToEpisode(previousEpisode)}
              className="border-white/20 text-white hover:bg-white/10"
              data-testid="button-prev"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Эпизод {previousEpisode.number}
            </Button>
          ) : (
            <div />
          )}

          {nextEpisode && (
            <Button
              onClick={() => goToEpisode(nextEpisode)}
              className="bg-neon-purple text-white hover:bg-neon-purple/90"
              data-testid="button-next"
            >
              Эпизод {nextEpisode.number}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
