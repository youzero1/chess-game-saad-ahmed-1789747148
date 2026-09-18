import type { GameState } from '@/types/chess';

interface GameStatusBarProps {
  state: GameState;
  onNewGame: () => void;
}

function describe(state: GameState): string {
  const mover = state.sideToMove === 'w' ? 'White' : 'Black';
  switch (state.status) {
    case 'checkmate':
      return `${state.winner === 'w' ? 'White' : 'Black'} wins by checkmate`;
    case 'stalemate':
      return 'Draw by stalemate';
    case 'check':
      return `${mover} to move — Check!`;
    default:
      return `${mover} to move`;
  }
}

export function GameStatusBar({ state, onNewGame }: GameStatusBarProps) {
  const isOver = state.status === 'checkmate' || state.status === 'stalemate';

  return (
    <div className="flex w-full max-w-[min(92vw,calc(100vh-14rem))] flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
      <div className="flex items-center gap-3" aria-live="polite">
        {!isOver && (
          <span
            aria-hidden="true"
            className={`h-4 w-4 rounded-full ring-1 ring-black/40 ${
              state.sideToMove === 'w' ? 'bg-lime-50' : 'bg-neutral-900'
            }`}
          />
        )}
        <span
          className={`text-sm font-medium sm:text-base ${
            state.status === 'check' ? 'text-red-300' : 'text-lime-50'
          }`}
        >
          {describe(state)}
        </span>
      </div>
      <button
        type="button"
        onClick={onNewGame}
        aria-label="Start a new game"
        className="rounded-lg bg-lime-300 px-4 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-lime-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 motion-reduce:transition-none"
      >
        New Game
      </button>
    </div>
  );
}
