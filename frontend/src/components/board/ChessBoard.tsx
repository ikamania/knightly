import type { Chess, Color } from "chess.js"
import Square from "./Square"
import Piece from "./Piece"
import PromotionDialog from "./PromotionDialog"
import { useChessDrag } from "../../hooks/useChessDrag"
import type { PromotionPiece } from "../../websocket/gameSocket"


type Props = {
  game: Chess
  playerColor: Color
  orientation: "white" | "black"
  onMove: (
    from: [number, number],
    to: [number, number],
    promotion?: PromotionPiece,
  ) => void
}


export default function ChessBoard({ game, playerColor, orientation, onMove }: Props) {
  const {
    dragging,
    legalTargets,
    pendingPromotion,
    selected,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    resolvePromotion,
    cancelPromotion,
    cancelDrag,
  } = useChessDrag(game, playerColor, onMove)

  const board = game.board()

  return (
    <div
      className={`w-fit border select-none relative touch-none ${dragging ? "cursor-grabbing" : ""}`}
      style={{ "--cell-size": "clamp(2.25rem, 11vw, 5rem)" } as React.CSSProperties}
      onPointerMove={onPointerMove}
      onPointerLeave={cancelDrag}
    >
      {board.map((_, r) => (
        <div key={r} className="flex">
          {board.map((_, c) => {
            const viewR = orientation === "white" ? r : 7 - r
            const viewC = orientation === "white" ? c : 7 - c
            const cell = board[viewR][viewC]

            const isDark = (viewR + viewC) % 2 === 1

            const hidden =
              dragging?.row === viewR &&
              dragging?.col === viewC

            const isLegalTarget = legalTargets.some(
              ([tr, tc]) => tr === viewR && tc === viewC
            )

            const isSelected = !!selected && selected[0] === viewR && selected[1] === viewC

            return (
              <Square
                key={`${r}-${c}`}
                isDark={isDark}
                piece={hidden ? null : cell}
                isLegalTarget={isLegalTarget && (!!dragging || !!selected)}
                isSelected={isSelected}
                onPointerDown={(e) => onPointerDown(e, viewR, viewC, cell)}
                onPointerUp={() => onPointerUp(viewR, viewC)}
              />
            )
          })}
        </div>
      ))}

      {dragging && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: dragging.x,
            top: dragging.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <Piece piece={dragging.piece} color={dragging.color} />
        </div>
      )}

      {pendingPromotion && (
        <PromotionDialog
          color={playerColor}
          viewRow={orientation === "white" ? pendingPromotion.to[0] : 7 - pendingPromotion.to[0]}
          viewCol={orientation === "white" ? pendingPromotion.to[1] : 7 - pendingPromotion.to[1]}
          onSelect={resolvePromotion}
          onCancel={cancelPromotion}
        />
      )}
    </div>
  )
}
