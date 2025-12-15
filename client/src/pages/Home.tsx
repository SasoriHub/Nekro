import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroCarousel, HeroCarouselSkeleton } from "@/components/HeroCarousel";
import { ContentSection, ContinueWatchingSection } from "@/components/ContentSection";
import type { Content, WatchHistoryWithContent } from "@shared/schema";

export default function Home() {
  const { data: featured, isLoading: featuredLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/featured"],
  });

  const { data: trending, isLoading: trendingLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/trending"],
  });

  const { data: newReleases, isLoading: newReleasesLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/new"],
  });

  const { data: topRated, isLoading: topRatedLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/top"],
  });

  const { data: ongoing, isLoading: ongoingLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/ongoing"],
  });

  const { data: watchHistory, isLoading: historyLoading } = useQuery<WatchHistoryWithContent[]>({
    queryKey: ["/api/user/history"],
    retry: false,
  });

  const continueWatchingItems = watchHistory?.filter(h => !h.completed).map(h => ({
    content: h.content,
    progress: h.progress || 0,
    duration: h.duration || 1,
    episodeNumber: h.episode?.number,
  })) || [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {featuredLoading ? (
          <HeroCarouselSkeleton />
        ) : featured && featured.length > 0 ? (
          <HeroCarousel items={featured} />
        ) : null}

        <ContinueWatchingSection
          items={continueWatchingItems}
          isLoading={historyLoading}
        />

        <ContentSection
          title="Сейчас в тренде"
          items={trending || []}
          viewAllLink="/anime?sort=views"
          isLoading={trendingLoading}
        />

        <ContentSection
          title="Новинки"
          items={newReleases || []}
          viewAllLink="/anime?sort=year"
          isLoading={newReleasesLoading}
        />

        <ContentSection
          title="Топ по рейтингу"
          items={topRated || []}
          viewAllLink="/top"
          isLoading={topRatedLoading}
        />

        <ContentSection
          title="Онгоинги"
          items={ongoing || []}
          viewAllLink="/ongoing"
          isLoading={ongoingLoading}
        />
      </main>
      
      <Footer />
    </div>
  );
}
