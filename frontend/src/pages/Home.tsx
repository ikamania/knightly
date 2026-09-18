import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"
import { useState } from "react"
import PlayTimeButton from "../components/play/PlayTimeButton"

function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [showPlaytimes, setShowPlaytimes] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      <nav className="mx-auto flex max-w-[80rem] items-center justify-between px-[2rem] py-[1.5rem]">
        <button
          onClick={() => navigate("/")}
          className="text-[1.5rem] font-semibold tracking-tight"
        >
          Knightly
        </button>

        <div className="flex items-center gap-[2.5rem] text-[1rem]">
          <button onClick={() => navigate("/")}>
            Play
          </button>

          <button onClick={() => navigate("/puzzles")}>
            Puzzles
          </button>

          <button
            onClick={() => navigate(`/${user?.username}`)}
          >
            {user?.username}
          </button>
        </div>
      </nav>

      <section className="mx-auto flex max-w-[80rem] flex-col items-center gap-[5rem] px-[2rem] py-[8rem] lg:flex-row">
        <div className="max-w-[36rem]">
          <h1 className="text-[4.5rem] font-semibold tracking-tight">
            Play chess.
          </h1>

          <p className="text-[1.25rem] text-neutral-600">
            Simple, fast and beautiful.
          </p>

          <div className="mt-[2.5rem] flex items-center gap-[1rem]">
            <button
              onClick={() => setShowPlaytimes(prev => !prev)}
              className="
                w-[13rem] h-[3.5rem] rounded-[0.5rem] bg-black px-[2rem] py-[1rem] 
                text-[1.125rem] text-white flex items-center justify-center
              "
            >
              {showPlaytimes ? (
                <div className="flex gap-[0.4rem]">
                  <PlayTimeButton playtime={3} onSelect={() => setShowPlaytimes(false)} />
                  <PlayTimeButton playtime={5} onSelect={() => setShowPlaytimes(false)} />
                  <PlayTimeButton playtime={10} onSelect={() => setShowPlaytimes(false)} />
                </div>
              ) : ("Play Online")}
            </button>

            <button
              onClick={() => navigate("/play/computer")}
              className="
                rounded-[0.5rem] border border-neutral-300 flex items-center
                px-[2rem] py-[1rem] text-[1.125rem] h-[3.5rem]
              "
            >
              Play Computer
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
