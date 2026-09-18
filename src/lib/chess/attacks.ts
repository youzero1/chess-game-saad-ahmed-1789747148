import type { Board, PieceColor, Square } from '@/types/chess';
import { isOnBoard, toCoord, toSquare } from './board';

const KNIGHT_OFFSETS = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
];

const KING_OFFSETS = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

const ROOK_DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const BISHOP_DIRS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

export function findKing(board: Board, color: PieceColor): Square | null {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece && piece.color === color && piece.type === 'k') {
        return toSquare({ file, rank });
      }
    }
  }
  return null;
}

/** Is `square` attacked by any piece of `byColor`? */
export function isSquareAttacked(board: Board, square: Square, byColor: PieceColor): boolean {
  const { file, rank } = toCoord(square);

  // Pawns: a pawn of byColor attacks diagonally forward from its own square.
  const pawnDir = byColor === 'w' ? 1 : -1;
  for (const df of [-1, 1]) {
    const f = file + df;
    const r = rank - pawnDir;
    if (isOnBoard(f, r)) {
      const p = board[r][f];
      if (p && p.color === byColor && p.type === 'p') return true;
    }
  }

  for (const [df, dr] of KNIGHT_OFFSETS) {
    const f = file + df;
    const r = rank + dr;
    if (!isOnBoard(f, r)) continue;
    const p = board[r][f];
    if (p && p.color === byColor && p.type === 'n') return true;
  }

  for (const [df, dr] of KING_OFFSETS) {
    const f = file + df;
    const r = rank + dr;
    if (!isOnBoard(f, r)) continue;
    const p = board[r][f];
    if (p && p.color === byColor && p.type === 'k') return true;
  }

  for (const [df, dr] of ROOK_DIRS) {
    let f = file + df;
    let r = rank + dr;
    while (isOnBoard(f, r)) {
      const p = board[r][f];
      if (p) {
        if (p.color === byColor && (p.type === 'r' || p.type === 'q')) return true;
        break;
      }
      f += df;
      r += dr;
    }
  }

  for (const [df, dr] of BISHOP_DIRS) {
    let f = file + df;
    let r = rank + dr;
    while (isOnBoard(f, r)) {
      const p = board[r][f];
      if (p) {
        if (p.color === byColor && (p.type === 'b' || p.type === 'q')) return true;
        break;
      }
      f += df;
      r += dr;
    }
  }

  return false;
}

export function isInCheck(board: Board, color: PieceColor): boolean {
  const king = findKing(board, color);
  if (!king) return false;
  return isSquareAttacked(board, king, color === 'w' ? 'b' : 'w');
}
