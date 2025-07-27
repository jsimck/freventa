import { z } from 'zod';
import { httpRouter } from 'convex/server';
import { action, httpAction } from './_generated/server';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { convertToModelMessages, streamText, tool } from 'ai';

const http = httpRouter();

http.route({
  path: '/completion',
  method: 'OPTIONS',
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }),
});

http.route({
  path: '/completion',
  method: 'POST',
  handler: httpAction(async (_, request) => {
    // Parse the request body to get the messages
    const { messages } = await request.json();

    // Call the AI model to stream a response
    const result = streamText({
      model: createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      })('google/gemini-2.0-flash-001'),
      messages: convertToModelMessages(messages),
      system:
        'You are a helpful assistant that can answer questions and help with tasks. You can use the following tools to help you: getWeatherInformation, askForConfirmation, getLocation. Before using any tool, always ask for confirmation using askForConfirmation tool.',
      tools: {
        // server-side tool with execute function:
        getWeatherInformation: {
          description: 'show the weather in a given city to the user',
          parameters: z.object({ city: z.string() }).describe('The city to get the weather for'),
          execute: async ({}: { city: string }) => {
            const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
            return weatherOptions[
              Math.floor(Math.random() * weatherOptions.length)
            ];
          },
        },
        // client-side tool that starts user interaction:
        askForConfirmation: {
          description: 'Ask the user for confirmation.',
          parameters: z.object({
            message: z.string().describe('The message to ask for confirmation.'),
          }),
        },
        // client-side tool that is automatically executed on the client:
        getLocation: {
          description:
            'Get the user location. Always ask for confirmation before using this tool.',
          parameters: z.object({}),
        },
      },
    });

    // Return the result as a streaming response
    return result.toUIMessageStreamResponse({
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }),
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
