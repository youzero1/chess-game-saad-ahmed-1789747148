import type { Piece, PieceType } from '@/types/chess';

/** Solid glyphs for both colors; color is applied via CSS fill so both read clearly. */
const GLYPHS: Record<PieceType, string> = {
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
};

const NAMES: Record<PieceType, string> = {
  k: 'king',
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
  p: 'pawn',
};

export function glyphFor(piece: Piece): string {
  return GLYPHS[piece.type];
}

export function pieceName(piece: Piece): string {
  return `${piece.color === 'w' ? 'white' : 'black'} ${NAMES[piece.type]}`;
}

export function typeName(type: PieceType): string {
  return NAMES[type];
}
