import { useEffect, useRef } from 'react';
import type { PieceColor, PromotionPiece } from '@/types/chess';
import { glyphFor, typeName } from '@/lib/chess/pieceGlyphs';

interface PromotionDialogProps {
  color: PieceColor;
  onChoose: (piece: PromotionPiece) => void;
}

const OPTIONS: PromotionPiece[] = ['q', 'r', 'b', 'n'];

export function PromotionDialog({ color, onChoose }: PromotionDialogProps) {
  const firstRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose promotion piece"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="w-full max-w-sm rounded-2xl bg-wood-frame p-5 text-amber-50 shadow-2xl ring-1 ring-wood-frame-edge">
        <h2 className="mb-4 text-center text-base font-semibold">
          Promote your pawn — choose a piece
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {OPTIONS.map((type, index) => (
            <button
              key={type}
              ref={index === 0 ? firstRef : undefined}
              type="button"
              onClick={() => onChoose(type)}
              aria-label={`Promote to ${typeName(type)}`}
              className={`flex aspect-square items-center justify-center rounded-lg bg-wood-light text-4xl transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 motion-reduce:transition-none sm:text-5xl ${
                color === 'w'
                  ? 'text-white [text-shadow:0_0_1px_#000,1px_0_0_#3f3f46,-1px_0_0_#3f3f46,0_1px_0_#3f3f46,0_-1px_0_#3f3f46]'
                  : 'text-neutral-900'
              }`}
            >
              {glyphFor({ color, type })}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
