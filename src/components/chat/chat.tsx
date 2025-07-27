import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
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
  const { messages, sendMessage, addToolResult } = useChat({
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

                        {message.parts.map((part) => {
                          switch (part.type) {
                            case 'tool-askForConfirmation':
                            case 'tool-getLocation':
                            case 'tool-getWeatherInformation':
                              switch (part.state) {
                                case 'input-streaming':
                                  return (
                                    <pre>
                                      {JSON.stringify(part.input, null, 2)}
                                    </pre>
                                  );
                                case 'input-available':
                                  return (
                                    <pre>
                                      {JSON.stringify(part.input, null, 2)}
                                    </pre>
                                  );
                                case 'output-available':
                                  return (
                                    <pre>
                                      {JSON.stringify(part.output, null, 2)}
                                    </pre>
                                  );
                                case 'output-error':
                                  return <div>Error: {part.errorText}</div>;
                              }
                          }
                        })}
                        {message.parts.map((part) => {
                          switch (part.type) {
                            // for tool parts, use the typed tool part names:
                            case 'tool-askForConfirmation': {
                              const callId = part.toolCallId;

                              switch (part.state) {
                                case 'input-streaming':
                                  return (
                                    <div key={callId}>
                                      Loading confirmation request...
                                    </div>
                                  );
                                case 'input-available':
                                  return (
                                    <div key={callId}>
                                      {part.input.message}
                                      <div>
                                        <Button
                                          onClick={() =>
                                            addToolResult({
                                              tool: 'askForConfirmation',
                                              toolCallId: callId,
                                              output: 'Yes, confirmed.',
                                            })
                                          }
                                        >
                                          Yes
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            addToolResult({
                                              tool: 'askForConfirmation',
                                              toolCallId: callId,
                                              output: 'No, denied',
                                            })
                                          }
                                        >
                                          No
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                case 'output-available':
                                  return (
                                    <div key={callId}>
                                      Location access allowed: {part.output}
                                    </div>
                                  );
                                case 'output-error':
                                  return (
                                    <div key={callId}>
                                      Error: {part.errorText}
                                    </div>
                                  );
                              }
                              break;
                            }

                            case 'tool-getLocation': {
                              const callId = part.toolCallId;

                              switch (part.state) {
                                case 'input-streaming':
                                  return (
                                    <div key={callId}>
                                      Preparing location request...
                                    </div>
                                  );
                                case 'input-available':
                                  return (
                                    <div key={callId}>Getting location...</div>
                                  );
                                case 'output-available':
                                  return (
                                    <div key={callId}>
                                      Location: {part.output}
                                    </div>
                                  );
                                case 'output-error':
                                  return (
                                    <div key={callId}>
                                      Error getting location: {part.errorText}
                                    </div>
                                  );
                              }
                              break;
                            }

                            case 'tool-getWeatherInformation': {
                              const callId = part.toolCallId;

                              switch (part.state) {
                                // example of pre-rendering streaming tool inputs:
                                case 'input-streaming':
                                  return (
                                    <pre key={callId}>
                                      {JSON.stringify(part, null, 2)}
                                    </pre>
                                  );
                                case 'input-available':
                                  return (
                                    <div key={callId}>
                                      Getting weather information for{' '}
                                      {part.input.city}...
                                    </div>
                                  );
                                case 'output-available':
                                  return (
                                    <div key={callId}>
                                      Weather in {part.input.city}:{' '}
                                      {part.output}
                                    </div>
                                  );
                                case 'output-error':
                                  return (
                                    <div key={callId}>
                                      Error getting weather for{' '}
                                      {part.input.city}: {part.errorText}
                                    </div>
                                  );
                              }
                              break;
                            }
                          }
                        })}
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
