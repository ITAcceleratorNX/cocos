/** Served via middleware rewrite to /landing/index.html. Fallback if rewrite misses. */
export default function HomeFallback() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <p>
        <a href="/landing/index.html">Открыть витрину CoCo’s</a>
      </p>
    </main>
  );
}
