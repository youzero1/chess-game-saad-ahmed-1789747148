import type { Board, GameState, Move, Square } from '@/types/chess';
import { allSquares, cloneBoard, pieceAt, setPiece, toCoord, toSquare } from './board';
import { generatePseudoLegalMoves } from './moves';
import { isInCheck } from './attacks';

/** Board after a move, ignoring all bookkeeping other than piece placement. */
export function boardAfterMove(board: Board, move: Move): Board {
  const next = cloneBoard(board);
  setPiece(next, move.from, null);

  if (move.isEnPassant) {
    const fromCoord = toCoord(move.from);
    const toCoordinate = toCoord(move.to);
    setPiece(next, toSquare({ file: toCoordinate.file, rank: fromCoord.rank }), null);
  }

  setPiece(next, move.to, {
    color: move.piece.color,
    type: move.promotion ?? move.piece.type,
  });

  if (move.isCastle) {
    const rank = move.piece.color === 'w' ? '1' : '8';
    if (move.isCastle === 'k') {
      setPiece(next, `h${rank}`, null);
      setPiece(next, `f${rank}`, { color: move.piece.color, type: 'r' });
    } else {
      setPiece(next, `a${rank}`, null);
      setPiece(next, `d${rank}`, { color: move.piece.color, type: 'r' });
    }
  }

  return next;
}

export function getLegalMoves(state: GameState, square: Square): Move[] {
  const piece = pieceAt(state.board, square);
  if (!piece) return [];
  return generatePseudoLegalMoves(state, square).filter(
    (move) => !isInCheck(boardAfterMove(state.board, move), piece.color),
  );
}

export function getAllLegalMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  for (const square of allSquares()) {
    const piece = pieceAt(state.board, square);
    if (!piece || piece.color !== state.sideToMove) continue;
    moves.push(...getLegalMoves(state, square));
  }
  return moves;
}
