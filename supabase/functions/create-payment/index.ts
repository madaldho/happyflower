
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { cartItems, customerInfo } = await req.json();
    
    const stripe = new Stripe("sk_test_51RTPvaICXsIbAkiiZUGNqjynpN4SkTSv5ov5mo363fNq5xOxfNNnVB5tJY3b1bqGed4BKyxuHWpW5pwHyt2wCygn00BAZk02V2", {
      apiVersion: "2023-10-16",
    });

    // Calculate total
    const total = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const deliveryFee = 9.99;
    const finalTotal = Math.round((total + deliveryFee) * 100); // Convert to cents

    // Create line items for Stripe
    const lineItems = cartItems.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description,
          images: [item.image_url || item.image],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add delivery fee
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Fee",
          description: "Standard delivery",
        },
        unit_amount: Math.round(deliveryFee * 100),
      },
      quantity: 1,
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: customerInfo.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerInfo.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone || '',
        delivery_address: customerInfo.address,
        special_instructions: customerInfo.specialInstructions || '',
      }
    });

    // Create order in database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert([{
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        delivery_address: customerInfo.address,
        total_amount: total + deliveryFee,
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
    } else {
      // Create order items
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      await supabaseClient
        .from('order_items')
        .insert(orderItems);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
