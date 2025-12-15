import { useQuery } from "@tanstack/react-query";
import { Crown, Medal, Award } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentCard, ContentCardSkeleton } from "@/components/ContentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Content } from "@shared/schema";

export default function Top() {
  const { data: topAnime, isLoading: animeLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/top?type=anime"],
  });

  const { data: topManga, isLoading: mangaLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/top?type=manga"],
  });

  const { data: topManhwa, isLoading: manhwaLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/top?type=manhwa"],
  });

  const renderTopContent = (items: Content[] | undefined, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (!items || items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Crown className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h3 className="text-lg font-medium text-foreground">Нет данных</h3>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item, index) => (
          <div key={item.id} className="relative">
            {index < 3 && (
              <div className="absolute -left-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-sm font-bold text-white shadow-lg">
                {index + 1}
              </div>
            )}
            <ContentCard content={item} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="border-b border-border/40 bg-gradient-to-r from-yellow-500/10 via-transparent to-orange-500/10 py-8">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div>
                <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                  Топ рейтинга
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Лучшие тайтлы по оценкам пользователей
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          <Tabs defaultValue="anime">
            <TabsList className="mb-6 bg-secondary/50">
              <TabsTrigger value="anime" className="gap-2">
                <Medal className="h-4 w-4" />
                Аниме
              </TabsTrigger>
              <TabsTrigger value="manga" className="gap-2">
                <Award className="h-4 w-4" />
                Манга
              </TabsTrigger>
              <TabsTrigger value="manhwa" className="gap-2">
                <Award className="h-4 w-4" />
                Манхва
              </TabsTrigger>
            </TabsList>

            <TabsContent value="anime">
              {renderTopContent(topAnime, animeLoading)}
            </TabsContent>

            <TabsContent value="manga">
              {renderTopContent(topManga, mangaLoading)}
            </TabsContent>

            <TabsContent value="manhwa">
              {renderTopContent(topManhwa, manhwaLoading)}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
