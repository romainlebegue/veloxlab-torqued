export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "var(--bg-warm)",
      }}
    >
      <div style={{ maxWidth: 560, textAlign: "center" }}>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            marginBottom: 16,
            color: "var(--ink)",
          }}
        >
          Torqued
        </h1>
        <p style={{ fontSize: 16, color: "var(--ink-mid)", marginBottom: 24 }}>
          Prototype in progress — search, fitment engine, and photo AI demo
          arriving shortly.
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-light)",
          }}
        >
          Sprint 0 · scaffolding
        </p>
      </div>
    </main>
  );
}
