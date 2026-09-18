import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <p className="text-lg text-amber-200/80">Chess board loading…</p>
    </div>
  );
}
