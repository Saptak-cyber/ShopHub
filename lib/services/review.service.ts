import { prisma } from "@/lib/db";
import { ValidationError, NotFoundError, UnauthorizedError } from "../errors";

export class ReviewService {
  // Create a review
  static async createReview(data: {
    productId: string;
    userId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }) {
    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new ValidationError("Rating must be between 1 and 5");
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: data.productId,
        userId: data.userId
      }
    });

    if (existingReview) {
      throw new ValidationError("You have already reviewed this product");
    }

    // Check if user purchased this product (for verified badge)
    const purchasedOrder = await prisma.order.findFirst({
      where: {
        userId: data.userId,
        status: { in: ["paid", "processing", "shipped", "delivered"] },
        items: {
          some: {
            productId: data.productId
          }
        }
      }
    });

    // Create review
    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        images: data.images || [],
        verified: !!purchasedOrder, // Verified if user purchased
        approved: true // Auto-approve for now
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return review;
  }

  // Get all reviews for a product
  static async getProductReviews(
    productId: string,
    options?: {
      sortBy?: "newest" | "helpful" | "rating_high" | "rating_low";
      rating?: number;
      verified?: boolean;
      limit?: number;
      offset?: number;
    }
  ) {
    const {
      sortBy = "newest",
      rating,
      verified,
      limit = 10,
      offset = 0
    } = options || {};

    // Build where clause
    const where: any = {
      productId,
      approved: true
    };

    if (rating) {
      where.rating = rating;
    }

    if (verified !== undefined) {
      where.verified = verified;
    }

    // Build order by clause
    let orderBy: any = {};
    switch (sortBy) {
      case "helpful":
        orderBy = { helpfulCount: "desc" };
        break;
      case "rating_high":
        orderBy = { rating: "desc" };
        break;
      case "rating_low":
        orderBy = { rating: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          votes: {
            select: {
              userId: true,
              helpful: true
            }
          }
        }
      }),
      prisma.review.count({ where })
    ]);

    return {
      reviews,
      total,
      hasMore: offset + limit < total
    };
  }

  // Get review statistics for a product
  static async getProductReviewStats(productId: string) {
    const [avgRating, totalReviews, ratingDistribution] = await Promise.all([
      prisma.review.aggregate({
        where: { productId, approved: true },
        _avg: { rating: true }
      }),
      prisma.review.count({
        where: { productId, approved: true }
      }),
      prisma.review.groupBy({
        by: ["rating"],
        where: { productId, approved: true },
        _count: { rating: true }
      })
    ]);

    // Build rating distribution object
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    ratingDistribution.forEach((item) => {
      distribution[item.rating] = item._count.rating;
    });

    return {
      averageRating: avgRating._avg.rating || 0,
      totalReviews,
      distribution
    };
  }

  // Update a review
  static async updateReview(
    reviewId: string,
    userId: string,
    data: {
      rating?: number;
      title?: string;
      comment?: string;
      images?: string[];
    }
  ) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundError("Review not found");
    }

    if (review.userId !== userId) {
      throw new UnauthorizedError("You can only edit your own reviews");
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new ValidationError("Rating must be between 1 and 5");
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return updatedReview;
  }

  // Delete a review
  static async deleteReview(reviewId: string, userId: string, isAdmin: boolean = false) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundError("Review not found");
    }

    if (!isAdmin && review.userId !== userId) {
      throw new UnauthorizedError("You can only delete your own reviews");
    }

    await prisma.review.delete({
      where: { id: reviewId }
    });

    return { success: true };
  }

  // Vote on a review (helpful/not helpful)
  static async voteReview(reviewId: string, userId: string, helpful: boolean) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundError("Review not found");
    }

    // Check if user already voted
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId
        }
      }
    });

    let vote;
    let helpfulCountChange = 0;

    if (existingVote) {
      // Update existing vote
      if (existingVote.helpful !== helpful) {
        vote = await prisma.reviewVote.update({
          where: {
            reviewId_userId: {
              reviewId,
              userId
            }
          },
          data: { helpful }
        });
        // If changing from not helpful to helpful, add 2 (remove -1, add +1)
        // If changing from helpful to not helpful, subtract 2
        helpfulCountChange = helpful ? 2 : -2;
      } else {
        // Same vote, no change
        return existingVote;
      }
    } else {
      // Create new vote
      vote = await prisma.reviewVote.create({
        data: {
          reviewId,
          userId,
          helpful
        }
      });
      helpfulCountChange = helpful ? 1 : -1;
    }

    // Update review helpful count
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: helpfulCountChange
        }
      }
    });

    return vote;
  }

  // Remove vote from a review
  static async removeVote(reviewId: string, userId: string) {
    const vote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId
        }
      }
    });

    if (!vote) {
      throw new NotFoundError("Vote not found");
    }

    // Delete vote
    await prisma.reviewVote.delete({
      where: {
        reviewId_userId: {
          reviewId,
          userId
        }
      }
    });

    // Update review helpful count
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          decrement: vote.helpful ? 1 : -1
        }
      }
    });

    return { success: true };
  }

  // Get user's review for a product
  static async getUserReviewForProduct(userId: string, productId: string) {
    const review = await prisma.review.findFirst({
      where: {
        userId,
        productId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return review;
  }

  // Check if user can review a product
  static async canUserReview(userId: string, productId: string) {
    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId
      }
    });

    if (existingReview) {
      return { canReview: false, reason: "already_reviewed" };
    }

    // Check if user purchased the product
    const purchasedOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: { in: ["paid", "processing", "shipped", "delivered"] },
        items: {
          some: {
            productId
          }
        }
      }
    });

    return {
      canReview: true,
      willBeVerified: !!purchasedOrder
    };
  }
}
