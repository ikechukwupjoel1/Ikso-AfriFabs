// Email notification service
// This can work with Resend, SendGrid, or Brevo
// For now, uses a webhook approach that can be extended

const WHATSAPP_NUMBER = '2348165715235';

export interface OrderEmailData {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: Array<{
        name: string;
        pieces: number;
        price: number;
    }>;
    subtotal: number;
    shipping: number;
    total: number;
    currency: string;
    shippingAddress: {
        address: string;
        city: string;
        state: string;
        country: string;
    };
}

// Generate HTML email template for order confirmation
export function generateOrderConfirmationHtml(data: OrderEmailData): string {
    const itemsHtml = data.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.pieces} pcs</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price, data.currency)}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Ikso AfriFabs</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B4513; margin: 0;">Ikso AfriFabs</h1>
            <p style="color: #666; margin: 5px 0;">Premium African Fabrics</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0;">Order Confirmed! 🎉</h2>
            <p style="margin: 10px 0 0;">Order #${data.orderNumber}</p>
        </div>
        
        <p>Dear ${data.customerName},</p>
        <p>Thank you for your order! We've received your order and will begin processing it shortly.</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #8B4513;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #eee;">
                        <th style="padding: 10px; text-align: left;">Item</th>
                        <th style="padding: 10px; text-align: center;">Qty</th>
                        <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                        <td style="padding: 10px; text-align: right;">${formatCurrency(data.subtotal, data.currency)}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
                        <td style="padding: 10px; text-align: right;">${data.shipping === 0 ? 'FREE' : formatCurrency(data.shipping, data.currency)}</td>
                    </tr>
                    <tr style="background: #8B4513; color: white;">
                        <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                        <td style="padding: 10px; text-align: right;"><strong>${formatCurrency(data.total, data.currency)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #8B4513;">Shipping Address</h3>
            <p style="margin: 0;">
                ${data.shippingAddress.address}<br>
                ${data.shippingAddress.city}, ${data.shippingAddress.state}<br>
                ${data.shippingAddress.country}
            </p>
        </div>
        
        <div style="background: #25D366; color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0 0 10px;">Complete Your Payment</h3>
            <p style="margin: 0 0 15px;">Click below to contact us on WhatsApp and complete your payment:</p>
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hi,%20I%20just%20placed%20order%20%23${data.orderNumber}" 
               style="display: inline-block; background: white; color: #25D366; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                💬 Pay via WhatsApp
            </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            If you have any questions, please contact us on WhatsApp at +234 816 571 5235.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Ikso AfriFabs. All rights reserved.<br>
            Nigeria & Benin Republic
        </p>
    </body>
    </html>
    `;
}

// Generate plain text version
export function generateOrderConfirmationText(data: OrderEmailData): string {
    const items = data.items.map(item =>
        `- ${item.name} x${item.pieces} pcs: ${formatCurrency(item.price, data.currency)}`
    ).join('\n');

    return `
ORDER CONFIRMATION - Ikso AfriFabs
===================================

Order #${data.orderNumber}

Dear ${data.customerName},

Thank you for your order! We've received your order and will begin processing it shortly.

ORDER SUMMARY:
${items}

Subtotal: ${formatCurrency(data.subtotal, data.currency)}
Shipping: ${data.shipping === 0 ? 'FREE' : formatCurrency(data.shipping, data.currency)}
Total: ${formatCurrency(data.total, data.currency)}

SHIPPING ADDRESS:
${data.shippingAddress.address}
${data.shippingAddress.city}, ${data.shippingAddress.state}
${data.shippingAddress.country}

COMPLETE YOUR PAYMENT:
Contact us on WhatsApp to complete your payment:
https://wa.me/${WHATSAPP_NUMBER}?text=Hi,%20I%20just%20placed%20order%20%23${data.orderNumber}

Questions? Contact us on WhatsApp at +234 816 571 5235.

© 2025 Ikso AfriFabs
    `.trim();
}

// Helper to format currency
function formatCurrency(amount: number, currency: string): string {
    if (currency === 'NGN') {
        return `₦${amount.toLocaleString()}`;
    }
    return `${amount.toLocaleString()} CFA`;
}

// Send email via Resend (requires RESEND_API_KEY environment variable)
// This function is designed to be called from a Supabase Edge Function
export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
    // For frontend, we'll call a Supabase Edge Function
    // The actual email sending happens server-side

    try {
        // Store email data in database for later processing
        // In production, this would call a Supabase Edge Function
        console.log('Email would be sent to:', data.customerEmail);
        console.log('Order:', data.orderNumber);

        // For now, just return success - actual implementation requires edge function
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send email'
        };
    }
}

// Notification for admin when new order is placed
export function generateAdminNotificationHtml(data: OrderEmailData): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Order Alert - Ikso AfriFabs</title>
    </head>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #8B4513;">🔔 New Order Received!</h2>
        
        <p><strong>Order #${data.orderNumber}</strong></p>
        <p><strong>Customer:</strong> ${data.customerName}</p>
        <p><strong>Phone:</strong> ${data.customerPhone}</p>
        <p><strong>Email:</strong> ${data.customerEmail}</p>
        <p><strong>Total:</strong> ${formatCurrency(data.total, data.currency)}</p>
        
        <h3>Items:</h3>
        <ul>
            ${data.items.map(item => `<li>${item.name} x${item.pieces} pcs</li>`).join('')}
        </ul>
        
        <h3>Shipping To:</h3>
        <p>
            ${data.shippingAddress.address}<br>
            ${data.shippingAddress.city}, ${data.shippingAddress.state}<br>
            ${data.shippingAddress.country}
        </p>
        
        <p>
            <a href="https://wa.me/${data.customerPhone.replace(/\D/g, '')}">Contact Customer on WhatsApp</a>
        </p>
    </body>
    </html>
    `;
}
