"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { StarRating } from "./StarRating";
import { ThumbsUp, ThumbsDown, BadgeCheck, Trash2 } from "lucide-react";
import { useToastStore } from "@/store/toast";
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

interface ReviewCardProps {
  review: Review;
  onVote?: () => void;
  onDelete?: () => void;
}

export function ReviewCard({ review, onVote, onDelete }: ReviewCardProps) {
  const { data: session } = useSession();
  const addToast = useToastStore((state) => state.addToast);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if current user voted
  const userVote = review.votes?.find((v) => v.userId === session?.user?.id);
  const votedHelpful = userVote?.helpful === true;
  const votedNotHelpful = userVote?.helpful === false;

  const handleVote = async (helpful: boolean) => {
    if (!session?.user) {
      addToast("Please sign in to vote", "error");
      return;
    }

    setIsVoting(true);

    try {
      await axios.post(`/api/reviews/${review.id}/vote`, { helpful });
      addToast("Vote recorded!", "success");
      if (onVote) onVote();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to vote",
        "error"
      );
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await axios.delete(`/api/reviews/${review.id}`);
      addToast("Review deleted successfully", "success");
      if (onDelete) onDelete();
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to delete review",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const isOwnReview = session?.user?.id === review.user.id;
  const canDelete = isOwnReview || session?.user?.isAdmin;

  return (
    <div className="border-b border-zinc-800 pb-6 last:border-b-0">
      {/* User Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {review.user.image ? (
            <img
              src={review.user.image}
              alt={review.user.name || "User"}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
              {(review.user.name?.[0] || "U").toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.user.name || "Anonymous"}</span>
              {review.verified && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <BadgeCheck className="w-4 h-4" />
                  Verified Purchase
                </span>
              )}
            </div>
            <span className="text-sm text-zinc-500">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Rating and Title */}
      <div className="mb-2">
        <StarRating rating={review.rating} size="sm" />
      </div>
      <h4 className="font-semibold mb-2">{review.title}</h4>

      {/* Comment */}
      <p className="text-zinc-300 mb-4">{review.comment}</p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            />
          ))}
        </div>
      )}

      {/* Helpful Votes */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-500">Was this helpful?</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote(true)}
            disabled={isVoting || !session?.user}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${votedHelpful
              ? "bg-green-500/20 text-green-400 border border-green-500"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ThumbsUp className="w-4 h-4" />
            {votedHelpful ? "Helpful" : "Yes"}
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={isVoting || !session?.user}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${votedNotHelpful
              ? "bg-red-500/20 text-red-400 border border-red-500"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ThumbsDown className="w-4 h-4" />
            {votedNotHelpful ? "Not Helpful" : "No"}
          </button>
        </div>
        {review.helpfulCount > 0 && (
          <span className="text-sm text-zinc-500">
            {review.helpfulCount} {review.helpfulCount === 1 ? "person" : "people"} found
            this helpful
          </span>
        )}
      </div>
    </div>
  );
}
