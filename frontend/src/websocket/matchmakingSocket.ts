import { MATCHMAKING_WS_URL } from "../config"
import type { ServerMessage } from "./gameSocket"

export function createMatchmakingSocket(
  onOpen: () => void,
  onMessage: (data: ServerMessage) => void,
  onError?: () => void
) {
  const access = localStorage.getItem("access")

  const socket = new WebSocket(
    `${MATCHMAKING_WS_URL}/?token=${encodeURIComponent(access ?? "")}`
  )

  let connected = false
  let closed = false

  socket.onopen = () => {
    connected = true
    onOpen()
  }

  socket.onmessage = (event) => {
    onMessage(JSON.parse(event.data) as ServerMessage)
  }

  socket.onerror = () => {
    if (!connected && !closed) {
      onError?.()
    }
  }

  socket.onclose = () => {
    closed = true
  }

  return {
    close() {
      closed = true
      socket.close()
    },
  }
}
