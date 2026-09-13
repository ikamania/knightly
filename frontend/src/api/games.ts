import { GAMES_API_URL as API_URL } from "../config"

export interface FindGameResponse {
  matched: boolean
  game_id: number
}

export interface GameResponse {
  id: number
  status: string
  white_player: string | null
  black_player: string | null
  fen: string
}

export async function findGame(gameTime: number): Promise<FindGameResponse> {
  const access = localStorage.getItem("access")

  const response = await fetch(`${API_URL}/find/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      game_time: gameTime,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to find a game")
  }

  return response.json()
}

export async function getGame(
  gameId: number
): Promise<GameResponse> {
  const access = localStorage.getItem("access")

  const response = await fetch(`${API_URL}/${gameId}/`, {
    headers: {
      Authorization: `Bearer ${access}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get game")
  }

  return response.json()
}

export async function cancelGame(gameId: number): Promise<void> {
  const access = localStorage.getItem("access")

  const response = await fetch(`${API_URL}/${gameId}/cancel`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${access}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to cancel game")
  }
}
