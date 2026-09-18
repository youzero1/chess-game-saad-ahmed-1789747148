import type { Piece, Square as SquareId } from '@/types/chess';
import { glyphFor, pieceName } from '@/lib/chess/pieceGlyphs';

interface SquareProps {
  square: SquareId;
  piece: Piece | null;
  isLight: boolean;
  isSelected: boolean;
  isLegalTarget: boolean;
  isCaptureTarget: boolean;
  isCheckedKing: boolean;
  isLastMove: boolean;
  disabled: boolean;
  onSelect: (square: SquareId) => void;
}

export function Square({
  square,
  piece,
  isLight,
  isSelected,
  isLegalTarget,
  isCaptureTarget,
  isCheckedKing,
  isLastMove,
  disabled,
  onSelect,
}: SquareProps) {
  const base = isLight ? 'bg-wood-light' : 'bg-wood-dark';
  const interactive = !disabled && (isLegalTarget || piece !== null);

  const label = `${square}${piece ? `, ${pieceName(piece)}` : ', empty'}${
    isLegalTarget ? ', legal move' : ''
  }`;

  return (
    <button
      type="button"
      onClick={() => onSelect(square)}
      aria-label={label}
      aria-pressed={isSelected}
      disabled={disabled}
      className={`relative flex aspect-square w-full items-center justify-center ${base} transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-inset ${
        interactive ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      {isLastMove && <span className="absolute inset-0 bg-lastmove/30" aria-hidden="true" />}
      {isSelected && <span className="absolute inset-0 bg-highlight/45" aria-hidden="true" />}
      {isCheckedKing && (
        <span
          className="absolute inset-0 bg-red-500/50 shadow-[inset_0_0_1.2rem_rgba(220,38,38,0.9)]"
          aria-hidden="true"
        />
      )}
      {isLegalTarget && !isCaptureTarget && (
        <span
          className="absolute h-[28%] w-[28%] rounded-full bg-black/35 ring-1 ring-white/20"
          aria-hidden="true"
        />
      )}
      {isCaptureTarget && (
        <span
          className="absolute inset-[6%] rounded-full ring-[0.35rem] ring-black/35"
          aria-hidden="true"
        />
      )}
      {piece && (
        <span
          aria-hidden="true"
          className={`relative select-none leading-none ${
            piece.color === 'w'
              ? 'text-white [text-shadow:0_0_1px_#000,0_1px_2px_rgba(0,0,0,0.6),1px_0_0_#3f3f46,-1px_0_0_#3f3f46,0_1px_0_#3f3f46,0_-1px_0_#3f3f46]'
              : 'text-neutral-900 [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]'
          }`}
          style={{ fontSize: 'calc(var(--square-size) * 0.78)' }}
        >
          {glyphFor(piece)}
        </span>
      )}
    </button>
  );
}
