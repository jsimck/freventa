import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from '../ui/prompt-input';
import { Button } from '../ui/button';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAvatar,
  MessageContent,
} from '../ui/message';
import { ChatContainerContent, ChatContainerRoot } from '../ui/chat-container';

export function Chat() {
  const convexUrl = import.meta.env.VITE_CONVEX_API_URL;

  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: `${convexUrl}/completion`,
    }),
  });

  if (!convexUrl) {
    return <div>Error: VITE_CONVEX_API_URL not set</div>;
  }

  return (
    <div className='flex flex-col'>
      <div className='flex-1 overflow-y-auto p-4'></div>

      <div className='flex flex-col gap-8'>
        <ChatContainerRoot className='flex-1'>
          <ChatContainerContent className='space-y-4 p-4'>
            {messages.map((message) => {
              const content = message.parts
                .map((part) => (part.type === 'text' ? part.text : null))
                ?.join('');

              return (
                <div key={message.id}>
                  {message.role === 'assistant' ? (
                    <Message className='justify-start'>
                      <MessageAvatar src='' alt='AI' fallback='AI' />
                      <div className='flex w-full flex-col gap-2'>
                        <MessageContent markdown className='bg-transparent p-0'>
                          {content}
                        </MessageContent>
                      </div>
                    </Message>
                  ) : (
                    <Message className='justify-end'>
                      <MessageContent>{content}</MessageContent>
                    </Message>
                  )}
                </div>
              );
            })}
          </ChatContainerContent>
        </ChatContainerRoot>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
          }
        }}
      >
        <PromptInput>
          <PromptInputTextarea
            value={input}
            placeholder='Ask prompt-kit'
            onChange={(e) => setInput(e.target.value)}
          />
          <PromptInputActions>
            <PromptInputAction tooltip='Send'>
              <Button type='submit'>Send</Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </form>
    </div>
  );
}
