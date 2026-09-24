import { useNavigate } from "react-router-dom"

const controls = [
  { time: 3, label: "Blitz", },
  { time: 5, label: "Blitz" },
  { time: 10, label: "Rapid" },
]

function Home() {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-[80rem] px-8 pb-24 pt-24">
      <div className="max-w-[52rem]">
        <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-neutral-400">
          Welcome to Knightly
        </p>

        <h1 className="text-[5rem] font-semibold leading-[0.95] tracking-[-0.04em]">
          Play chess.
          <br />
          <span className="text-neutral-400">Your way.</span>
        </h1>

        <p className="mt-8 max-w-[34rem] text-lg leading-8 text-neutral-500">
          Play ranked games against people around the world or practice
          against the computer.
        </p>
      </div>

      <div className="mt-16 grid max-w-[62rem] grid-cols-1 gap-4 md:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400">ONLINE</p>

              <h2 className="mt-2 text-2xl font-semibold">Play Ranked</h2>

              <p className="mt-2 text-sm text-neutral-500">
                Find an opponent and compete for your rating.
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
              ♟
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2">
            {controls.map(({ time, label }) => (
              <button
                onClick={() => {navigate(`/play?time=${time}`)}}
                key={time}
                className="rounded-xl border border-neutral-200 bg-white p-4 text-left transition hover:border-neutral-400 hover:shadow-sm"
              >
                <p className="text-lg font-semibold">{time} + 0</p>
                <p className="mt-1 text-xs text-neutral-400">{label}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate("/play/computer")}
          className="group flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6 text-left transition hover:border-neutral-400 hover:shadow-sm"
        >
          <div>
            <p className="text-sm font-medium text-neutral-400">OFFLINE</p>

            <h2 className="mt-2 text-2xl font-semibold">Play Computer</h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Practice your game against the computer.
            </p>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <span className="text-sm font-medium">Start game</span>

            <span className="text-lg text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900">
              →
            </span>
          </div>
        </button>
      </div>

      <div className="mt-20 border-t border-neutral-100 pt-8">
        <div className="flex items-center justify-between text-sm text-neutral-400">
          <span>Ready to play?</span>

          <button
            onClick={() => navigate("/puzzles")}
            className="transition hover:text-neutral-900"
          >
            Practice with puzzles →
          </button>
        </div>
      </div>
    </section>
  )
}

export default Home
