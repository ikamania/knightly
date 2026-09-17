import { GAME_WS_URL } from "../config"

export type PromotionPiece = "q" | "r" | "b" | "n"

export type GameMessage =
  | {
      type: "resign"
    }
  | {
      type: "draw"
    }
  |
    {
      type: "timeout"
    }
  |
    {
      type: "draw_response"
      accepted: boolean
    }
  | {
      type: "move"
      from: string
      to: string
      promotion?: PromotionPiece
    }

export type ServerMessage =
  | {
      type: "game_state"
      game_id: string
      fen: string
      color: "white" | "black"
      status: string
      white_time: number
      black_time: number
    }
  | {
      type: "move_made"
      from: string
      to: string
      promotion?: PromotionPiece | null
    }
  | {
      type: "opponent_move"
      from: string
      to: string
      promotion?: PromotionPiece | null
    }
  | {
      type: "draw_offer"
    }
  | {
      type: "draw_declined"
    }
  | {
      type: "game_over"
      reason: string
      winner: "white" | "black" | null
    }
  | {
      type: "error"
      message: string
    }

export function createGameSocket(
  gameId: string,
  onMessage: (data: any) => void
) {
  const access = localStorage.getItem("access")

  const socket = new WebSocket(
    `${GAME_WS_URL}/${gameId}/?token=${encodeURIComponent(access ?? "")}`
  )

  let closed = false

  socket.onmessage = (event) => {
    onMessage(JSON.parse(event.data))
  }

  socket.onclose = () => {
    closed = true
  }

  return {
    send(message: GameMessage) {
      if (!closed && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message))
      }
    },
    close() {
      closed = true
      socket.close()
    },
  }
}
