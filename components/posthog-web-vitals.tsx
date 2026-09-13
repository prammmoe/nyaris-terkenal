"use client";

import posthog from "posthog-js";
import { useReportWebVitals } from "next/web-vitals";

export default function PostHogWebVitals() {
  useReportWebVitals((metric) => posthog.capture("$web_vitals", metric));
  return null;
}
