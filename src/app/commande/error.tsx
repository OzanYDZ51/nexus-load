"use client";

export default function CommandeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center py-20">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-4 text-red-400">
        Erreur
      </h2>
      <p className="text-text-secondary mb-6 max-w-md mx-auto">
        {error.message || "Une erreur est survenue lors du traitement."}
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-gradient-to-br from-primary-cyan to-[#00b8d4] text-bg-deep rounded-lg font-bold cursor-pointer"
      >
        Réessayer
      </button>
    </div>
  );
}
