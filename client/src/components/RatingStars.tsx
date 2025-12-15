import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RatingStars({
  rating,
  maxRating = 10,
  onRate,
  readonly = false,
  size = "md",
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const displayRating = hoverRating || rating;

  return (
    <div
      className="flex items-center gap-0.5"
      data-testid="rating-stars"
      onMouseLeave={() => !readonly && setHoverRating(0)}
    >
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;
        const isHalfFilled = starValue - 0.5 <= displayRating && displayRating < starValue;

        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => onRate?.(starValue)}
            onMouseEnter={() => !readonly && setHoverRating(starValue)}
            className={cn(
              "transition-colors",
              !readonly && "cursor-pointer hover:scale-110"
            )}
            data-testid={`star-${starValue}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : isHalfFilled
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        );
      })}
      {rating > 0 && (
        <span className={cn(
          "ml-2 font-medium text-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-lg"
        )}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  maxRating?: number;
}

export function RatingInput({ value, onChange, maxRating = 10 }: RatingInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <RatingStars
          rating={value}
          maxRating={maxRating}
          onRate={onChange}
          size="lg"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Нажмите на звезду, чтобы оценить
      </p>
    </div>
  );
}
