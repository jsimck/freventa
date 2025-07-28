import type { UIMessage } from 'ai';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from '../ui/chat-container';
import { Message, MessageContent } from '../ui/message';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '../ui/reasoning';
import { ScrollButton } from '../ui/scroll-button';

export interface ChatContentProps {
  messages: UIMessage[];
}

export function ChatContent({ messages }: ChatContentProps) {
  return (
    <div className='flex flex-col gap-8 pb-32'>
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
  );
}
