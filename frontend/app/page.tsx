import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Smart Task Manager</h1>

      <p>Manage your tasks smartly and efficiently.</p>

      <br />

      <Link href="/register">
        <button>Register</button>
      </Link>

      {" "}

      <Link href="/login">
        <button>Login</button>
      </Link>
    </main>
  );
}