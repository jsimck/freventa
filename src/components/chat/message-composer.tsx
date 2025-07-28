import { ArrowUp, Globe, Mic, MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from '../ui/prompt-input';

export interface MessageComposerProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export function MessageComposer({ onSubmit, isLoading }: MessageComposerProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    const cleanedPrompt = prompt.trim();

    if (!cleanedPrompt) {
      return;
    }

    onSubmit(cleanedPrompt);
    setPrompt('');
  };

  return (
    <div className='fixed bottom-0 mx-auto w-full max-w-3xl px-3 pb-3 md:px-5 md:pb-5'>
      <PromptInput
        className='relative z-10 w-full rounded-3xl border border-input bg-popover p-0 pt-1 shadow-xs'
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onValueChange={setPrompt}
        value={prompt}
      >
        <div className='flex flex-col'>
          <PromptInputTextarea
            className='min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base'
            placeholder='Ask anything'
          />

          <PromptInputActions className='mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3'>
            <div className='flex items-center gap-2'>
              <PromptInputAction tooltip='Add a new action'>
                <Button
                  className='size-9 rounded-full'
                  size='icon'
                  variant='outline'
                >
                  <Plus size={18} />
                </Button>
              </PromptInputAction>

              <PromptInputAction tooltip='Search'>
                <Button className='rounded-full' variant='outline'>
                  <Globe size={18} />
                  Search
                </Button>
              </PromptInputAction>

              <PromptInputAction tooltip='More actions'>
                <Button
                  className='size-9 rounded-full'
                  size='icon'
                  variant='outline'
                >
                  <MoreHorizontal size={18} />
                </Button>
              </PromptInputAction>
            </div>
            <div className='flex items-center gap-2'>
              <PromptInputAction tooltip='Voice input'>
                <Button
                  className='size-9 rounded-full'
                  size='icon'
                  variant='outline'
                >
                  <Mic size={18} />
                </Button>
              </PromptInputAction>

              <Button
                className='size-9 rounded-full'
                disabled={!prompt.trim() || isLoading}
                onClick={handleSubmit}
                size='icon'
              >
                {isLoading ? (
                  <span className='size-3 rounded-xs bg-white' />
                ) : (
                  <ArrowUp size={18} />
                )}
              </Button>
            </div>
          </PromptInputActions>
        </div>
      </PromptInput>
    </div>
  );
}
