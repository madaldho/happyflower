
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
    const stripe = new Stripe("sk_test_51RTPvaICXsIbAkiiZUGNqjynpN4SkTSv5ov5mo363fNq5xOxfNNnVB5tJY3b1bqGed4BKyxuHWpW5pwHyt2wCygn00BAZk02V2", {
      apiVersion: "2023-10-16",
    });
    
    // Get the signature from the headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No signature provided");
    }
    
    // Get the webhook secret
    const webhookSecret = "whsec_test"; // Replace with your actual webhook secret
    
    // Get the raw body
    const body = await req.text();
    
    // Verify the webhook
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Connect to Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Handle specific events
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        
        // Find the related order and update it
        const { data: orders, error: fetchError } = await supabaseClient
          .from("orders")
          .select("id")
          .eq("total_amount", session.amount_total ? session.amount_total / 100 : 0)
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (fetchError) {
          throw fetchError;
        }
        
        if (orders && orders.length > 0) {
          const orderId = orders[0].id;
          
          // Update the order status
          const { error: updateError } = await supabaseClient
            .from("orders")
            .update({ 
              status: "confirmed",
              // Add metadata from the session if available
              customer_name: session.metadata?.customer_name || undefined,
              customer_phone: session.metadata?.customer_phone || undefined,
              delivery_address: session.metadata?.delivery_address || undefined
            })
            .eq("id", orderId);
            
          if (updateError) {
            throw updateError;
          }
        }
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
