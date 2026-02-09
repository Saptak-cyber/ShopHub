"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  showCount?: boolean;
  count?: number;
}

export function StarRating({
  rating,
  onChange,
  size = "md",
  interactive = false,
  showCount = false,
  count
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= displayRating;
        const partialFill = !filled && value - 0.5 <= displayRating;

        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => interactive && setHoverRating(value)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            disabled={!interactive}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"
              } disabled:cursor-default`}
          >
            {partialFill ? (
              <div className="relative">
                <Star className={`${sizeClasses[size]} text-zinc-700`} />
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star
                    className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`}
                  />
                </div>
              </div>
            ) : (
              <Star
                className={`${sizeClasses[size]} ${filled
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-zinc-700"
                  }`}
              />
            )}
          </button>
        );
      })}
      {showCount && count !== undefined && (
        <span className="ml-2 text-sm text-zinc-400">
          ({count})
        </span>
      )}
    </div>
  );
}
