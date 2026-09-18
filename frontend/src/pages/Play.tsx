import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { findGame, cancelGame } from "../api/games"
import { createMatchmakingSocket } from "../websocket/matchmakingSocket"
import Loading from "./Loading"

function Play() {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const rawTime = Number(searchParams.get("time"))
  const playtime = Number.isFinite(rawTime) && rawTime > 0 ? rawTime : 10

  const [gameId, setGameId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [cancelling, setCancelling] = useState(false)

  const socketRef = useRef<ReturnType<typeof createMatchmakingSocket> | null>(null)

  useEffect(() => {
    const socket = createMatchmakingSocket(
      async () => {
        try {
          const data = await findGame(playtime)

          setGameId(data.game_id)

          if (data.matched) {
            navigate(`/game/${data.game_id}`)
          }
        } catch (error) {
          setError(error instanceof Error ? error.message: "Failed to find a game")
        }
      },

      (data) => {
        if (data.type === "matched") {
          navigate(`/game/${data.game_id}`)
        }
      },

      () => {
        setError("Matchmaking connection failed")
      }
    )

    socketRef.current = socket

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [navigate, playtime])

  async function handleCancel() {
    if (!gameId || cancelling) {
      return
    }

    setCancelling(true)

    try {
      await cancelGame(gameId)

      socketRef.current?.close()
      socketRef.current = null

      navigate("/")
    } catch (error) {
      console.error("Failed to cancel game:", error)
      setCancelling(false)
    }
  }

  if (error) {
    return <Loading message={error} />
  }

  if (!gameId) {
    return <Loading message="Finding opponent..." />
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-[2rem] font-semibold">
          Finding opponent...
        </h1>

        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-[1.5rem] rounded-md border border-neutral-300 px-[1rem] py-[0.5rem] text-sm transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cancelling ? "Cancelling..." : "Cancel"}
        </button>
      </div>
    </main>
  )
}

export default Play
