import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { ChatContent } from './chat-content';
import { MessageComposer } from './message-composer';

const convexUrl = import.meta.env.VITE_CONVEX_API_URL;

export function Chat() {
  const { messages, sendMessage, addToolResult, status } = useChat({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === 'getLocation') {
        const cities = ['New York', 'Los Angeles', 'Chicago', 'San Francisco'];

        // No await - avoids potential deadlocks
        addToolResult({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: cities[Math.floor(Math.random() * cities.length)],
        });
      }
    },
    transport: new DefaultChatTransport({
      api: `${convexUrl}/completion`,
    }),
  });

  const handleSubmit = (prompt: string) => {
    if (prompt.trim()) {
      sendMessage({ text: prompt });
    }
  };

  return (
    <div className='mx-auto flex h-screen max-w-[800px] flex-col'>
      <div className='flex-1 overflow-y-auto p-4' />

      <ChatContent messages={messages} />
      <MessageComposer
        isLoading={status === 'streaming'}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
