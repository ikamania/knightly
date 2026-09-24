import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "../auth/ProtectedRoute"
import Home from "../pages/Home"
import Auth from "../pages/Auth"
import Profile from "../pages/Profile"
import Play from "../pages/Play"
import Game from "../pages/Game"
import Puzzles from "../pages/Puzzles"
import Layout from "../components/Layout"

function App() {
  return (
    <div>
      <Routes>
        <Route path="/auth" element={<Auth />}></Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/puzzles" element={<Puzzles />} />
            <Route path="/:username" element={<Profile />} />
          </Route>
          <Route path="/play" element={<Play />} />  
          <Route path="/game/:id" element={<Game />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
