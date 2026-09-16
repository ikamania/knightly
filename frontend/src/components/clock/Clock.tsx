interface ClockProps {
  seconds: number
}

function Clock({ seconds }: ClockProps) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  const time = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`

  return (
    <div className="my-[0.75rem] flex">
      <div className="rounded-md border border-neutral-200 bg-white px-[1rem] py-[0.5rem] font-mono text-lg font-bold text-neutral-800">
        {time}
      </div>
    </div>
  )
}

export default Clock
