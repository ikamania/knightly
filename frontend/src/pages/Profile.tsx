import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getUserProfile, logout, type UserProfile } from "../api/auth"
import Loading from "./Loading"

function Profile() {
  const { username } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!username) {
      return
    }

    async function fetchUser() {
      if (!username) return

      try {
        const data = await getUserProfile(username)
        setUser(data)
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError("Failed to load profile")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [username])

  function handleLogout() {
    logout()
    navigate("/auth")
  }

  if (loading) return <Loading />

  if (error) return <Loading message={error} />

  return (
    <main className="min-h-screen px-[2rem] py-[1.5rem]">
      <div className="flex items-center gap-[1.5rem] absolute right-[2rem] top-[1.5rem]">
        <button
          onClick={() => navigate("/")}
        >
          Home
        </button>

        <button
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <h1 className="text-[2rem] font-semibold tracking-tight">
        {user?.username}
      </h1>

      <p className="mt-[0.1rem] text-neutral-500">
        {user?.email}
      </p>
    </main>
  )
}

export default Profile
