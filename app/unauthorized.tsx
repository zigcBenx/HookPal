import Link from "next/link";

export default function Unauthorized() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">401</h1>
        <p className="mt-2 text-muted-foreground">
          Please log in to access this page.
        </p>
        <Link href="/login" className="mt-6 inline-block underline">
          Go to Login
        </Link>
      </div>
    </main>
  );
}
