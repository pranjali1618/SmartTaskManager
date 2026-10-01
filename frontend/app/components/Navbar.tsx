import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      style={{
        padding: "15px 30px",
        background: "#2563eb",
        display: "flex",
        gap: "20px",
      }}
    >
      <Link href="/" style={{ color: "white" }}>
        Home
      </Link>

      <Link href="/register" style={{ color: "white" }}>
        Register
      </Link>

      <Link href="/login" style={{ color: "white" }}>
        Login
      </Link>

      <Link href="/dashboard" style={{ color: "white" }}>
        Dashboard
      </Link>
    </nav>
  );
}