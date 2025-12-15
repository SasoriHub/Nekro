import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentCard, ContentCardSkeleton } from "@/components/ContentCard";
import { ContentFilter, MobileFilter, type FilterState } from "@/components/ContentFilter";
import type { Content, ContentType } from "@shared/schema";

interface CatalogProps {
  type: ContentType;
}

const typeLabels: Record<ContentType, string> = {
  anime: "Аниме",
  manga: "Манга",
  manhwa: "Манхва",
};

const typeDescriptions: Record<ContentType, string> = {
  anime: "Каталог японской анимации — от классики до новейших сериалов",
  manga: "Японские комиксы для чтения онлайн — тысячи тайтлов",
  manhwa: "Корейские веб-комиксы — лучшие истории в цвете",
};

export default function Catalog({ type }: CatalogProps) {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  
  const [filters, setFilters] = useState<FilterState>({
    genres: params.get("genres")?.split(",").filter(Boolean) || [],
    year: params.get("year") || null,
    status: params.get("status") || null,
    sort: params.get("sort") || "rating",
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const buildQueryString = () => {
    const queryParams = new URLSearchParams();
    queryParams.set("type", type);
    if (filters.sort) queryParams.set("sort", filters.sort);
    if (filters.status) queryParams.set("status", filters.status);
    if (filters.year) queryParams.set("year", filters.year);
    if (filters.genres.length > 0) queryParams.set("genres", filters.genres.join(","));
    return queryParams.toString();
  };

  const { data: content, isLoading } = useQuery<Content[]>({
    queryKey: [`/api/content?${buildQueryString()}`],
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="border-b border-border/40 bg-card/30 py-8">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              {typeLabels[type]}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {typeDescriptions[type]}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          <div className="flex gap-8">
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-24">
                <ContentFilter
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
            </aside>

            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
                <span className="text-sm text-muted-foreground">
                  {content?.length || 0} результатов
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileFilterOpen(true)}
                  data-testid="button-open-filters"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Фильтры
                </Button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <ContentCardSkeleton key={i} />
                  ))}
                </div>
              ) : content && content.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
                  {content.map((item) => (
                    <ContentCard key={item.id} content={item} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 text-6xl text-muted-foreground/30">
                    {type === "anime" ? "🎬" : "📚"}
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-foreground">
                    Ничего не найдено
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Попробуйте изменить параметры фильтра
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      <MobileFilter
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}
