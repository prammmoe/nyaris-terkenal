"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    posthog.captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <main>
          <h1>Terjadi kesalahan</h1>
          <p>Silakan coba lagi.</p>
          <button type="button" onClick={reset}>
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}
