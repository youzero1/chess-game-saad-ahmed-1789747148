export type PieceColor = 'w' | 'b';

export type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';

export interface Piece {
  color: PieceColor;
  type: PieceType;
}

/** Algebraic square name, e.g. "e4". */
export type Square = string;

/** 0-based coordinates. file 0 = 'a', rank 0 = '1'. */
export interface Coord {
  file: number;
  rank: number;
}

/** board[rank][file] with rank 0 = rank "1" (white's back rank). */
export type Board = (Piece | null)[][];

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

export interface Move {
  from: Square;
  to: Square;
  piece: Piece;
  captured: Piece | null;
  promotion?: PromotionPiece;
  isEnPassant?: boolean;
  isCastle?: 'k' | 'q';
  isDoublePawnPush?: boolean;
}

export interface CastlingRights {
  wk: boolean;
  wq: boolean;
  bk: boolean;
  bq: boolean;
}

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate';

export interface GameState {
  board: Board;
  sideToMove: PieceColor;
  castling: CastlingRights;
  enPassant: Square | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  status: GameStatus;
  winner: PieceColor | null;
}
