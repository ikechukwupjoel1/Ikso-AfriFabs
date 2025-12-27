// Invoice generator utility - creates printable invoice HTML
// Opens in new tab for printing/PDF saving

interface InvoiceItem {
    fabric_name: string;
    fabric_image?: string;
    quantity: number;
    unit_price: number;
}

interface InvoiceData {
    orderId: string;
    orderDate: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    items: InvoiceItem[];
    subtotal: number;
    discount?: number;
    discountCode?: string;
    total: number;
    currency: 'NGN' | 'CFA';
    status: string;
    notes?: string;
}

const formatCurrency = (amount: number, currency: 'NGN' | 'CFA'): string => {
    const symbol = currency === 'NGN' ? '₦' : 'CFA ';
    return `${symbol}${amount.toLocaleString()}`;
};

// Parse items from notes field if items array is empty
const parseItemsFromNotes = (notes: string, total: number): InvoiceItem[] => {
    // Try to extract items from notes like "Items: Super VIP Collection x3 pcs (18 yards)"
    const itemsMatch = notes.match(/Items?:\s*(.+?)(?:\n|$)/i);
    if (itemsMatch) {
        const itemText = itemsMatch[1];
        // Parse "Name xQty pcs" pattern
        const matches = itemText.match(/(.+?)\s*x(\d+)\s*pcs?/i);
        if (matches) {
            const quantity = parseInt(matches[2]) || 1;
            return [{
                fabric_name: matches[1].trim(),
                quantity: quantity,
                unit_price: total / quantity,
            }];
        }
        // If no quantity pattern, just use the text as item name
        return [{
            fabric_name: itemText.trim(),
            quantity: 1,
            unit_price: total,
        }];
    }
    return [];
};

export const generateInvoice = (data: InvoiceData): void => {
    // If no items but have notes, try to parse items from notes
    let displayItems = data.items;
    if ((!displayItems || displayItems.length === 0) && data.notes) {
        displayItems = parseItemsFromNotes(data.notes, data.total);
    }

    // If still no items, create a single item from total
    if (!displayItems || displayItems.length === 0) {
        displayItems = [{
            fabric_name: 'Order Items',
            quantity: 1,
            unit_price: data.total,
        }];
    }

    const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="https://iksoafrifabs.vercel.app/favicon.png">
    <title>Receipt #${data.orderId.substring(0, 8).toUpperCase()} - Ikso AfriFabs</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #d97706;
        }
        .logo-section {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .logo-img {
            width: 50px;
            height: 50px;
            object-fit: contain;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #d97706;
        }
        .logo-sub {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
        }
        .invoice-title {
            text-align: right;
        }
        .invoice-title h1 {
            font-size: 32px;
            color: #333;
            margin-bottom: 8px;
        }
        .invoice-number {
            font-size: 14px;
            color: #666;
        }
        .details-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .details-box {
            flex: 1;
        }
        .details-box h3 {
            font-size: 12px;
            text-transform: uppercase;
            color: #999;
            margin-bottom: 8px;
            letter-spacing: 1px;
        }
        .details-box p {
            font-size: 14px;
            margin-bottom: 4px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            margin-top: 8px;
        }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-confirmed { background: #dbeafe; color: #1e40af; }
        .status-shipped { background: #e9d5ff; color: #7c3aed; }
        .status-delivered { background: #d1fae5; color: #065f46; }
        .status-cancelled { background: #fee2e2; color: #dc2626; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th {
            background: #f9fafb;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            border-bottom: 2px solid #e5e7eb;
        }
        td {
            padding: 16px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
        }
        .item-image {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 4px;
        }
        .item-name {
            font-weight: 600;
        }
        .text-right {
            text-align: right;
        }
        .totals {
            margin-left: auto;
            width: 300px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
        }
        .totals-row.discount {
            color: #059669;
        }
        .totals-row.total {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px solid #333;
            padding-top: 12px;
            margin-top: 8px;
        }
        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .whatsapp-link {
            color: #25D366;
            font-weight: 600;
        }
        @media print {
            body { padding: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-section">
            <img src="https://iksoafrifabs.vercel.app/favicon.png" alt="Ikso AfriFabs" class="logo-img" onerror="this.style.display='none'">
            <div>
                <div class="logo">Ikso AfriFabs</div>
                <div class="logo-sub">Premium African Fabrics</div>
            </div>
        </div>
        <div class="invoice-title">
            <h1>RECEIPT</h1>
            <div class="invoice-number">#${data.orderId.substring(0, 8).toUpperCase()}</div>
        </div>
    </div>

    <div class="details-section">
        <div class="details-box">
            <h3>Bill To</h3>
            <p><strong>${data.customerName || 'Customer'}</strong></p>
            <p>${data.customerEmail}</p>
            ${data.customerPhone ? `<p>${data.customerPhone}</p>` : ''}
            ${data.address ? `<p>${data.address}</p>` : ''}
            ${data.city || data.state ? `<p>${[data.city, data.state].filter(Boolean).join(', ')}</p>` : ''}
            ${data.country ? `<p>${data.country}</p>` : ''}
        </div>
        <div class="details-box" style="text-align: right;">
            <h3>Receipt Details</h3>
            <p><strong>Date:</strong> ${new Date(data.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Currency:</strong> ${data.currency === 'NGN' ? 'Nigerian Naira (₦)' : 'West African CFA'}</p>
            <span class="status-badge status-${data.status}">${data.status}</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            ${displayItems.map(item => `
                <tr>
                    <td class="item-name">${item.fabric_name}</td>
                    <td class="text-right">${item.quantity} pc${item.quantity > 1 ? 's' : ''}</td>
                    <td class="text-right">${formatCurrency(item.unit_price, data.currency)}</td>
                    <td class="text-right">${formatCurrency(item.unit_price * item.quantity, data.currency)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <span>Subtotal</span>
            <span>${formatCurrency(data.subtotal, data.currency)}</span>
        </div>
        ${data.discount ? `
            <div class="totals-row discount">
                <span>Discount${data.discountCode ? ` (${data.discountCode})` : ''}</span>
                <span>-${formatCurrency(data.discount, data.currency)}</span>
            </div>
        ` : ''}
        <div class="totals-row total">
            <span>Total</span>
            <span>${formatCurrency(data.total, data.currency)}</span>
        </div>
    </div>

    <div class="footer">
        <p>Thank you for shopping with Ikso AfriFabs!</p>
        <p style="margin-top: 8px;">For questions about this receipt, contact us on WhatsApp: <span class="whatsapp-link">+234 816 571 5235</span></p>
    </div>

    <script>
        // Auto-trigger print dialog
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>
    `;

    // Open invoice in new window
    const invoiceWindow = window.open('', '_blank');
    if (invoiceWindow) {
        invoiceWindow.document.write(invoiceHtml);
        invoiceWindow.document.close();
    }
};

export default generateInvoice;

