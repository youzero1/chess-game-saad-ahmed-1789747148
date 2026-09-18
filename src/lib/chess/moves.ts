import type { GameState, Move, Piece, Square } from '@/types/chess';
import { isOnBoard, pieceAt, toCoord, toSquare } from './board';
import { isSquareAttacked } from './attacks';

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

const PROMOTIONS = ['q', 'r', 'b', 'n'] as const;

function makeMove(
  from: Square,
  to: Square,
  piece: Piece,
  captured: Piece | null,
  extra: Partial<Move> = {},
): Move {
  return { from, to, piece, captured, ...extra };
}

/**
 * Pseudo-legal moves for the piece on `square` — does not check whether the
 * mover's own king is left in check (see legal.ts). Castling IS gated on
 * attacked squares here because those conditions are specific to castling.
 */
export function generatePseudoLegalMoves(state: GameState, square: Square): Move[] {
  const piece = pieceAt(state.board, square);
  if (!piece) return [];

  const moves: Move[] = [];
  const { file, rank } = toCoord(square);
  const board = state.board;

  const pushSliding = (dirs: number[][]) => {
    for (const [df, dr] of dirs) {
      let f = file + df;
      let r = rank + dr;
      while (isOnBoard(f, r)) {
        const target = board[r][f];
        const to = toSquare({ file: f, rank: r });
        if (!target) {
          moves.push(makeMove(square, to, piece, null));
        } else {
          if (target.color !== piece.color) moves.push(makeMove(square, to, piece, target));
          break;
        }
        f += df;
        r += dr;
      }
    }
  };

  const pushOffsets = (offsets: number[][]) => {
    for (const [df, dr] of offsets) {
      const f = file + df;
      const r = rank + dr;
      if (!isOnBoard(f, r)) continue;
      const target = board[r][f];
      if (target && target.color === piece.color) continue;
      moves.push(makeMove(square, toSquare({ file: f, rank: r }), piece, target));
    }
  };

  switch (piece.type) {
    case 'p': {
      const dir = piece.color === 'w' ? 1 : -1;
      const startRank = piece.color === 'w' ? 1 : 6;
      const promoRank = piece.color === 'w' ? 7 : 0;

      const oneRank = rank + dir;
      if (isOnBoard(file, oneRank) && !board[oneRank][file]) {
        const to = toSquare({ file, rank: oneRank });
        if (oneRank === promoRank) {
          for (const promotion of PROMOTIONS) {
            moves.push(makeMove(square, to, piece, null, { promotion }));
          }
        } else {
          moves.push(makeMove(square, to, piece, null));
          const twoRank = rank + dir * 2;
          if (rank === startRank && !board[twoRank][file]) {
            moves.push(
              makeMove(square, toSquare({ file, rank: twoRank }), piece, null, {
                isDoublePawnPush: true,
              }),
            );
          }
        }
      }

      for (const df of [-1, 1]) {
        const f = file + df;
        const r = rank + dir;
        if (!isOnBoard(f, r)) continue;
        const to = toSquare({ file: f, rank: r });
        const target = board[r][f];
        if (target && target.color !== piece.color) {
          if (r === promoRank) {
            for (const promotion of PROMOTIONS) {
              moves.push(makeMove(square, to, piece, target, { promotion }));
            }
          } else {
            moves.push(makeMove(square, to, piece, target));
          }
        } else if (!target && state.enPassant === to) {
          const capturedPawn = board[rank][f];
          if (capturedPawn && capturedPawn.color !== piece.color && capturedPawn.type === 'p') {
            moves.push(makeMove(square, to, piece, capturedPawn, { isEnPassant: true }));
          }
        }
      }
      break;
    }
    case 'n':
      pushOffsets(KNIGHT_OFFSETS);
      break;
    case 'b':
      pushSliding(BISHOP_DIRS);
      break;
    case 'r':
      pushSliding(ROOK_DIRS);
      break;
    case 'q':
      pushSliding([...ROOK_DIRS, ...BISHOP_DIRS]);
      break;
    case 'k': {
      pushOffsets(KING_OFFSETS);
      moves.push(...generateCastlingMoves(state, square, piece));
      break;
    }
  }

  return moves;
}

function generateCastlingMoves(state: GameState, square: Square, piece: Piece): Move[] {
  const moves: Move[] = [];
  const color = piece.color;
  const homeSquare = color === 'w' ? 'e1' : 'e8';
  if (square !== homeSquare) return moves;

  const board = state.board;
  const enemy = color === 'w' ? 'b' : 'w';
  if (isSquareAttacked(board, homeSquare, enemy)) return moves;

  const kingSideOk = color === 'w' ? state.castling.wk : state.castling.bk;
  const queenSideOk = color === 'w' ? state.castling.wq : state.castling.bq;
  const rank = color === 'w' ? '1' : '8';

  if (kingSideOk) {
    const empty = [`f${rank}`, `g${rank}`];
    const rook = pieceAt(board, `h${rank}`);
    if (
      rook &&
      rook.type === 'r' &&
      rook.color === color &&
      empty.every((s) => !pieceAt(board, s)) &&
      empty.every((s) => !isSquareAttacked(board, s, enemy))
    ) {
      moves.push(makeMove(square, `g${rank}`, piece, null, { isCastle: 'k' }));
    }
  }

  if (queenSideOk) {
    const empty = [`d${rank}`, `c${rank}`, `b${rank}`];
    const safe = [`d${rank}`, `c${rank}`];
    const rook = pieceAt(board, `a${rank}`);
    if (
      rook &&
      rook.type === 'r' &&
      rook.color === color &&
      empty.every((s) => !pieceAt(board, s)) &&
      safe.every((s) => !isSquareAttacked(board, s, enemy))
    ) {
      moves.push(makeMove(square, `c${rank}`, piece, null, { isCastle: 'q' }));
    }
  }

  return moves;
}
