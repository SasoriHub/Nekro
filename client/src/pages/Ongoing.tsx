import { useQuery } from "@tanstack/react-query";
import { Play, RefreshCw } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentCard, ContentCardSkeleton } from "@/components/ContentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Content } from "@shared/schema";

export default function Ongoing() {
  const { data: ongoingAnime, isLoading: animeLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/ongoing?type=anime"],
  });

  const { data: ongoingManga, isLoading: mangaLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/ongoing?type=manga"],
  });

  const { data: ongoingManhwa, isLoading: manhwaLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/ongoing?type=manhwa"],
  });

  const renderOngoingContent = (items: Content[] | undefined, isLoading: boolean) => {
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
          <RefreshCw className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h3 className="text-lg font-medium text-foreground">Нет онгоингов</h3>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => (
          <ContentCard key={item.id} content={item} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="border-b border-border/40 bg-gradient-to-r from-neon-cyan/10 via-transparent to-neon-purple/10 py-8">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neon-cyan/20">
                <RefreshCw className="h-5 w-5 text-neon-cyan" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                  Онгоинги
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Тайтлы, которые сейчас выходят
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          <Tabs defaultValue="anime">
            <TabsList className="mb-6 bg-secondary/50">
              <TabsTrigger value="anime" className="gap-2">
                <Play className="h-4 w-4" />
                Аниме
              </TabsTrigger>
              <TabsTrigger value="manga" className="gap-2">
                <Play className="h-4 w-4" />
                Манга
              </TabsTrigger>
              <TabsTrigger value="manhwa" className="gap-2">
                <Play className="h-4 w-4" />
                Манхва
              </TabsTrigger>
            </TabsList>

            <TabsContent value="anime">
              {renderOngoingContent(ongoingAnime, animeLoading)}
            </TabsContent>

            <TabsContent value="manga">
              {renderOngoingContent(ongoingManga, mangaLoading)}
            </TabsContent>

            <TabsContent value="manhwa">
              {renderOngoingContent(ongoingManhwa, manhwaLoading)}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
