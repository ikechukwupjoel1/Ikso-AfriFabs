import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Review {
    id: string;
    fabric_id: string;
    user_id: string | null;
    rating: number;
    title: string | null;
    review_text: string | null;
    reviewer_name: string;
    verified_purchase: boolean;
    created_at: string;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
}

export function useReviews(fabricId: string | undefined) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats>({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = async () => {
        if (!fabricId) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('fabric_reviews')
                .select('*')
                .eq('fabric_id', fabricId)
                .eq('is_approved', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setReviews(data || []);

            // Calculate stats
            if (data && data.length > 0) {
                const total = data.length;
                const sum = data.reduce((acc, r) => acc + r.rating, 0);
                const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                data.forEach(r => distribution[r.rating]++);

                setStats({
                    averageRating: parseFloat((sum / total).toFixed(1)),
                    totalReviews: total,
                    ratingDistribution: distribution
                });
            } else {
                setStats({
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const submitReview = async (
        rating: number,
        reviewerName: string,
        title?: string,
        reviewText?: string,
        userId?: string
    ) => {
        if (!fabricId) return { error: 'No fabric ID' };

        try {
            const { error } = await supabase
                .from('fabric_reviews')
                .insert({
                    fabric_id: fabricId,
                    user_id: userId || null,
                    rating,
                    title: title || null,
                    review_text: reviewText || null,
                    reviewer_name: reviewerName,
                    verified_purchase: false,
                    is_approved: true
                });

            if (error) throw error;

            // Refresh reviews
            await fetchReviews();
            return { error: null };
        } catch (err) {
            return { error: err instanceof Error ? err.message : 'Failed to submit review' };
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [fabricId]);

    return { reviews, stats, loading, error, submitReview, refetch: fetchReviews };
}

// Simple hook to get just the average rating for a fabric (for cards)
export function useFabricRating(fabricId: string) {
    const [rating, setRating] = useState<{ average: number; count: number } | null>(null);

    useEffect(() => {
        const fetchRating = async () => {
            const { data, error } = await supabase
                .from('fabric_reviews')
                .select('rating')
                .eq('fabric_id', fabricId)
                .eq('is_approved', true);

            if (!error && data) {
                const count = data.length;
                if (count > 0) {
                    const avg = data.reduce((sum, r) => sum + r.rating, 0) / count;
                    setRating({ average: parseFloat(avg.toFixed(1)), count });
                } else {
                    setRating({ average: 0, count: 0 });
                }
            }
        };

        fetchRating();
    }, [fabricId]);

    return rating;
}
