import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface AnalyticsData {
    // Orders
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;

    // Revenue
    totalRevenue: number;
    revenueToday: number;
    revenueThisWeek: number;
    revenueThisMonth: number;

    // Products
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;

    // Top Products
    topSellingProducts: Array<{
        id: string;
        name: string;
        totalSold: number;
        revenue: number;
    }>;

    // Recent Orders
    recentOrders: Array<{
        id: string;
        customer_name: string;
        total_amount: number;
        status: string;
        created_at: string;
    }>;

    // Reviews
    totalReviews: number;
    averageRating: number;
}

export function useAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch orders
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            // Fetch fabrics
            const { data: fabrics, error: fabricsError } = await supabase
                .from('fabrics')
                .select('id, name, stock_quantity, price_cfa');

            if (fabricsError) throw fabricsError;

            // Fetch reviews
            const { data: reviews, error: reviewsError } = await supabase
                .from('fabric_reviews')
                .select('rating');

            // Calculate order stats
            const ordersList = orders || [];
            const totalOrders = ordersList.length;
            const pendingOrders = ordersList.filter(o => o.status === 'pending').length;
            const completedOrders = ordersList.filter(o => o.status === 'delivered').length;
            const cancelledOrders = ordersList.filter(o => o.status === 'cancelled').length;

            // Calculate revenue
            const totalRevenue = ordersList.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);

            const revenueToday = ordersList
                .filter(o => new Date(o.created_at) >= today)
                .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

            const revenueThisWeek = ordersList
                .filter(o => new Date(o.created_at) >= weekAgo)
                .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

            const revenueThisMonth = ordersList
                .filter(o => new Date(o.created_at) >= monthAgo)
                .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

            // Calculate product stats
            const fabricsList = fabrics || [];
            const totalProducts = fabricsList.length;
            const lowStockProducts = fabricsList.filter(f => (f.stock_quantity || 0) > 0 && (f.stock_quantity || 0) <= 5).length;
            const outOfStockProducts = fabricsList.filter(f => (f.stock_quantity || 0) === 0).length;

            // Calculate review stats
            const reviewsList = reviews || [];
            const totalReviews = reviewsList.length;
            const averageRating = totalReviews > 0
                ? reviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                : 0;

            // Recent orders (last 5)
            const recentOrders = ordersList.slice(0, 5).map(o => ({
                id: o.id,
                customer_name: o.customer_name || 'Unknown',
                total_amount: parseFloat(o.total_amount) || 0,
                status: o.status || 'pending',
                created_at: o.created_at
            }));

            // Top selling products (placeholder - would need order_items aggregation)
            const topSellingProducts = fabricsList.slice(0, 5).map(f => ({
                id: f.id,
                name: f.name,
                totalSold: Math.floor(Math.random() * 50), // Placeholder
                revenue: (f.price_cfa || 0) * Math.floor(Math.random() * 50)
            }));

            setData({
                totalOrders,
                pendingOrders,
                completedOrders,
                cancelledOrders,
                totalRevenue,
                revenueToday,
                revenueThisWeek,
                revenueThisMonth,
                totalProducts,
                lowStockProducts,
                outOfStockProducts,
                topSellingProducts,
                recentOrders,
                totalReviews,
                averageRating
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    return { data, loading, error, refetch: fetchAnalytics };
}
