import { httpRouter } from 'convex/server';
import { action, httpAction } from './_generated/server';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { convertToModelMessages, streamText } from 'ai';

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
