import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    // Get token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const token = authHeader.replace("Bearer ", "");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Get user from token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Check user role in user_roles table
    const { data: roles, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    if (roleError) {
      return new Response(JSON.stringify({ error: "Role check failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    const allowed = roles?.some((r: any) => r.role === "admin" || r.role === "seller");
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Forbidden: Not admin or seller" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Get update data from request body
    const body = await req.json();
    const { id, status, updates } = body;
    
    // Validate status type
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'waiting_admin_confirmation'];
    if (status && !validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status value" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!id || (!status && !updates)) {
      return new Response(JSON.stringify({ error: "Missing id or status/updates" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check current order status if there's a new status
    if (status) {
      const { data: order, error: fetchError } = await supabaseClient
        .from("orders")
        .select("status, final_price")
        .eq("id", id)
        .single();
      if (fetchError) {
        return new Response(JSON.stringify({ error: "Error fetching order: " + fetchError.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      const currentStatus = order?.status;

      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        'pending': ['confirmed', 'cancelled', 'waiting_admin_confirmation'],
        'waiting_admin_confirmation': ['confirmed', 'cancelled'],
        'confirmed': ['completed', 'cancelled'],
        'completed': [], // Completed cannot be changed
        'cancelled': ['pending'] // Can only go back to pending
      };
      
      if (currentStatus && 
          validTransitions[currentStatus] && 
          !validTransitions[currentStatus].includes(status)) {
        return new Response(JSON.stringify({ 
          error: `Invalid status transition from ${currentStatus} to ${status}` 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Check if final price exists for confirmed status
      if (status === 'confirmed' && !order?.final_price) {
        return new Response(JSON.stringify({ 
          error: "Cannot confirm order without final price" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (status) {
      updateData.status = status;
      // Clear final price if cancelled
      if (status === 'cancelled') {
        updateData.final_price = null;
      }
    }
    if (updates) {
      Object.assign(updateData, updates);
    }

    // Update order
    const { error: updateError } = await supabaseClient
      .from("orders")
      .update(updateData)
      .eq("id", id);
    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Create notification for status change
    if (status) {
      const { data: orderData } = await supabaseClient
        .from("orders")
        .select("user_id")
        .eq("id", id)
        .single();

      if (orderData?.user_id) {
        await supabaseClient
          .from("notifications")
          .insert({
            user_id: orderData.user_id,
            type: "order_status",
            title: "Order Status Updated",
            message: `Your order status has been updated to ${status.replace('_', ' ')}`,
            metadata: { order_id: id, status }
          });
      }
    }

    return new Response(JSON.stringify({ success: true, updated: updateData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 