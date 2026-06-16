export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to NexusRed</h1>
      <p className="mb-4 max-w-xl text-center">
        The ultimate Red‑Team platform — continuous autonomous simulations, raw evidence, and AI‑driven remediation.
      </p>
      <div className="flex space-x-4">
        <a href="/dashboard" className="px-4 py-2 bg-primary text-black rounded hover:bg-primary/80 transition">Dashboard</a>
        <a href="/exposure" className="px-4 py-2 bg-info text-black rounded hover:bg-info/80 transition">Exposure Intelligence</a>
        <a href="/simulations" className="px-4 py-2 bg-success text-black rounded hover:bg-success/80 transition">Run Simulation</a>
      </div>
    </div>
  );
}
