import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Play, Heart, Clock, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentCard, ContentCardSkeleton } from "@/components/ContentCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { FavoriteWithContent, WatchHistoryWithContent } from "@shared/schema";

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите, чтобы просмотреть профиль",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: favorites, isLoading: favoritesLoading } = useQuery<FavoriteWithContent[]>({
    queryKey: ["/api/user/favorites"],
    enabled: isAuthenticated,
  });

  const { data: history, isLoading: historyLoading } = useQuery<WatchHistoryWithContent[]>({
    queryKey: ["/api/user/history"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neon-purple border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const favoriteContents = favorites?.map((f) => f.content) || [];
  const historyContents = history?.map((h) => h.content) || [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="border-b border-border/40 bg-card/30">
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
              <Avatar className="h-24 w-24 border-4 border-neon-purple/50">
                <AvatarImage
                  src={user.profileImageUrl || undefined}
                  alt={user.firstName || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-pink text-3xl text-white">
                  {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {user.firstName
                    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
                    : user.email?.split("@")[0] || "Пользователь"}
                </h1>
                {user.email && (
                  <p className="text-muted-foreground">{user.email}</p>
                )}
              </div>
              
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {favoriteContents.length}
                  </div>
                  <div className="text-sm text-muted-foreground">В избранном</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {historyContents.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Просмотрено</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          <Tabs defaultValue="favorites">
            <TabsList className="mb-6 bg-secondary/50">
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="h-4 w-4" />
                Избранное
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Clock className="h-4 w-4" />
                История
              </TabsTrigger>
            </TabsList>

            <TabsContent value="favorites">
              {favoritesLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ContentCardSkeleton key={i} />
                  ))}
                </div>
              ) : favoriteContents.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {favoriteContents.map((content) => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Heart className="mb-4 h-16 w-16 text-muted-foreground/30" />
                  <h3 className="mb-2 text-lg font-medium text-foreground">
                    Нет избранных
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Добавляйте аниме и мангу в избранное, чтобы они появились здесь
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              {historyLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ContentCardSkeleton key={i} />
                  ))}
                </div>
              ) : historyContents.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {historyContents.map((content) => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Clock className="mb-4 h-16 w-16 text-muted-foreground/30" />
                  <h3 className="mb-2 text-lg font-medium text-foreground">
                    История пуста
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Начните смотреть аниме или читать мангу, чтобы увидеть историю
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
