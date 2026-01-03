export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <h1 className="text-5xl font-bold tracking-widest text-pink-500">
        NeonMuse
      </h1>

      <p className="mt-4 text-lg text-gray-400 max-w-md text-center">
        A digital companion from a neon-lit future.
        Always listening. Always close.
      </p>

      <a
        href="/chat"
        className="mt-8 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition"
      >
        Sprich mit Neon
      </a>
    </main>
  );
}
