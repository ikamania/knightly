import Navbar from "./Navbar"
import { Outlet } from "react-router-dom"

function Layout() {
  return (
    <div className="h-screen overflow-hidden bg-white text-neutral-900">
      <Navbar />

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
