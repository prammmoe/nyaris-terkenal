"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

const consentKey = "nyaris-terkenal-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    const consent = localStorage.getItem(consentKey);
    if (consent === "accepted") {
      posthog.opt_in_capturing();
      posthog.capture("$pageview", { $current_url: window.location.href });
    } else if (consent === "rejected") posthog.opt_out_capturing();
    else setVisible(true);
  }, []);

  const choose = (allowed: boolean) => {
    localStorage.setItem(consentKey, allowed ? "accepted" : "rejected");
    if (allowed) {
      posthog.opt_in_capturing();
      posthog.capture("$pageview", { $current_url: window.location.href });
    } else posthog.opt_out_capturing();
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <section className="cookie-consent" role="dialog" aria-label="Pilihan cookie">
      <div>
        <strong>Kami menggunakan cookie</strong>
        <p>
          Cookie analytics membantu kami memahami penggunaan dan memperbaiki
          permainan. Baca <Link href="/privacy">Kebijakan Privasi</Link>.
        </p>
      </div>
      <div className="cookie-actions">
        <button className="secondary" onClick={() => choose(false)}>
          Tolak
        </button>
        <button className="primary" onClick={() => choose(true)}>
          Izinkan analytics
        </button>
      </div>
    </section>
  );
}
