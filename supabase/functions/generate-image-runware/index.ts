
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
    const { prompt, useImageToImage = false, baseImageUUID } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    const apiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Runware API key not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    // Prepare the request body for Runware API
    const requestBody = [{
      taskType: "authentication",
      apiKey: apiKey
    }];

    // Add image generation task
    const imageTask: any = {
      taskType: "imageInference",
      taskUUID: crypto.randomUUID(),
      positivePrompt: `beautiful flower arrangement, ${prompt}, high quality, detailed, professional photography, vibrant colors`,
      model: "runware:100@1",
      width: 1024,
      height: 1024,
      numberResults: 1,
      outputFormat: "WEBP",
      steps: 4,
      CFGScale: 1,
      scheduler: "FlowMatchEulerDiscreteScheduler",
      strength: 0.8
    };

    // If using image-to-image mode
    if (useImageToImage && baseImageUUID) {
      imageTask.inputImage = baseImageUUID;
      imageTask.strength = 0.7; // Lower strength for image-to-image
    }

    requestBody.push(imageTask);

    console.log('Generating image with Runware API...');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Runware API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Runware API response:', JSON.stringify(data, null, 2));

    // Find the image generation response in the data array
    const imageResponse = data.data?.find((item: any) => item.taskType === 'imageInference');
    
    if (!imageResponse || !imageResponse.imageURL) {
      throw new Error('No image generated from Runware API');
    }

    return new Response(
      JSON.stringify({ 
        image_url: imageResponse.imageURL,
        prompt: prompt,
        taskUUID: imageResponse.taskUUID,
        seed: imageResponse.seed,
        status: 'success'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-image-runware function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
