
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
    const { image, taskUUID } = await req.json();

    if (!image || !taskUUID) {
      return new Response(
        JSON.stringify({ error: 'Image and taskUUID are required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // Prepare the request body for Runware API
    const requestBody = [{
      taskType: "authentication",
      apiKey: Deno.env.get('RUNWARE_API_KEY')
    }, {
      taskType: "imageUpload",
      taskUUID: taskUUID,
      image: image
    }];

    console.log('Uploading image to Runware...');

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
    console.log('Runware upload response:', data);

    // Find the upload response in the data array
    const uploadResponse = data.data?.find((item: any) => item.taskType === 'imageUpload');
    
    if (!uploadResponse) {
      throw new Error('No upload response received from Runware');
    }

    return new Response(
      JSON.stringify({ 
        imageUUID: uploadResponse.imageUUID,
        taskUUID: uploadResponse.taskUUID,
        status: 'success'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in upload-image-runware function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
