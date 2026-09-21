interface ClockProps {
  milliseconds: number
}

function Clock({ milliseconds }: ClockProps) {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60

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
