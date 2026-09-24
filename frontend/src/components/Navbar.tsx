import { useAuth } from "../auth/AuthContext"
import { useLocation, useNavigate } from "react-router-dom"

function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="mx-auto flex max-w-[80rem] items-center justify-between px-8 py-6">
      <button
        onClick={() => navigate("/")}
        className="text-2xl font-semibold tracking-tight"
      >
        Knightly
      </button>

      <div className="flex items-center gap-8 text-sm font-medium">
        <button
          onClick={() => navigate("/")}
          className={
            isActive("/")
              ? "text-neutral-900"
              : "text-neutral-500 transition hover:text-neutral-900"
          }
        >
          Play
        </button>

        <button
          onClick={() => navigate("/puzzles")}
          className={
            isActive("/puzzles")
              ? "text-neutral-900"
              : "text-neutral-500 transition hover:text-neutral-900"
          }
        >
          Puzzles
        </button>

        <button
          onClick={() => navigate(`/${user?.username}`)}
          className="rounded-lg border border-neutral-200 px-4 py-2 transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          {user?.username}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
