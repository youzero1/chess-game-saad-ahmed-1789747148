import { useCallback, useMemo, useState } from 'react';
import type { GameState, Move, PromotionPiece, Square } from '@/types/chess';
import { createInitialGameState, pieceAt } from '@/lib/chess/board';
import { getLegalMoves } from '@/lib/chess/legal';
import { applyMove } from '@/lib/chess/applyMove';
import { findKing } from '@/lib/chess/attacks';

export interface PendingPromotion {
  from: Square;
  to: Square;
}

export interface ChessGame {
  state: GameState;
  selectedSquare: Square | null;
  legalMoves: Move[];
  legalTargets: Map<Square, Move>;
  lastMove: { from: Square; to: Square } | null;
  pendingPromotion: PendingPromotion | null;
  checkedKingSquare: Square | null;
  isGameOver: boolean;
  selectSquare: (square: Square) => void;
  choosePromotion: (piece: PromotionPiece) => void;
  newGame: () => void;
}

export function useChessGame(): ChessGame {
  const [state, setState] = useState<GameState>(() => createInitialGameState());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);

  const isGameOver = state.status === 'checkmate' || state.status === 'stalemate';

  const legalMoves = useMemo(
    () => (selectedSquare ? getLegalMoves(state, selectedSquare) : []),
    [state, selectedSquare],
  );

  const legalTargets = useMemo(() => {
    const map = new Map<Square, Move>();
    for (const move of legalMoves) {
      if (!map.has(move.to)) map.set(move.to, move);
    }
    return map;
  }, [legalMoves]);

  const checkedKingSquare = useMemo(() => {
    if (state.status !== 'check' && state.status !== 'checkmate') return null;
    return findKing(state.board, state.sideToMove);
  }, [state]);

  const commit = useCallback(
    (move: Move) => {
      setState((current) => applyMove(current, move));
      setLastMove({ from: move.from, to: move.to });
      setSelectedSquare(null);
      setPendingPromotion(null);
    },
    [],
  );

  const selectSquare = useCallback(
    (square: Square) => {
      if (isGameOver || pendingPromotion) return;

      if (selectedSquare) {
        if (square === selectedSquare) {
          setSelectedSquare(null);
          return;
        }
        const target = legalMoves.filter((m) => m.to === square);
        if (target.length > 0) {
          if (target[0].promotion) {
            setPendingPromotion({ from: selectedSquare, to: square });
            return;
          }
          commit(target[0]);
          return;
        }
      }

      const piece = pieceAt(state.board, square);
      if (piece && piece.color === state.sideToMove) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    },
    [commit, isGameOver, legalMoves, pendingPromotion, selectedSquare, state],
  );

  const choosePromotion = useCallback(
    (promotion: PromotionPiece) => {
      if (!pendingPromotion) return;
      const moves = getLegalMoves(state, pendingPromotion.from);
      const move = moves.find((m) => m.to === pendingPromotion.to && m.promotion === promotion);
      if (move) commit(move);
    },
    [commit, pendingPromotion, state],
  );

  const newGame = useCallback(() => {
    setState(createInitialGameState());
    setSelectedSquare(null);
    setLastMove(null);
    setPendingPromotion(null);
  }, []);

  return {
    state,
    selectedSquare,
    legalMoves,
    legalTargets,
    lastMove,
    pendingPromotion,
    checkedKingSquare,
    isGameOver,
    selectSquare,
    choosePromotion,
    newGame,
  };
}
