import { supabase } from '@/lib/supabase';
import { CartItem } from '@/context/CartContext';
import { Currency } from '@/types/fabric';
import { calculatePrice } from '@/lib/currency';

export interface OrderData {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    currency: Currency;
    delivery_method: 'shipping' | 'pickup';
}

export const createOrder = async (
    orderData: OrderData,
    cartItems: CartItem[],
    exchangeRate: number,
    userId?: string
) => {
    try {
        // 1. Calculate totals
        const total = cartItems.reduce((sum, item) => {
            const price = calculatePrice(item.fabric.priceCFA, orderData.currency, exchangeRate);
            return sum + (price * item.pieces);
        }, 0);

        // 2. Prepare items summary for notes (since items JSONB column might not exist)
        const itemsSummary = cartItems.map(item =>
            `${item.fabric.name} x${item.pieces} pcs (${item.pieces * 6} yards)`
        ).join(', ');

        // 3. Create Order Record
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId || null,
                customer_name: orderData.customer_name,
                customer_email: orderData.customer_email,
                customer_phone: orderData.customer_phone,
                address: orderData.address,
                city: orderData.city,
                state: orderData.state,
                country: orderData.country,
                delivery_method: orderData.delivery_method,
                currency: orderData.currency,
                total_amount: total,
                status: 'pending',
                notes: `Items: ${itemsSummary}`
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 3. Create Order Items
        const orderItems = cartItems.map(item => ({
            order_id: order.id,
            fabric_id: item.fabricId,
            yardage: item.pieces * 6, // 6 yards per piece
            price_per_unit: calculatePrice(item.fabric.priceCFA, orderData.currency, exchangeRate)
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // 4. Update Stock (Decrement quantity)
        // Note: Ideally this should be a DB function/RPC to ensure atomicity, but client-side loop works for now
        for (const item of cartItems) {
            // Get current stock
            const { data: fabric } = await supabase
                .from('fabrics')
                .select('stock_quantity')
                .eq('id', item.fabricId)
                .single();

            if (fabric) {
                const newStock = Math.max(0, (fabric.stock_quantity || 0) - item.pieces);
                await supabase
                    .from('fabrics')
                    .update({ stock_quantity: newStock })
                    .eq('id', item.fabricId);
            }
        }

        return order;

    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};
