import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">403</h1>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block underline">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
