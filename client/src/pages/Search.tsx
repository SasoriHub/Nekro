import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentCard, ContentCardSkeleton } from "@/components/ContentCard";
import type { Content } from "@shared/schema";

export default function Search() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialQuery = params.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const { data: results, isLoading } = useQuery<Content[]>({
    queryKey: [`/api/search?q=${encodeURIComponent(searchQuery)}`],
    enabled: searchQuery.length >= 2,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="border-b border-border/40 bg-card/30 py-8">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Поиск
            </h1>
            <div className="relative max-w-xl">
              <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Введите название аниме, манги или манхвы..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 bg-secondary/50 pl-10 text-base"
                autoFocus
                data-testid="input-search-page"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          {searchQuery.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <SearchIcon className="mb-4 h-16 w-16 text-muted-foreground/30" />
              <h3 className="mb-2 text-lg font-medium text-foreground">
                Начните поиск
              </h3>
              <p className="text-sm text-muted-foreground">
                Введите минимум 2 символа для поиска
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <ContentCardSkeleton key={i} />
              ))}
            </div>
          ) : results && results.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Найдено результатов: {results.length}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {results.map((item) => (
                  <ContentCard key={item.id} content={item} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <SearchIcon className="mb-4 h-16 w-16 text-muted-foreground/30" />
              <h3 className="mb-2 text-lg font-medium text-foreground">
                Ничего не найдено
              </h3>
              <p className="text-sm text-muted-foreground">
                Попробуйте изменить поисковый запрос
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
