import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Play,
  BookOpen,
  Heart,
  Star,
  Calendar,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentCard, ContentCardSkeleton } from "@/components/ContentCard";
import { CommentSection } from "@/components/CommentSection";
import { RatingInput } from "@/components/RatingStars";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { cn } from "@/lib/utils";
import type { ContentWithEpisodes, Episode, Chapter, Content, CommentWithUser, Rating } from "@shared/schema";

export default function ContentDetail() {
  const params = useParams<{ type: string; id: string }>();
  const { type, id } = params;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: content, isLoading } = useQuery<ContentWithEpisodes>({
    queryKey: ["/api/content", id],
  });

  const { data: comments, isLoading: commentsLoading } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/content", id, "comments"],
  });

  const { data: similar, isLoading: similarLoading } = useQuery<Content[]>({
    queryKey: ["/api/content", id, "similar"],
  });

  const { data: userRating } = useQuery<Rating | null>({
    queryKey: ["/api/content", id, "rating"],
    enabled: isAuthenticated,
  });

  const { data: isFavorite } = useQuery<boolean>({
    queryKey: ["/api/favorites", id],
    enabled: isAuthenticated,
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { contentId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
      toast({
        title: isFavorite ? "Удалено из избранного" : "Добавлено в избранное",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Требуется авторизация",
          description: "Войдите, чтобы добавить в избранное",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const ratingMutation = useMutation({
    mutationFn: async (score: number) => {
      await apiRequest("POST", `/api/content/${id}/rate`, { score });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/content", id, "rating"] });
      toast({ title: "Оценка сохранена" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Требуется авторизация",
          description: "Войдите, чтобы оценить",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ text, parentId }: { text: string; parentId?: string }) => {
      await apiRequest("POST", `/api/content/${id}/comments`, { text, parentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content", id, "comments"] });
      toast({ title: "Комментарий добавлен" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Требуется авторизация",
          variant: "destructive",
        });
      }
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content", id, "comments"] });
      toast({ title: "Комментарий удалён" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="h-[400px] animate-pulse bg-card" />
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="h-8 w-1/3 animate-pulse rounded bg-secondary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Не найдено</h1>
            <p className="mt-2 text-muted-foreground">Контент не существует или был удалён</p>
            <Button asChild className="mt-4">
              <Link href="/">На главную</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    ongoing: "Онгоинг",
    completed: "Завершён",
    upcoming: "Анонс",
    hiatus: "Перерыв",
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="relative h-[400px] md:h-[500px]">
          {content.backdropUrl || content.posterUrl ? (
            <img
              src={content.backdropUrl || content.posterUrl || ""}
              alt={content.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neon-purple/30 to-neon-pink/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        </div>

        <div className="relative mx-auto -mt-64 max-w-7xl px-4 md:-mt-72 md:px-6 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="shrink-0">
              <div className="mx-auto w-48 overflow-hidden rounded-lg shadow-2xl md:mx-0 md:w-64">
                {content.posterUrl ? (
                  <img
                    src={content.posterUrl}
                    alt={content.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-pink/20">
                    {content.type === "anime" ? (
                      <Play className="h-16 w-16 text-muted-foreground" />
                    ) : (
                      <BookOpen className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                {content.genres?.map((genre) => (
                  <Badge
                    key={genre}
                    variant="secondary"
                    className="bg-neon-purple/20 text-neon-purple border-neon-purple/30"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                {content.title}
              </h1>

              {content.titleOriginal && content.titleOriginal !== content.title && (
                <p className="text-lg text-muted-foreground">{content.titleOriginal}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {content.rating && content.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">
                      {content.rating.toFixed(1)}
                    </span>
                    {content.ratingCount && (
                      <span>({content.ratingCount} оценок)</span>
                    )}
                  </div>
                )}

                {content.year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{content.year}</span>
                  </div>
                )}

                {content.type === "anime" && content.episodeCount && (
                  <div className="flex items-center gap-1">
                    <Play className="h-4 w-4" />
                    <span>{content.episodeCount} эпизодов</span>
                  </div>
                )}

                {(content.type === "manga" || content.type === "manhwa") && content.chapterCount && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{content.chapterCount} глав</span>
                  </div>
                )}

                {content.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{content.duration} мин.</span>
                  </div>
                )}

                {content.status && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-none",
                      content.status === "ongoing" && "bg-neon-cyan/20 text-neon-cyan",
                      content.status === "completed" && "bg-green-500/20 text-green-400"
                    )}
                  >
                    {statusLabels[content.status] || content.status}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {content.type === "anime" && content.episodes && content.episodes.length > 0 && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-neon-purple text-white hover:bg-neon-purple/90"
                    data-testid="button-watch"
                  >
                    <Link href={`/anime/${content.id}/watch/${content.episodes[0].id}`}>
                      <Play className="mr-2 h-5 w-5" />
                      Смотреть
                    </Link>
                  </Button>
                )}

                {(content.type === "manga" || content.type === "manhwa") && content.chapters && content.chapters.length > 0 && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-neon-purple text-white hover:bg-neon-purple/90"
                    data-testid="button-read"
                  >
                    <Link href={`/${content.type}/${content.id}/read/${content.chapters[0].id}`}>
                      <BookOpen className="mr-2 h-5 w-5" />
                      Читать
                    </Link>
                  </Button>
                )}

                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="lg"
                  onClick={() => favoriteMutation.mutate()}
                  disabled={favoriteMutation.isPending}
                  className={cn(
                    isFavorite && "bg-neon-pink text-white hover:bg-neon-pink/90"
                  )}
                  data-testid="button-favorite"
                >
                  <Heart
                    className={cn("mr-2 h-5 w-5", isFavorite && "fill-current")}
                  />
                  {isFavorite ? "В избранном" : "В избранное"}
                </Button>
              </div>

              {content.description && (
                <p className="text-foreground/80 leading-relaxed">
                  {content.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {content.studio && (
                  <div>
                    <span className="text-muted-foreground">Студия: </span>
                    <span className="text-foreground">{content.studio}</span>
                  </div>
                )}
                {content.author && (
                  <div>
                    <span className="text-muted-foreground">Автор: </span>
                    <span className="text-foreground">{content.author}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="episodes" className="mt-8">
            <TabsList className="bg-secondary/50">
              {content.type === "anime" && (
                <TabsTrigger value="episodes">Эпизоды</TabsTrigger>
              )}
              {(content.type === "manga" || content.type === "manhwa") && (
                <TabsTrigger value="chapters">Главы</TabsTrigger>
              )}
              <TabsTrigger value="comments">Комментарии</TabsTrigger>
              {isAuthenticated && (
                <TabsTrigger value="rating">Оценить</TabsTrigger>
              )}
            </TabsList>

            {content.type === "anime" && (
              <TabsContent value="episodes" className="mt-6">
                {content.episodes && content.episodes.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {content.episodes.map((episode) => (
                      <EpisodeCard
                        key={episode.id}
                        episode={episode}
                        contentId={content.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Эпизоды пока не добавлены
                  </div>
                )}
              </TabsContent>
            )}

            {(content.type === "manga" || content.type === "manhwa") && (
              <TabsContent value="chapters" className="mt-6">
                {content.chapters && content.chapters.length > 0 ? (
                  <div className="space-y-2">
                    {content.chapters.map((chapter) => (
                      <ChapterItem
                        key={chapter.id}
                        chapter={chapter}
                        contentType={content.type}
                        contentId={content.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Главы пока не добавлены
                  </div>
                )}
              </TabsContent>
            )}

            <TabsContent value="comments" className="mt-6">
              <CommentSection
                comments={comments || []}
                onAddComment={(text, parentId) =>
                  commentMutation.mutate({ text, parentId })
                }
                onDeleteComment={(commentId) =>
                  deleteCommentMutation.mutate(commentId)
                }
                isLoading={commentsLoading}
              />
            </TabsContent>

            {isAuthenticated && (
              <TabsContent value="rating" className="mt-6">
                <div className="rounded-lg bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">
                    Ваша оценка
                  </h3>
                  <RatingInput
                    value={userRating?.score || 0}
                    onChange={(score) => ratingMutation.mutate(score)}
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>

          {similar && similar.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Похожие тайтлы
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {similar.slice(0, 6).map((item) => (
                  <ContentCard key={item.id} content={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function EpisodeCard({ episode, contentId }: { episode: Episode; contentId: string }) {
  return (
    <Link href={`/anime/${contentId}/watch/${episode.id}`}>
      <div className="group flex gap-3 rounded-lg bg-card p-3 transition-colors hover:bg-secondary">
        <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md">
          {episode.thumbnailUrl ? (
            <img
              src={episode.thumbnailUrl}
              alt={episode.title || `Эпизод ${episode.number}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neon-purple/20 to-neon-pink/20">
              <Play className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">
            Эпизод {episode.number}
          </div>
          {episode.title && (
            <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {episode.title}
            </div>
          )}
          {episode.duration && (
            <div className="mt-1 text-xs text-muted-foreground">
              {Math.floor(episode.duration / 60)} мин.
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function ChapterItem({
  chapter,
  contentType,
  contentId,
}: {
  chapter: Chapter;
  contentType: string;
  contentId: string;
}) {
  return (
    <Link href={`/${contentType}/${contentId}/read/${chapter.id}`}>
      <div className="flex items-center justify-between rounded-lg bg-card p-4 transition-colors hover:bg-secondary">
        <div>
          <div className="font-medium text-foreground">
            Глава {chapter.number}
          </div>
          {chapter.title && (
            <div className="mt-0.5 text-sm text-muted-foreground">
              {chapter.title}
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </Link>
  );
}
