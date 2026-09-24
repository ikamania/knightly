import Navbar from "./Navbar"
import { Outlet } from "react-router-dom"

function Layout() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 lg:h-screen lg:overflow-hidden">
      <Navbar />

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
