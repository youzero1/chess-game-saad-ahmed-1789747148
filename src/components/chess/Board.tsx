import type { Board as BoardModel, Square as SquareId } from '@/types/chess';
import { FILES, isLightSquare, pieceAt, toSquare } from '@/lib/chess/board';
import { Square } from './Square';

interface BoardProps {
  board: BoardModel;
  selectedSquare: SquareId | null;
  legalTargets: Map<SquareId, { captured: unknown; isEnPassant?: boolean }>;
  lastMove: { from: SquareId; to: SquareId } | null;
  checkedKingSquare: SquareId | null;
  disabled: boolean;
  onSelect: (square: SquareId) => void;
}

const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

export function Board({
  board,
  selectedSquare,
  legalTargets,
  lastMove,
  checkedKingSquare,
  disabled,
  onSelect,
}: BoardProps) {
  return (
    <div
      className="w-full max-w-[min(92vw,calc(100vh-14rem))]"
      style={{ ['--square-size' as string]: 'min(11.5vw, calc((100vh - 14rem) / 8))' }}
    >
      <div className="rounded-xl bg-wood-frame p-[4%] shadow-[0_18px_40px_rgba(0,0,0,0.55)] ring-1 ring-wood-frame-edge sm:p-[3%]">
        <div className="flex">
          <div className="flex w-[3%] shrink-0 flex-col justify-around pr-1 text-[0.6rem] text-amber-100/70 sm:text-xs">
            {RANKS.map((rank) => (
              <span key={rank} className="text-center leading-none">
                {rank}
              </span>
            ))}
          </div>
          <div className="grid aspect-square min-w-0 flex-1 grid-cols-8 overflow-hidden rounded-sm ring-2 ring-wood-frame-edge">
            {RANKS.map((rank) =>
              FILES.map((_, fileIndex) => {
                const square = toSquare({ file: fileIndex, rank: rank - 1 });
                const target = legalTargets.get(square);
                return (
                  <Square
                    key={square}
                    square={square}
                    piece={pieceAt(board, square)}
                    isLight={isLightSquare(square)}
                    isSelected={selectedSquare === square}
                    isLegalTarget={Boolean(target)}
                    isCaptureTarget={Boolean(target && target.captured)}
                    isCheckedKing={checkedKingSquare === square}
                    isLastMove={
                      lastMove !== null && (lastMove.from === square || lastMove.to === square)
                    }
                    disabled={disabled}
                    onSelect={onSelect}
                  />
                );
              }),
            )}
          </div>
        </div>
        <div className="flex">
          <div className="w-[3%] shrink-0" />
          <div className="grid flex-1 grid-cols-8 pt-1 text-[0.6rem] text-amber-100/70 sm:text-xs">
            {FILES.map((file) => (
              <span key={file} className="text-center leading-none">
                {file}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
