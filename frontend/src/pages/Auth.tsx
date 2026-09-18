import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthInput from "../components/auth/AuthInput"
import { useAuth } from "../auth/AuthContext"

function Auth() {
  const { loginUser, registerUser } = useAuth()
  const [isLogin, setIsLogin] = useState(true)

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      if (isLogin) {
        await loginUser({
          email,
          password
        })
      } else {
        await registerUser({
          username,
          email,
          password
        })
      }

      navigate("/")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
  }

  return (
    <main className="flex min-h-screen justify-center bg-white px-6 pt-[7rem]">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-3xl font-semibold">
          {isLogin ? "Welcome back" : "Create account"}
        </h1>

        <p className="mb-8 text-sm text-neutral-500">
          {isLogin
            ? "Sign in to continue."
            : "Create an account to continue."}
        </p>

        {error &&
          ( <p className="mb-4 text-sm text-red-500"> {error} </p> )
        }

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <AuthInput
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}

          <AuthInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <AuthInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="mt-4 w-full rounded-md bg-black py-3 text-white transition hover:opacity-90">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin)
            setError("")
          }}
          className="mt-6 text-sm text-neutral-500 hover:text-black"
        >
          {isLogin
            ? "Create an account"
            : "Already have an account?"}
        </button>
      </div>
    </main>
  )
}

export default Auth
