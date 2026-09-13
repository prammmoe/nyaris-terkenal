import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!key || !host) {
  if (process.env.NODE_ENV !== "production") {
    const missingVariable = !key
      ? "NEXT_PUBLIC_POSTHOG_KEY"
      : "NEXT_PUBLIC_POSTHOG_HOST";
    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    );
  }
} else {
  posthog.init(key, {
    api_host: host,
    autocapture: false,
    capture_exceptions: true,
    capture_pageleave: true,
    capture_pageview: true,
    disable_session_recording: true,
    disable_surveys: true,
    disable_web_experiments: true,
    opt_out_capturing_by_default: true,
    person_profiles: "identified_only",
  });
}
