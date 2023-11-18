"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-lg text-center">Select a channel to see chats.</p>
    </main>
  );
}
