import Piece from "./Piece"
import type { Piece as PieceType } from "chess.js"


type Props = {
  isDark: boolean
  piece: PieceType | null
  onPointerDown: (e: React.PointerEvent) => void
  onPointerUp: () => void
  isLegalTarget: boolean
  isSelected: boolean
}


export default function Square({ isDark, piece, onPointerDown, onPointerUp, isLegalTarget, isSelected }: Props) {
  return (
    <div
      onPointerUp={onPointerUp}
      onPointerDown={onPointerDown}
      className={`touch-none w-[var(--cell-size)] h-[var(--cell-size)] flex items-center justify-center relative ${
        isDark ? "bg-[#739552]" : "bg-[#ebecd0]"
      } ${isSelected ? "ring-2 ring-inset ring-yellow-400" : ""}`}
    >
      {piece && <Piece piece={piece.type} color={piece.color} />}

      {isLegalTarget && (
        <div className="absolute w-3 h-3 rounded-full bg-black/20" />
      )}
    </div>
  )
}
