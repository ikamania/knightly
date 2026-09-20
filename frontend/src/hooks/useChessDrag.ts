import { useRef, useState } from "react"
import type { Chess, Color, PieceSymbol } from "chess.js"
import { isLegalMove, getLegalMoves } from "../logic/rules"
import { fromSquare, toSquare } from "../utils/coordinates"
import type { PromotionPiece } from "../websocket/gameSocket"


type Dragging = {
  row: number
  col: number
  piece: PieceSymbol
  color: Color
  x: number
  y: number
} | null

type PendingPromotion = {
  from: [number, number]
  to: [number, number]
} | null


const CLICK_THRESHOLD = 5


export function useChessDrag(
  game: Chess,
  playerColor: Color,
  onMove: (
    from: [number, number],
    to: [number, number],
    promotion?: PromotionPiece,
  ) => void,
) {
  const [dragging, setDragging] = useState<Dragging>(null)
  const [legalTargets, setLegalTargets] = useState<[number, number][]>([])
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion>(null)
  const [selected, setSelected] = useState<[number, number] | null>(null)

  const pressPos = useRef({ x: 0, y: 0 })

  function isPromotionMove(
    from: [number, number],
    to: [number, number],
  ): boolean {
    const fromSq = toSquare(from[0], from[1])
    const toSq = toSquare(to[0], to[1])

    return game
      .moves({ square: fromSq, verbose: true })
      .some(m => m.to === toSq && m.promotion !== undefined)
  }

  function selectSquare(square: [number, number]) {
    setSelected(square)
    setLegalTargets(getLegalMoves(game, square).map(m => fromSquare(m)))
  }

  function clearSelection() {
    setSelected(null)
    setLegalTargets([])
  }

  function handleClick(row: number, col: number) {
    const square: [number, number] = [row, col]
    const cell = game.get(toSquare(row, col))

    if (selected && selected[0] === row && selected[1] === col) {
      clearSelection()
      return
    }

    const isOwnPiece = !!cell && cell.color === playerColor && cell.color === game.turn()

    if (isOwnPiece) {
      selectSquare(square)
      return
    }

    if (selected && isLegalMove(game, selected, square)) {
      if (isPromotionMove(selected, square)) {
        setPendingPromotion({ from: selected, to: square })
      } else {
        onMove(selected, square)
      }
      clearSelection()
      return
    }

    clearSelection()
  }

  function onPointerDown(
    e: React.PointerEvent,
    row: number,
    col: number,
    cell: { type: PieceSymbol; color: Color } | null,
  ) {
    pressPos.current = { x: e.clientX, y: e.clientY }

    if (!cell) return
    if (cell.color !== playerColor) return
    if (cell.color !== game.turn()) return

    setDragging({
      row,
      col,
      piece: cell.type,
      color: cell.color,
      x: e.clientX,
      y: e.clientY,
    })

    const targets = getLegalMoves(game, [row, col]).map(m => fromSquare(m))
    setLegalTargets(targets)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return

    setDragging({
      ...dragging,
      x: e.clientX,
      y: e.clientY,
    })
  }

  function onPointerUp(row: number, col: number) {
    const isClick =
      dragging &&
      Math.abs(dragging.x - pressPos.current.x) < CLICK_THRESHOLD &&
      Math.abs(dragging.y - pressPos.current.y) < CLICK_THRESHOLD

    if (isClick || !dragging) {
      setDragging(null)
      handleClick(row, col)
      return
    }

    const from: [number, number] = [dragging.row, dragging.col]
    const to: [number, number] = [row, col]

    if (isLegalMove(game, from, to)) {
      if (isPromotionMove(from, to)) {
        setPendingPromotion({ from, to })
      } else {
        onMove(from, to)
      }
    }

    setDragging(null)
    clearSelection()
  }

  function resolvePromotion(piece: PromotionPiece) {
    if (!pendingPromotion) return

    onMove(pendingPromotion.from, pendingPromotion.to, piece)
    setPendingPromotion(null)
  }

  function cancelPromotion() {
    setPendingPromotion(null)
  }

  function cancelDrag() {
    setDragging(null)
    clearSelection()
  }

  return {
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
  }
}
