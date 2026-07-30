(function attachKeyOrganizerCore(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.WTTG3_KEY_ORGANIZER_CORE = api;
})(typeof globalThis !== "undefined" ? globalThis : window, () => {
  "use strict";

  const SLOT_COUNT = 8;
  const ENCRYPTED_LENGTH = 8;
  const DECRYPTED_LENGTH = 4;

  function createEmptyState() {
    return Array.from({ length: SLOT_COUNT }, () => ({
      encrypted: "",
      decrypted: "",
      wiki: null,
    }));
  }

  function normalizeHex(value, length) {
    const normalized = String(value ?? "").trim().toLocaleLowerCase("en-US");
    return new RegExp(`^[0-9a-f]{${length}}$`, "u").test(normalized)
      ? normalized
      : "";
  }

  function parseSingleHex(value, length) {
    const text = String(value ?? "").trim();
    if (!text) return { status: "empty", value: "" };

    const matches = [
      ...text.matchAll(
        new RegExp(
          `(?:^|[^0-9a-f])([0-9a-f]{${length}})(?![0-9a-f])`,
          "giu",
        ),
      ),
    ].map((match) => match[1].toLocaleLowerCase("en-US"));
    const uniqueMatches = [...new Set(matches)];

    if (uniqueMatches.length === 1) {
      return { status: "valid", value: uniqueMatches[0] };
    }

    return {
      status: uniqueMatches.length > 1 ? "ambiguous" : "invalid",
      value: "",
    };
  }

  function parseIndexedFragments(value) {
    const text = String(value ?? "");
    const parsed = new Map();
    const conflicts = [];
    const pattern =
      /(?:^|[^0-9a-f])(?:key\s*)?([1-8])\s*[-:]\s*([0-9a-f]{8}|[0-9a-f]{4})(?![0-9a-f])/giu;

    for (const match of text.matchAll(pattern)) {
      const index = Number(match[1]);
      const fragment = match[2].toLocaleLowerCase("en-US");
      const type =
        fragment.length === ENCRYPTED_LENGTH ? "encrypted" : "decrypted";
      const entry = parsed.get(index) ?? {
        index,
        encrypted: "",
        decrypted: "",
      };

      if (entry[type] && entry[type] !== fragment) {
        conflicts.push({ index, type });
        entry[type] = "";
      } else if (!conflicts.some((conflict) =>
        conflict.index === index && conflict.type === type
      )) {
        entry[type] = fragment;
      }

      parsed.set(index, entry);
    }

    return {
      entries: [...parsed.values()]
        .filter((entry) => entry.encrypted || entry.decrypted)
        .sort((left, right) => left.index - right.index),
      conflicts,
    };
  }

  function sanitizeState(value) {
    const sanitized = createEmptyState();
    if (!Array.isArray(value)) return sanitized;

    for (let index = 0; index < SLOT_COUNT; index += 1) {
      const entry = value[index] ?? {};
      sanitized[index] = {
        encrypted: normalizeHex(entry.encrypted, ENCRYPTED_LENGTH),
        decrypted: normalizeHex(entry.decrypted, DECRYPTED_LENGTH),
        wiki: [1, 2, 3].includes(Number(entry.wiki))
          ? Number(entry.wiki)
          : null,
      };
    }

    return sanitized;
  }

  function getProgress(state) {
    const sanitized = sanitizeState(state);
    return {
      found: sanitized.filter((entry) => entry.encrypted).length,
      decrypted: sanitized.filter((entry) => entry.decrypted).length,
    };
  }

  function getMasterKey(state) {
    const sanitized = sanitizeState(state);
    return sanitized.every((entry) => entry.decrypted)
      ? sanitized.map((entry) => entry.decrypted).join("")
      : "";
  }

  function getMasterPreview(state) {
    const sanitized = sanitizeState(state);
    const complete = getMasterKey(sanitized);
    return complete ||
      sanitized.map((entry) => entry.decrypted || "____").join(" ");
  }

  return Object.freeze({
    SLOT_COUNT,
    ENCRYPTED_LENGTH,
    DECRYPTED_LENGTH,
    createEmptyState,
    getMasterKey,
    getMasterPreview,
    getProgress,
    normalizeHex,
    parseIndexedFragments,
    parseSingleHex,
    sanitizeState,
  });
});
