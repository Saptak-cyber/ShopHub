"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { StarRating } from "./StarRating";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { Card } from "./ui/Card";
import ImageUploadMultiple from "./ImageUploadMultiple";
import { useToastStore } from "@/store/toast";
import axios from "axios";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      addToast("Please sign in to leave a review", "error");
      router.push("/login");
      return;
    }

    if (rating === 0) {
      addToast("Please select a rating", "error");
      return;
    }

    if (comment.length < 10) {
      addToast("Review must be at least 10 characters", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post("/api/reviews", {
        productId,
        rating,
        title,
        comment,
        images
      });

      addToast("Review submitted successfully!", "success");
      
      // Reset form
      setRating(0);
      setTitle("");
      setComment("");
      setImages([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      addToast(
        error.response?.data?.message || "Failed to submit review",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Removed placeholder - now using ImageUploadMultiple component
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (!session?.user) {
    return (
      <Card className="p-6">
        <p className="text-zinc-400 text-center">
          Please{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            sign in
          </button>{" "}
          to leave a review
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Rating <span className="text-red-400">*</span>
          </label>
          <StarRating
            rating={rating}
            onChange={setRating}
            interactive
            size="lg"
          />
        </div>

        {/* Title */}
        <Input
          label="Review Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          required
          maxLength={100}
        />

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Review <span className="text-red-400">*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience with this product (minimum 10 characters)"
            required
            minLength={10}
            maxLength={1000}
            rows={5}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-zinc-100 placeholder-zinc-500"
          />
          <div className="text-xs text-zinc-500 mt-1">
            {comment.length}/1000 characters
          </div>
        </div>

        {/* Images */}
        <ImageUploadMultiple
          images={images}
          onChange={setImages}
          folder="ecommerce/reviews"
          maxImages={5}
          label="Add Photos (Optional)"
        />

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={rating === 0 || comment.length < 10}
          >
            Submit Review
          </Button>
        </div>
      </form>
    </Card>
  );
}
