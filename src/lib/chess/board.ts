import type {
  Board,
  Coord,
  GameState,
  Piece,
  PieceColor,
  PieceType,
  Square,
} from '@/types/chess';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

export function toSquare(coord: Coord): Square {
  return `${FILES[coord.file]}${coord.rank + 1}`;
}

export function toCoord(square: Square): Coord {
  return {
    file: square.charCodeAt(0) - 97,
    rank: Number(square[1]) - 1,
  };
}

export function isOnBoard(file: number, rank: number): boolean {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8;
}

/** True when the square is a light square. */
export function isLightSquare(square: Square): boolean {
  const { file, rank } = toCoord(square);
  return (file + rank) % 2 === 1;
}

export function pieceAt(board: Board, square: Square): Piece | null {
  const { file, rank } = toCoord(square);
  if (!isOnBoard(file, rank)) return null;
  return board[rank][file];
}

export function setPiece(board: Board, square: Square, piece: Piece | null): void {
  const { file, rank } = toCoord(square);
  board[rank][file] = piece;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

export function emptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
}

const BACK_RANK: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

export function createInitialBoard(): Board {
  const board = emptyBoard();
  for (let file = 0; file < 8; file++) {
    board[0][file] = { color: 'w', type: BACK_RANK[file] };
    board[1][file] = { color: 'w', type: 'p' };
    board[6][file] = { color: 'b', type: 'p' };
    board[7][file] = { color: 'b', type: BACK_RANK[file] };
  }
  return board;
}

export function createInitialGameState(): GameState {
  return {
    board: createInitialBoard(),
    sideToMove: 'w',
    castling: { wk: true, wq: true, bk: true, bq: true },
    enPassant: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
    status: 'playing',
    winner: null,
  };
}

export function opposite(color: PieceColor): PieceColor {
  return color === 'w' ? 'b' : 'w';
}

export function allSquares(): Square[] {
  const squares: Square[] = [];
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      squares.push(toSquare({ file, rank }));
    }
  }
  return squares;
}
