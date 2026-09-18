import { createFileRoute } from '@tanstack/react-router';
import { useChessGame } from '@/hooks/useChessGame';
import { Board } from '@/components/chess/Board';
import { GameStatusBar } from '@/components/chess/GameStatusBar';
import { PromotionDialog } from '@/components/chess/PromotionDialog';

export const Route = createFileRoute('/')({
  component: ChessPage,
});

function ChessPage() {
  const game = useChessGame();

  return (
    <main className="flex flex-1 flex-col items-center gap-4 px-3 py-5 sm:gap-5 sm:py-8">
      <h1 className="text-center text-xl font-semibold tracking-wide text-lime-100 sm:text-2xl">
        Saad Chess
      </h1>

      <GameStatusBar state={game.state} onNewGame={game.newGame} />

      <Board
        board={game.state.board}
        selectedSquare={game.selectedSquare}
        legalTargets={game.legalTargets}
        lastMove={game.lastMove}
        checkedKingSquare={game.checkedKingSquare}
        disabled={game.isGameOver}
        onSelect={game.selectSquare}
      />

      <p className="max-w-md text-center text-xs text-lime-100/60">
        Tap a piece to see its legal moves, then tap a highlighted square to move.
      </p>

      {game.pendingPromotion && (
        <PromotionDialog color={game.state.sideToMove} onChoose={game.choosePromotion} />
      )}
    </main>
  );
}
