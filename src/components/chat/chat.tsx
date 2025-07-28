import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { ArrowUpIcon, SquareIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from '../ui/chat-container';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAvatar,
  MessageContent,
} from '../ui/message';
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from '../ui/prompt-input';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '../ui/reasoning';
import { ScrollButton } from '../ui/scroll-button';

export function Chat() {
  const convexUrl = import.meta.env.VITE_CONVEX_API_URL;

  const [input, setInput] = useState('');
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

  if (!convexUrl) {
    return <div>Error: VITE_CONVEX_API_URL not set</div>;
  }

  const handleSubmit = () => {
    console.log('submit', input);

    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  console.log(messages);

  return (
    <div className='mx-auto flex h-screen max-w-[800px] flex-col'>
      <div className='flex-1 overflow-y-auto p-4' />

      <div className='flex flex-col gap-8'>
        <ChatContainerRoot className='w-full'>
          <ChatContainerContent className='space-y-12 overflow-y-auto p-4'>
            {messages.map((message) => {
              const { role, parts } = message;
              const content = parts
                .map((part) => (part.type === 'text' ? part.text : null))
                ?.join('');
              const reasoningContent = parts
                .map((part) => (part.type === 'reasoning' ? part.text : null))
                ?.join('');

              return (
                <Message
                  className={cn(
                    'mx-auto flex w-full max-w-3xl flex-col gap-2 px-0 md:px-6',
                    role === 'user' ? 'items-end' : 'items-start'
                  )}
                  key={message.id}
                >
                  <div className='max-w-[85%] sm:max-w-[75%]'>
                    <MessageContent
                      className={cn({
                        'bg-transparent p-0': role === 'assistant',
                        'bg-primary text-primary-foreground': role === 'user',
                      })}
                      markdown
                    >
                      {content}
                    </MessageContent>

                    {reasoningContent && (
                      <Reasoning isStreaming={status === 'streaming'}>
                        <Button
                          asChild
                          className='my-2'
                          size='sm'
                          variant='outline'
                        >
                          <ReasoningTrigger>Show reasoning</ReasoningTrigger>
                        </Button>
                        <ReasoningContent
                          className='ml-2 border-l-2 border-l-slate-200 px-2 pb-1 dark:border-l-slate-700'
                          markdown
                        >
                          {reasoningContent}
                        </ReasoningContent>
                      </Reasoning>
                    )}
                  </div>
                </Message>
              );
            })}
            <ChatContainerScrollAnchor />
          </ChatContainerContent>

          <div className='absolute right-7 bottom-4 z-10'>
            <ScrollButton
              className='bg-primary shadow-sm hover:bg-primary/90'
              size='icon'
              variant='default'
            />
          </div>
        </ChatContainerRoot>
      </div>

      <PromptInput
        className='sticky bottom-6'
        isLoading={status === 'streaming'}
        onSubmit={handleSubmit}
      >
        <PromptInputTextarea
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ask prompt-kit'
          value={input}
        />
        <PromptInputActions className='flex justify-end'>
          <PromptInputAction
            tooltip={
              status === 'streaming' ? 'Stop generation' : 'Send message'
            }
          >
            <Button
              className='h-8 w-8 rounded-full'
              size='icon'
              type='submit'
              variant='default'
            >
              {status === 'streaming' ? (
                <SquareIcon className='size-5 fill-current' />
              ) : (
                <ArrowUpIcon className='size-5' />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    </div>
  );
}
