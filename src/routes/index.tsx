import { createFileRoute } from '@tanstack/react-router';
import { Chat } from '@/components/chat/chat';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div>
      <Chat />
    </div>
  );
}
