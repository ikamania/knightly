import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getCurrentUser, getUserProfile, type UserProfile } from "../api/auth"
import Loading from "./Loading"

function Profile() {
  const { username } = useParams()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const isOwnProfile = currentUser?.username === username

  useEffect(() => {
    async function fetchUsers() {
      if (!username) return

      try {
        const [profile, me] = await Promise.all([
            getUserProfile(username),
            getCurrentUser(),
        ])

        setUser(profile)
        setCurrentUser(me)
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

    fetchUsers()
  }, [username])

  if (loading) return <Loading />

  if (error) return <Loading message={error} />

  return (
    <section className="mx-auto max-w-[80rem] px-8 pb-24 pt-24">
      <div className="max-w-[52rem]">
        <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-neutral-400">
          Your account
        </p>

        <h1 className="text-[5rem] font-semibold leading-[0.95] tracking-[-0.04em]">
          {!isOwnProfile && user?.username}
          <span className="text-neutral-400">
            {isOwnProfile ? "Your account." : "'s profile."}
          </span>
        </h1>
      </div>

      <div className="flex gap-10 mt-15">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
            Username
          </p>
          <p className="mt-1 text-sm font-medium">
            {user?.username}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">
            Email
          </p>
          <p className="mt-1 text-sm font-medium">
            {user?.email}
          </p>
        </div>
      </div>
    </section>
  )
}

export default Profile
