import type { Color, PieceSymbol } from "chess.js"

const PIECES_ASSET_PATH = "/pieces/"

type Props = {
  piece: PieceSymbol
  color: Color
}

export default function Piece({ piece, color }: Props) {
  const name = color === "w" ? piece.toUpperCase() : piece
  return (
    <img src={`${PIECES_ASSET_PATH}${name}.png`} className="w-[var(--cell-size)] h-[var(--cell-size)] select-none cursor-grab" />
  )
}
