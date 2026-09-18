import type { CastlingRights, GameState, Move } from '@/types/chess';
import { opposite, toCoord, toSquare } from './board';
import { boardAfterMove } from './legal';
import { computeStatus } from './status';

function updateCastling(rights: CastlingRights, move: Move): CastlingRights {
  const next: CastlingRights = { ...rights };
  const { from, to, piece } = move;

  if (piece.type === 'k') {
    if (piece.color === 'w') {
      next.wk = false;
      next.wq = false;
    } else {
      next.bk = false;
      next.bq = false;
    }
  }

  if (from === 'a1' || to === 'a1') next.wq = false;
  if (from === 'h1' || to === 'h1') next.wk = false;
  if (from === 'a8' || to === 'a8') next.bq = false;
  if (from === 'h8' || to === 'h8') next.bk = false;

  return next;
}

export function applyMove(state: GameState, move: Move): GameState {
  const board = boardAfterMove(state.board, move);

  let enPassant: string | null = null;
  if (move.isDoublePawnPush) {
    const fromCoord = toCoord(move.from);
    const toCoordinate = toCoord(move.to);
    enPassant = toSquare({
      file: fromCoord.file,
      rank: (fromCoord.rank + toCoordinate.rank) / 2,
    });
  }

  const resetClock = move.piece.type === 'p' || move.captured !== null;

  const next: GameState = {
    board,
    sideToMove: opposite(state.sideToMove),
    castling: updateCastling(state.castling, move),
    enPassant,
    halfmoveClock: resetClock ? 0 : state.halfmoveClock + 1,
    fullmoveNumber: state.sideToMove === 'b' ? state.fullmoveNumber + 1 : state.fullmoveNumber,
    status: 'playing',
    winner: null,
  };

  const { status, winner } = computeStatus(next);
  next.status = status;
  next.winner = winner;
  return next;
}
