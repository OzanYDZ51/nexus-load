"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          background: "#0a0a1e",
          color: "#e8ecff",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Une erreur est survenue
          </h2>
          <p style={{ color: "#8892b0", marginBottom: "1.5rem" }}>
            {error.message || "Erreur inattendue"}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 2rem",
              background: "linear-gradient(135deg, #00f0ff, #00b8d4)",
              color: "#0a0a1e",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
