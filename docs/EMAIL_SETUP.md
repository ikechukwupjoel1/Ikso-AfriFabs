# Email Notifications Setup Guide

This guide explains how to set up email notifications for Ikso AfriFabs.

## Option 1: Resend (Recommended - Easiest)

### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free)
3. Create an API key

### Step 2: Create Supabase Edge Function

In Supabase Dashboard → Edge Functions → New Function:

```bash
supabase functions new send-order-email
```

### Step 3: Edge Function Code

Create `supabase/functions/send-order-email/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { order, to_email, order_items } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Ikso AfriFabs <orders@iksoafrifabs.com>',
        to: [to_email],
        subject: `Order Confirmation #${order.id.substring(0, 8).toUpperCase()}`,
        html: `
          <h1>Thank you for your order!</h1>
          <p>Order #: ${order.id.substring(0, 8).toUpperCase()}</p>
          <p>Customer: ${order.customer_name}</p>
          <h2>Items:</h2>
          <ul>
            ${order_items.map(item => `<li>${item.fabric_name} x${item.quantity}</li>`).join('')}
          </ul>
          <p><strong>Total: ${order.currency === 'NGN' ? '₦' : 'CFA'} ${order.total_amount}</strong></p>
          <p>We'll contact you on WhatsApp to complete payment.</p>
        `,
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
```

### Step 4: Set Environment Variable

In Supabase Dashboard → Edge Functions → Settings:
- Add `RESEND_API_KEY` with your Resend API key

### Step 5: Call from Frontend

After order is created in `orderService.ts`:

```typescript
// Send email notification
await supabase.functions.invoke('send-order-email', {
  body: { order, to_email: orderData.customer_email, order_items: itemsForOrder }
})
```

---

## Option 2: Use Supabase Database Trigger + Webhook

For a no-code solution:
1. Use Supabase Database Webhooks
2. Connect to Zapier or Make.com
3. Trigger email via Gmail/Mailchimp

---

## Option 3: WhatsApp as Primary (Current)

Currently, the system:
1. Creates order in database
2. Opens WhatsApp with order details
3. Customer pays via WhatsApp

Email can be added later as a secondary notification channel.

---

## Quick Test

To test emails without setup, the email templates are already created in:
- `src/services/emailService.ts`

These generate HTML email templates that can be used with any email provider.
