
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, api_key } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // For now, we'll use a placeholder since Runway API integration would require specific setup
    // In production, you would integrate with Runway ML API using the provided API key
    const placeholderImages = [
      'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&q=80',
      'https://images.unsplash.com/photo-1566650057590-56b59e82969b?w=400&q=80',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&q=80',
      'https://images.unsplash.com/photo-1573160103600-094d16fcf43f?w=400&q=80',
      'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400&q=80'
    ];

    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

    return new Response(
      JSON.stringify({ 
        image_url: randomImage + `&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
        prompt: prompt,
        status: 'success'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
