import { Link, NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Avatar", icon: "🏋️" },
  { to: "/achievements", label: "Trophies", icon: "🏆" },
  { to: "/history", label: "History", icon: "📜" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

export function RootLayout() {
  return (
    <div className="theme-overlay min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <header
        className="sticky top-0 z-20 border-b backdrop-blur"
        style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg) 88%, transparent)" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
            PR Tracker
          </Link>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        <div className="max-w-3xl mx-auto px-4 py-6 pb-28">
          <Outlet />
        </div>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 border-t z-20"
        style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg) 92%, transparent)", backdropFilter: "blur(6px)" }}
      >
        <div className="max-w-3xl mx-auto px-2 py-2 grid grid-cols-4 gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 rounded-lg text-xs transition ${
                  isActive ? "font-semibold" : "opacity-70 hover:opacity-100"
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "var(--accent)" : "var(--text)",
              })}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="mt-0.5">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
