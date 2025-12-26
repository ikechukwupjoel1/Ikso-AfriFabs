import { motion } from 'framer-motion';
import {
    TrendingUp,
    ShoppingBag,
    Package,
    DollarSign,
    AlertTriangle,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

const AnalyticsDashboard = () => {
    const { data, loading, error, refetch } = useAnalytics();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Loading analytics...</span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-12 text-red-500">
                <p>Failed to load analytics: {error}</p>
                <Button onClick={refetch} variant="outline" className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

    const statCards = [
        {
            title: 'Total Revenue',
            value: formatCurrency(data.totalRevenue),
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            title: 'Total Orders',
            value: data.totalOrders,
            icon: ShoppingBag,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            title: 'Total Products',
            value: data.totalProducts,
            icon: Package,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            title: 'Avg Rating',
            value: data.averageRating > 0 ? data.averageRating.toFixed(1) : 'N/A',
            icon: Star,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
        }
    ];

    const orderStatusCards = [
        { label: 'Pending', value: data.pendingOrders, icon: Clock, color: 'text-orange-500' },
        { label: 'Completed', value: data.completedOrders, icon: CheckCircle, color: 'text-green-500' },
        { label: 'Cancelled', value: data.cancelledOrders, icon: XCircle, color: 'text-red-500' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display">Analytics Dashboard</h2>
                <Button onClick={refetch} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                    </div>
                                    <div className={cn('p-3 rounded-full', stat.bgColor)}>
                                        <stat.icon className={cn('w-6 h-6', stat.color)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(data.revenueToday)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">This Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(data.revenueThisWeek)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-purple-600">
                            {formatCurrency(data.revenueThisMonth)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Order Status & Inventory Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            Order Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orderStatusCards.map(status => (
                                <div key={status.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <status.icon className={cn('w-5 h-5', status.color)} />
                                        <span>{status.label}</span>
                                    </div>
                                    <span className="text-xl font-bold">{status.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            Inventory Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <span className="text-red-700">Out of Stock</span>
                                <span className="text-xl font-bold text-red-700">{data.outOfStockProducts}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                <span className="text-orange-700">Low Stock (≤5)</span>
                                <span className="text-xl font-bold text-orange-700">{data.lowStockProducts}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Recent Orders
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data.recentOrders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No orders yet</p>
                    ) : (
                        <div className="space-y-3">
                            {data.recentOrders.map(order => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{order.customer_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{formatCurrency(order.total_amount)}</p>
                                        <span className={cn(
                                            'text-xs px-2 py-0.5 rounded',
                                            order.status === 'pending' && 'bg-orange-100 text-orange-700',
                                            order.status === 'confirmed' && 'bg-blue-100 text-blue-700',
                                            order.status === 'delivered' && 'bg-green-100 text-green-700',
                                            order.status === 'cancelled' && 'bg-red-100 text-red-700'
                                        )}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reviews Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Reviews Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-8">
                        <div>
                            <p className="text-4xl font-bold">{data.totalReviews}</p>
                            <p className="text-sm text-muted-foreground">Total Reviews</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-yellow-500">
                                {data.averageRating > 0 ? data.averageRating.toFixed(1) : '-'}
                            </p>
                            <p className="text-sm text-muted-foreground">Average Rating</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsDashboard;
