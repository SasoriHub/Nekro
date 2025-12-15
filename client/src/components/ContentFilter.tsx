import { useState } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const genres = [
  "Экшен",
  "Приключения",
  "Комедия",
  "Драма",
  "Фэнтези",
  "Ужасы",
  "Меха",
  "Романтика",
  "Фантастика",
  "Повседневность",
  "Спорт",
  "Триллер",
  "Исекай",
  "Школа",
];

const years = Array.from({ length: 30 }, (_, i) => 2025 - i);

const statuses = [
  { value: "ongoing", label: "Онгоинг" },
  { value: "completed", label: "Завершён" },
  { value: "upcoming", label: "Анонс" },
];

const sortOptions = [
  { value: "rating", label: "По рейтингу" },
  { value: "year", label: "По году" },
  { value: "title", label: "По названию" },
  { value: "views", label: "По популярности" },
];

export interface FilterState {
  genres: string[];
  year: string | null;
  status: string | null;
  sort: string;
}

interface ContentFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

export function ContentFilter({ filters, onFiltersChange, className }: ContentFilterProps) {
  const [isGenresOpen, setIsGenresOpen] = useState(true);

  const handleGenreToggle = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter((g) => g !== genre)
      : [...filters.genres, genre];
    onFiltersChange({ ...filters, genres: newGenres });
  };

  const handleReset = () => {
    onFiltersChange({
      genres: [],
      year: null,
      status: null,
      sort: "rating",
    });
  };

  const hasActiveFilters =
    filters.genres.length > 0 || filters.year || filters.status;

  return (
    <div className={cn("space-y-6", className)} data-testid="content-filter">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-foreground">
          <Filter className="h-5 w-5" />
          <span className="font-medium">Фильтры</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground"
            data-testid="button-reset-filters"
          >
            <X className="mr-1 h-4 w-4" />
            Сбросить
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Сортировка</Label>
          <Select
            value={filters.sort}
            onValueChange={(value) => onFiltersChange({ ...filters, sort: value })}
          >
            <SelectTrigger data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Статус</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value === "all" ? null : value,
              })
            }
          >
            <SelectTrigger data-testid="select-status">
              <SelectValue placeholder="Любой" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любой</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Год</Label>
          <Select
            value={filters.year || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                year: value === "all" ? null : value,
              })
            }
          >
            <SelectTrigger data-testid="select-year">
              <SelectValue placeholder="Любой" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любой</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Collapsible open={isGenresOpen} onOpenChange={setIsGenresOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex w-full items-center justify-between p-0 hover:bg-transparent"
            >
              <Label className="text-sm text-muted-foreground">Жанры</Label>
              {isGenresOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-2">
              {genres.map((genre) => (
                <div key={genre} className="flex items-center gap-2">
                  <Checkbox
                    id={`genre-${genre}`}
                    checked={filters.genres.includes(genre)}
                    onCheckedChange={() => handleGenreToggle(genre)}
                    data-testid={`checkbox-genre-${genre}`}
                  />
                  <Label
                    htmlFor={`genre-${genre}`}
                    className="cursor-pointer text-sm text-foreground"
                  >
                    {genre}
                  </Label>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

interface MobileFilterProps extends ContentFilterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFilter({ isOpen, onClose, ...props }: MobileFilterProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-xl bg-background p-4 animate-slide-in-right">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Фильтры</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ContentFilter {...props} />
        <div className="mt-6">
          <Button onClick={onClose} className="w-full" data-testid="button-apply-filters">
            Применить
          </Button>
        </div>
      </div>
    </div>
  );
}
