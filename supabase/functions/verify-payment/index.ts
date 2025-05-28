
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
    // Get session ID from request
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("No session ID provided");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    const stripe = new Stripe("sk_test_51RTPvaICXsIbAkiiZUGNqjynpN4SkTSv5ov5mo363fNq5xOxfNNnVB5tJY3b1bqGed4BKyxuHWpW5pwHyt2wCygn00BAZk02V2", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      throw new Error("Session not found");
    }

    // Check if payment was successful
    const paymentStatus = session.payment_status;
    const isSuccessful = paymentStatus === "paid";

    if (isSuccessful) {
      // Find order in the database and update its status
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
          .update({ status: "confirmed" })
          .eq("id", orderId);
          
        if (updateError) {
          throw updateError;
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      paymentStatus,
      isSuccessful
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
