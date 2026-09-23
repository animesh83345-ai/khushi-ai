/*
=========================================
KHUSHI COMMAND ENGINE
=========================================

This file handles safe browser commands.

It does NOT execute arbitrary Windows
commands.
*/

export function handleCommand(input) {

  const text =
    String(input || "").trim();

  const lower =
    text.toLowerCase();

  if (!text) {
    return {
      handled: false
    };
  }

  /*
  =========================
  YOUTUBE
  =========================
  */

  if (
    lower === "youtube" ||
    /youtube.*(khol|open|chala)/i.test(text)
  ) {
    return {
      handled: true,
      action: "open",
      label: "Open YouTube",
      url: "https://www.youtube.com"
    };
  }

  /*
  =========================
  GOOGLE
  =========================
  */

  if (
    lower === "google" ||
    /google.*(khol|open|chala)/i.test(text)
  ) {
    return {
      handled: true,
      action: "open",
      label: "Open Google",
      url: "https://www.google.com"
    };
  }

  /*
  =========================
  GITHUB
  =========================
  */

  if (
    lower === "github" ||
    /github.*(khol|open|chala)/i.test(text)
  ) {
    return {
      handled: true,
      action: "open",
      label: "Open GitHub",
      url: "https://github.com"
    };
  }

  /*
  =========================
  GOOGLE SEARCH
  =========================
  */

  const googleSearch =
    text.match(
      /google.*(?:search|par search|me search)\s*(.*)/i
    );

  if (
    googleSearch &&
    googleSearch[1]
  ) {
    const query =
      googleSearch[1].trim();

    if (query) {
      return {
        handled: true,
        action: "open",

        label:
          `Search Google: ${query}`,

        url:
          `https://www.google.com/search?q=${encodeURIComponent(
            query
          )}`
      };
    }
  }

  /*
  =========================
  YOUTUBE SEARCH
  =========================
  */

  const youtubeSearch =
    text.match(
      /youtube.*(?:search|par search)\s*(.*)/i
    );

  if (
    youtubeSearch &&
    youtubeSearch[1]
  ) {
    const query =
      youtubeSearch[1].trim();

    if (query) {
      return {
        handled: true,
        action: "open",

        label:
          `Search YouTube: ${query}`,

        url:
          `https://www.youtube.com/results?search_query=${encodeURIComponent(
            query
          )}`
      };
    }
  }

  /*
  =========================
  CALCULATOR
  =========================
  */

  if (
    /calculator|calculate|hisab|गणना/i.test(
      text
    )
  ) {
    return {
      handled: true,
      action: "open",

      label:
        "Open Calculator",

      url:
        "https://www.google.com/search?q=calculator"
    };
  }

  /*
  =========================
  TIME
  =========================
  */

  if (
    /time|samay|समय/i.test(text)
  ) {
    return {
      handled: true,
      action: "time",
      label: "Current time"
    };
  }

  /*
  =========================
  NO COMMAND
  =========================
  */

  return {
    handled: false
  };
}
