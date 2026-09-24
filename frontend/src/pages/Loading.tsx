type Props = {
  message?: string
}

function Loading({ message = "Loading..."}: Props) {
  return (
    <main className="flex min-h-screen justify-center text-center mt-[30%]">
      <h1 className="text-[2rem] text-red-700">
        {message}
      </h1>
    </main>
  )
}

export default Loading
