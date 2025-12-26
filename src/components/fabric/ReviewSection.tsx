import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StarRating from '@/components/ui/StarRating';
import { useReviews, Review, ReviewStats } from '@/hooks/useReviews';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReviewSectionProps {
    fabricId: string;
}

const ReviewSection = ({ fabricId }: ReviewSectionProps) => {
    const { reviews, stats, loading, submitReview, refetch } = useReviews(fabricId);
    const { user, isAuthenticated } = useAuth();

    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        rating: 0,
        name: '',
        title: '',
        text: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        if (!formData.name.trim()) {
            toast.error('Please enter your name');
            return;
        }

        setSubmitting(true);
        const { error } = await submitReview(
            formData.rating,
            formData.name,
            formData.title || undefined,
            formData.text || undefined,
            user?.id
        );

        if (error) {
            toast.error(error);
        } else {
            toast.success('Review submitted successfully!');
            setShowForm(false);
            setFormData({ rating: 0, name: '', title: '', text: '' });
        }
        setSubmitting(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl">Customer Reviews</h2>
                <Button onClick={() => setShowForm(!showForm)} variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Write a Review
                </Button>
            </div>

            {/* Stats Summary */}
            {stats.totalReviews > 0 && (
                <div className="bg-secondary/30 rounded-xl p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary">{stats.averageRating}</div>
                            <StarRating rating={stats.averageRating} size="md" />
                            <p className="text-sm text-muted-foreground mt-1">
                                {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="flex-1 space-y-1">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = stats.ratingDistribution[star];
                                const percentage = stats.totalReviews > 0
                                    ? (count / stats.totalReviews) * 100
                                    : 0;
                                return (
                                    <div key={star} className="flex items-center gap-2 text-sm">
                                        <span className="w-3">{star}</span>
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="w-8 text-right text-muted-foreground">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Review Form */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-card rounded-xl p-6 border border-border mb-8"
                >
                    <h3 className="font-display text-lg mb-4">Write Your Review</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Your Rating *</Label>
                            <StarRating
                                rating={formData.rating}
                                size="lg"
                                interactive
                                onRatingChange={(r) => setFormData({ ...formData, rating: r })}
                            />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Your Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John D."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Review Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Great quality fabric!"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="text">Your Review</Label>
                            <Textarea
                                id="text"
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                placeholder="Tell others about your experience..."
                                rows={4}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No reviews yet. Be the first to review this fabric!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border-b border-border pb-6 last:border-0"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">{review.reviewer_name}</span>
                                        {review.verified_purchase && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                Verified Purchase
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <StarRating rating={review.rating} size="sm" />
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(review.created_at)}
                                        </span>
                                    </div>
                                    {review.title && (
                                        <h4 className="font-medium mb-1">{review.title}</h4>
                                    )}
                                    {review.review_text && (
                                        <p className="text-muted-foreground">{review.review_text}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
