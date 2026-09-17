import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Chess } from "chess.js"
import { createGameSocket } from "../websocket/gameSocket"
import type { ServerMessage, PromotionPiece, GameMessage } from "../websocket/gameSocket"
import ChessBoard from "../components/board/ChessBoard"
import { makeMove } from "../logic/move"
import { toSquare } from "../utils/coordinates"
import Loading from "./Loading"
import Clock from "../components/clock/Clock"

function Game() {
  const { id } = useParams()
  const navigate = useNavigate()

  const socketRef = useRef<ReturnType<typeof createGameSocket> | null>(null)
  const lastLocalMoveRef = useRef<string | null>(null)
  const prevFenRef = useRef<string | null>(null)

  const [game, setGame] = useState<Chess | null>(null)
  const [color, setColor] = useState<"white" | "black">("white")

  const [whiteTime, setWhiteTime] = useState(0)
  const [blackTime, setBlackTime] = useState(0)

  const [gameOver, setGameOver] = useState<{
    reason: string
    winner: "white" | "black" | null
  } | null>(null)

  const [drawOffer, setDrawOffer] = useState<
    "none" | "sent" | "received"
  >("none")

  useEffect(() => {
    if (!id) {
      navigate("/")
      return
    }

    const access = localStorage.getItem("access")

    if (!access) {
      navigate("/")
      return
    }

    const socket = createGameSocket(id, (data: ServerMessage) => {
      if (data.type === "game_state") {
        if (data.status !== "active") {
          navigate("/")
          return
        }

        setWhiteTime(data.white_time)
        setBlackTime(data.black_time)

        const chess = new Chess(data.fen)
        setGame(chess)
        setColor(data.color)
      }
      if (data.type === "move_made") {
        const signature = `${data.from}:${data.to}:${data.promotion ?? ""}`

        if (signature === lastLocalMoveRef.current) {
          lastLocalMoveRef.current = null
          prevFenRef.current = null
          return
        }

        setGame(prev => {
          if (!prev) return prev
          const next = new Chess(prev.fen())
          next.move({
            from: data.from,
            to: data.to,
            promotion: data.promotion ?? undefined,
          })
          return next
        })
      }
      if (data.type === "error") {
        if (lastLocalMoveRef.current) {
          lastLocalMoveRef.current = null

          const fen = prevFenRef.current
          prevFenRef.current = null

          if (fen) {
            setGame(new Chess(fen))
          }
        }
      }
      if (data.type === "draw_offer") {
        setDrawOffer("received")
      }
      if (data.type === "draw_declined") {
        setDrawOffer("none")
      }
      if (data.type === "game_over") {
        setGameOver({
          reason: data.reason,
          winner: data.winner ?? null,
        })

        setDrawOffer("none")
      }
    })

    socketRef.current = socket

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [id, navigate])

  const sendMove = useCallback(
    (
      from: [number, number],
      to: [number, number],
      promotion?: PromotionPiece,
    ) => {
      if (!game) return

      const fromSq = toSquare(from[0], from[1])
      const toSq = toSquare(to[0], to[1])

      const next = new Chess(game.fen())
      const move = makeMove(next, from, to, promotion)

      if (!move) return

      prevFenRef.current = game.fen()
      lastLocalMoveRef.current = `${fromSq}:${toSq}:${promotion ?? ""}`

      setGame(next)

      socketRef.current?.send({
        type: "move",
        from: fromSq,
        to: toSq,
        promotion,
      })
    },
    [game],
  )

  useEffect(() => {
    if (!game || gameOver) return

    const interval = setInterval(() => {
      if (game.turn() === "w") {
        setWhiteTime(time => {
          if (time <= 1) {
            sendMessage({ type: "timeout" })
            return 0
          }
          return time - 1
        })
      } else {
        setBlackTime(time => {
          if (time <= 1) {
            sendMessage({ type: "timeout" })
            return 0
          }
          return time - 1
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [game, gameOver])

  function sendMessage(message: GameMessage) {
    socketRef.current?.send(message)
  }

  function handleDraw() {
    if (drawOffer === "none") {
      sendMessage({ type: "draw" })
      setDrawOffer("sent")
    }
  }

  function respondToDraw(accepted: boolean) {
    socketRef.current?.send({
      type: "draw_response",
      accepted,
    })

    setDrawOffer("none")
  }

  const getGameOverMessage = () => {
    if (!gameOver) return

    switch (gameOver.reason) {
      case "draw":
        return "Draw";
      case "stalemate":
        return "Stalemate";
      case "checkmate":
        return gameOver.winner === color
          ? "WON BY CHECKMATE"
          : "LOST BY CHECKMATE"
      case "resignation":
        return gameOver.winner === color
          ? "Opponent resigned"
          : "You resigned"
      case "timeout":
        return gameOver.winner === color
        ? "You won on time"
        : "You lost on time"
      default:
        return "Game over"
    }
  }

  if (!game) {
    return <Loading message="Loading game..." />
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-[2rem]">
        <div className="relative flex flex-col items-center">
          <Clock seconds={color === "black" ? whiteTime : blackTime} />
          <ChessBoard
            game={game}
            playerColor={color === "white" ? "w" : "b"}
            orientation={color}
            onMove={sendMove}
          />
          <Clock seconds={color === "white" ? whiteTime : blackTime} />

          {gameOver && (
            <div className="absolute left-1/2 top-1/2 w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-200 bg-white p-[1.5rem] text-center shadow-lg">
              <p className="text-sm font-bold text-neutral-500">
                {getGameOverMessage()}
              </p>

              <button
                onClick={() => navigate("/")}
                className="mt-[1rem] w-full rounded-md bg-black px-[1rem] py-[0.5rem] text-sm text-white transition hover:opacity-90"
              >
                Home
              </button>
            </div>
          )}
        </div>

        <div className="flex w-[8rem] flex-col gap-[0.75rem]">
          {drawOffer === "received" ? (
            <div className="flex w-full overflow-hidden rounded-md border border-neutral-300">
              <button
                onClick={() => respondToDraw(true)}
                disabled={!!gameOver}
                className="flex-1 px-[0.5rem] py-[0.5rem] text-sm transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Accept draw"
              >
                ✓
              </button>

              <button
                onClick={() => respondToDraw(false)}
                disabled={!!gameOver}
                className="flex-1 border-l border-neutral-300 px-[0.5rem] py-[0.5rem] text-sm transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Decline draw"
              >
                x
              </button>
            </div>
          ) : (
            <button
              onClick={handleDraw}
              disabled={!!gameOver || drawOffer === "sent"}
              className="w-full rounded-md border border-neutral-300 px-[1rem] py-[0.5rem] text-sm transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {drawOffer === "sent" ? "Offered" : "Draw"}
            </button>
          )}

          <button
            onClick={() => sendMessage({ type: "resign" })}
            disabled={!!gameOver}
            className="w-full rounded-md bg-black px-[1rem] py-[0.5rem] text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Resign
          </button>
        </div>
      </div>
    </main>
  )
}

export default Game
