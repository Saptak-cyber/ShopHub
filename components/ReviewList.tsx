"use client";

import { useState, useEffect } from "react";
import { ReviewCard } from "./ReviewCard";
import { StarRating } from "./StarRating";
import { Card } from "./ui/Card";
import Button from "./ui/Button";
import { ChevronDown } from "lucide-react";
import axios from "axios";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  helpfulCount: number;
  verified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  votes?: Array<{
    userId: string;
    helpful: boolean;
  }>;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

interface ReviewListProps {
  productId: string;
}

export function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  
  // Filters
  const [sortBy, setSortBy] = useState<"newest" | "helpful" | "rating_high" | "rating_low">("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterVerified, setFilterVerified] = useState(false);

  const limit = 10;

  const fetchReviews = async (reset: boolean = false) => {
    try {
      const currentOffset = reset ? 0 : offset;
      
      const params = new URLSearchParams({
        productId,
        sortBy,
        limit: limit.toString(),
        offset: currentOffset.toString()
      });

      if (filterRating) {
        params.append("rating", filterRating.toString());
      }

      if (filterVerified) {
        params.append("verified", "true");
      }

      const response = await axios.get(`/api/reviews?${params.toString()}`);
      
      if (reset) {
        setReviews(response.data.data.reviews);
        setOffset(limit);
      } else {
        setReviews([...reviews, ...response.data.data.reviews]);
        setOffset(offset + limit);
      }

      setHasMore(response.data.data.hasMore);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/products/${productId}/reviews/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching review stats:", error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchReviews(true);
    fetchStats();
  }, [productId, sortBy, filterRating, filterVerified]);

  const handleLoadMore = () => {
    fetchReviews(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setOffset(0);
    fetchReviews(true);
    fetchStats();
  };

  if (isLoading && reviews.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-zinc-400">Loading reviews...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      {stats && stats.totalReviews > 0 && (
        <Card className="p-6">
          <div className="flex items-start gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <StarRating rating={stats.averageRating} size="md" />
              <div className="text-sm text-zinc-500 mt-2">
                {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.distribution[rating] || 0;
                const percentage =
                  stats.totalReviews > 0
                    ? (count / stats.totalReviews) * 100
                    : 0;

                return (
                  <button
                    key={rating}
                    onClick={() =>
                      setFilterRating(filterRating === rating ? null : rating)
                    }
                    className={`flex items-center gap-2 w-full mb-2 hover:bg-zinc-800 p-2 rounded-lg transition-colors ${
                      filterRating === rating ? "bg-zinc-800" : ""
                    }`}
                  >
                    <span className="text-sm w-12 text-left">{rating} star</span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-zinc-500 w-12 text-right">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Filters and Sorting */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
            </select>
          </div>

          {/* Filter by Verified */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterVerified}
              onChange={(e) => setFilterVerified(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-sm">Verified purchases only</span>
          </label>

          {/* Clear Filters */}
          {(filterRating || filterVerified) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterRating(null);
                setFilterVerified(false);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-zinc-400">
            No reviews yet. Be the first to review this product!
          </p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onVote={handleRefresh}
                onDelete={handleRefresh}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Load More Reviews
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
