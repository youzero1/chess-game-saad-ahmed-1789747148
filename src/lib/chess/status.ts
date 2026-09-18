import type { GameState, GameStatus, PieceColor } from '@/types/chess';
import { isInCheck } from './attacks';
import { getAllLegalMoves } from './legal';
import { opposite } from './board';

export function computeStatus(state: GameState): { status: GameStatus; winner: PieceColor | null } {
  const inCheck = isInCheck(state.board, state.sideToMove);
  const hasMoves = getAllLegalMoves(state).length > 0;

  if (!hasMoves) {
    return inCheck
      ? { status: 'checkmate', winner: opposite(state.sideToMove) }
      : { status: 'stalemate', winner: null };
  }
  return { status: inCheck ? 'check' : 'playing', winner: null };
}
