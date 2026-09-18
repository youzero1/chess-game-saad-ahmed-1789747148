---
status: pending
title: Pass-and-Play Chess Game with Wooden Board
---

# Overview

A single-page, two-player (same screen) chess game with complete standard rules,
legal-move highlighting, and a classic wooden board aesthetic. No AI, no move
history, no undo, no captured-piece tray, no clock, no theme switcher.

Project is currently empty (only README.md), so the scaffold must be created as
part of this plan.

---

## Phase 1 — Project scaffold

1. Create the Vite + React + TypeScript app scaffold at the repo root: `package.json`
   (npm, ESM, `"type": "module"`), `index.html`, `tsconfig.json`, `tsconfig.node.json`,
   `vite.config.ts`, `.gitignore`.
   - Dependencies: `react`, `react-dom`, `@tanstack/react-router`.
   - Dev dependencies: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`,
     `@types/react-dom`, `tailwindcss`, `@tailwindcss/vite`, `@tanstack/router-plugin`.
   - Expected outcome: `npm install && npm run dev` starts a dev server.
2. Configure `vite.config.ts` with the React plugin, `@tailwindcss/vite`, and
   `@tanstack/router-plugin/vite` (file-based routing, routes dir `src/routes`).
   Add the `@/` → `src/` path alias in both `vite.config.ts` (resolve.alias) and
   `tsconfig.json` (compilerOptions.paths).
   - Expected outcome: `src/routeTree.gen.ts` is generated automatically on dev start
     and is listed in `.gitignore`-adjacent tooling awareness (never hand-edited).
3. Create `src/styles/global.css` whose first line is exactly `@import "tailwindcss";`.
   Add CSS custom properties for the wooden palette (light square, dark square, frame,
   highlight, last-move tint) in a Tailwind v4 `@theme` block so they are usable as
   utility colors.
   - Expected outcome: Tailwind utilities compile; wood colors available as theme tokens.
4. Create `src/main.tsx` that imports `./styles/global.css` once, builds the router from
   `src/routeTree.gen.ts`, and renders `RouterProvider` into `#root`.
   - Expected outcome: blank app renders with no console errors.
5. Create `src/routes/__root.tsx` as the app shell: full-height flex column, warm neutral
   page background, centered content container, `<Outlet />`.
   - Expected outcome: shell renders on every route.

**Acceptance criteria:** `npm run dev` serves a styled empty page at `/` with no
TypeScript or console errors.

---

## Phase 2 — Chess domain types and board model

6. Create `src/types/chess.ts` with shared types: `PieceColor` (`'w' | 'b'`),
   `PieceType` (king, queen, rook, bishop, knight, pawn), `Piece` (color + type),
   `Square` (algebraic string like `'e4'`) and/or a numeric/`{file, rank}` coordinate
   type, `Board` (8×8 array of `Piece | null`), `Move` (from, to, piece, captured,
   promotion, flags for castle / en passant / double pawn push), `CastlingRights`,
   `GameStatus` (`'playing' | 'check' | 'checkmate' | 'stalemate'`), and `GameState`
   (board, sideToMove, castling rights, en-passant target square, halfmove clock,
   fullmove number, status, winner).
   - Expected outcome: single source of truth for all chess types; no `any`.
7. Create `src/lib/chess/board.ts` with the initial position factory, coordinate
   helpers (square ↔ file/rank, on-board bounds check, square color), and pure board
   cloning / piece get-set helpers.
   - Expected outcome: `createInitialGameState()` returns the standard opening position
     with white to move and full castling rights.

**Acceptance criteria:** Types compile; initial state helper produces the correct
32-piece starting layout.

---

## Phase 3 — Move generation and rules engine

8. Create `src/lib/chess/moves.ts` with pseudo-legal move generation per piece type:
   sliding pieces (rook, bishop, queen) via direction rays with blocker stops; knight
   and king via offset lists; pawns with single push, double push from the home rank,
   diagonal captures, and en-passant capture against the state's en-passant target.
   - Expected outcome: pure function `generatePseudoLegalMoves(state, square): Move[]`.
9. In the same module, add castling generation: king-side and queen-side, gated on
   castling rights, empty squares between king and rook, king not currently in check,
   and the king's transit and destination squares not attacked.
   - Expected outcome: castling appears only when fully legal.
10. Create `src/lib/chess/attacks.ts` with `isSquareAttacked(board, square, byColor)`
    and `findKing(board, color)`, used by check detection and castling legality.
    - Expected outcome: reliable attack detection independent of turn order.
11. Create `src/lib/chess/legal.ts` that filters pseudo-legal moves by simulating each
    move on a cloned board and rejecting any that leave the mover's own king in check.
    Expose `getLegalMoves(state, square): Move[]` and `getAllLegalMoves(state): Move[]`.
    - Expected outcome: pinned pieces cannot move off the pin; king cannot move into check.
12. Create `src/lib/chess/applyMove.ts` — a pure reducer that returns the next
    `GameState`: moves the piece, removes en-passant captured pawn, relocates the rook on
    castling, applies the chosen promotion piece, updates castling rights (king or rook
    moved / rook captured), sets or clears the en-passant target, flips side to move, and
    updates the halfmove/fullmove counters.
    - Expected outcome: state transitions are immutable and correct for all special moves.
13. Create `src/lib/chess/status.ts` computing game status after each move: in-check
    detection plus whether the side to move has any legal moves → `checkmate`,
    `stalemate`, `check`, or `playing`.
    - Expected outcome: status and winner are derivable from any `GameState`.

**Acceptance criteria:** Engine correctly handles castling both sides, en passant,
promotion, pins, check evasion, checkmate (e.g. fool's mate) and stalemate, verified by
manual play-through in the UI at the end of Phase 5.

---

## Phase 4 — Game state hook

14. Create `src/hooks/useChessGame.ts` holding `GameState` plus UI-interaction state:
    `selectedSquare`, derived `legalMoves` for the selection, `lastMove` (from/to for a
    subtle tint), and a `pendingPromotion` object (from, to) when a pawn reaches the last
    rank.
    - Exposed actions: `selectSquare(square)` (select own piece, deselect on re-click,
      switch selection to another own piece, or execute a move when the target is a legal
      destination), `choosePromotion(pieceType)`, and `newGame()`.
    - Expected outcome: all UI components stay presentational; no chess logic in JSX.
15. Ensure interaction guards: no selection or moves once status is `checkmate` or
    `stalemate`; only the side to move may be selected.
    - Expected outcome: finished games are read-only until New Game is pressed.

**Acceptance criteria:** Hook compiles and exposes a stable API consumed by Phase 5
components.

---

## Phase 5 — UI components (wooden board)

16. Create `src/lib/chess/pieceGlyphs.ts` mapping each color+type to its Unicode chess
    glyph, with white pieces rendered as light glyph fills with a dark outline/shadow and
    black pieces as dark fills, so both read clearly on light and dark wood squares.
    - Expected outcome: pieces are legible on every square.
17. Create `src/components/chess/Square.tsx` — one board square. Props: square id, piece,
    isLight, isSelected, isLegalTarget, isCaptureTarget, isCheckedKing, isLastMove, click
    handler. Renders wood-tone background, the piece glyph, a centered translucent dot for
    quiet legal targets, a ring for capture targets, and a red glow for a king in check.
    - Expected outcome: all visual states driven purely by props.
18. Create `src/components/chess/Board.tsx` — 8×8 grid rendered with an `aspect-square`
    container and CSS grid, wrapped in a thick wooden frame (dark wood border, inner
    bevel/shadow). Includes file letters (a–h) and rank numbers (1–8) rendered on the
    frame. Board is always drawn from White's perspective (no flip feature).
    - Expected outcome: perfectly square, responsive board that scales with the viewport.
19. Create `src/components/chess/PromotionDialog.tsx` — a modal overlay shown when
    `pendingPromotion` is set, offering queen, rook, bishop, knight in the promoting
    side's color; selecting one completes the move. Dismissal is not allowed (a promotion
    must be chosen), and it is keyboard-focusable.
    - Expected outcome: promotion always resolves to a valid piece.
20. Create `src/components/chess/GameStatusBar.tsx` — shows whose turn it is (with a
    color swatch), "Check!" when in check, and the terminal result ("White wins by
    checkmate", "Black wins by checkmate", "Draw by stalemate"). Includes the
    "New Game" button.
    - Expected outcome: current game state is always readable at a glance.
21. Create `src/routes/index.tsx` — the game page. Uses `useChessGame`, computes
    per-square highlight sets, and composes `GameStatusBar`, `Board`, and
    `PromotionDialog` inside a centered layout with a short title/heading.
    - Expected outcome: a fully playable game at `/`.

**Acceptance criteria:** A complete game can be played start to finish on the same
screen: selecting a piece highlights only its legal moves, illegal moves are impossible,
castling/en passant/promotion all work, checkmate and stalemate end the game, and
New Game resets to the opening position.

---

## Phase 6 — Responsive polish

22. Tune the layout in `src/routes/index.tsx` and `src/components/chess/Board.tsx`:
    board sized via viewport-relative clamping so it fits without scrolling on mobile
    portrait and stays comfortably large on desktop; status bar stacks above the board on
    narrow screens and sits above with more breathing room on wide screens; piece glyph
    size scales with square size.
    - Expected outcome: no horizontal scroll at 360px width; board never overflows the
      viewport height on desktop.
23. Add interaction polish: hover cursor only on selectable/targetable squares, smooth
    transitions on highlight states, `prefers-reduced-motion` respected, accessible
    labels on each square (e.g. "e4, white pawn") and on the New Game button.
    - Expected outcome: keyboard and screen-reader users can identify squares and pieces.
24. Final pass: remove unused files from the scaffold, confirm `src/styles/global.css` is
    imported exactly once, confirm `src/routeTree.gen.ts` is untouched by hand, and verify
    the TypeScript build passes with no errors or `any` usage.
    - Expected outcome: clean build, tight scope, no dead code.

**Acceptance criteria:** Game looks and plays well at mobile and desktop widths with a
clean production build.
