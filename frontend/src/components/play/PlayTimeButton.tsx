import { useNavigate } from "react-router-dom"

interface PlayTimeButtonProps {
  playtime: number
  onSelect?: () => void
}

function PlayTimeButton({ playtime, onSelect }: PlayTimeButtonProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => {
        navigate(`/play?time=${playtime}`)
        onSelect?.()
      }}
      className="
        rounded-md px-[0.2rem] text-[1rem] text-white underline transition hover:text-gray-200
      "
    >
      {playtime} m
    </button>
  )
}

export default PlayTimeButton
