import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    autocapture: false,
    capture_exceptions: true,
    capture_pageleave: true,
    capture_pageview: true,
    disable_session_recording: true,
    disable_surveys: true,
    disable_web_experiments: true,
    person_profiles: "identified_only",
  });
}
