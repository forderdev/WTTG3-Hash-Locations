(function initHelperCore(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.WTTG3_HELPER_CORE = api;
})(typeof globalThis !== "undefined" ? globalThis : window, () => {
  "use strict";

  function isSiteOpen(schedule, minute) {
    return schedule === null || (
      Array.isArray(schedule) &&
      minute >= schedule[0] &&
      minute <= schedule[1]
    );
  }

  function getNextChangeDelta(schedules, minute) {
    const boundaries = new Set();
    for (const schedule of schedules) {
      if (!Array.isArray(schedule)) continue;
      boundaries.add(schedule[0]);
      boundaries.add((schedule[1] + 1) % 60);
    }
    let delta = 60;
    for (const boundary of boundaries) {
      const distance = (boundary - minute + 60) % 60 || 60;
      delta = Math.min(delta, distance);
    }
    return delta;
  }

  function calculateMinerTotal(miners, selectedNames) {
    const selected = new Set(selectedNames);
    const chosen = miners.filter((miner) => selected.has(miner.name));
    return {
      total: chosen.reduce((sum, miner) => sum + (miner.rate ?? 0), 0),
      unknown: chosen.filter((miner) => miner.rate === null).length,
      count: chosen.length,
    };
  }

  function matchMinerNames(miners, importedNames) {
    const imported = new Set(importedNames.map(normalizeName));
    return miners
      .filter((miner) =>
        [miner.name, ...(miner.aliases ?? [])].some((name) =>
          imported.has(normalizeName(name)),
        ),
      )
      .map((miner) => miner.name);
  }

  function resolveIndexedHashes(value, keyCore, mappings, labels = {}) {
    const missingLabel = labels.missing ?? "no match";
    const conflictLabel = labels.conflict ?? "conflicting input";
    const parsed = keyCore.parseIndexedFragments(value);
    const encryptedEntries = parsed.entries.filter((entry) => entry.encrypted);
    const verified = new Map();
    for (const pair of mappings) {
      const index = Number(pair.index);
      const encrypted = keyCore.normalizeHex(pair.encrypted, keyCore.ENCRYPTED_LENGTH);
      const decrypted = keyCore.normalizeHex(pair.decrypted, keyCore.DECRYPTED_LENGTH);
      if (index >= 1 && index <= keyCore.SLOT_COUNT && encrypted && decrypted) {
        verified.set(index, { encrypted, decrypted });
      }
    }

    let matched = 0;
    const lines = encryptedEntries.map((entry) => {
      const mapping = verified.get(entry.index);
      if (mapping && mapping.encrypted === entry.encrypted) {
        matched += 1;
        return `${entry.index} - ${mapping.decrypted}`;
      }
      return `${entry.index} - ${missingLabel}`;
    });
    for (const conflict of parsed.conflicts) {
      lines.push(`${conflict.index} - ${conflictLabel}`);
    }

    return {
      lines,
      matched,
      total: encryptedEntries.length,
      conflicts: parsed.conflicts.length,
    };
  }

  function normalizeName(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  return Object.freeze({
    calculateMinerTotal,
    getNextChangeDelta,
    isSiteOpen,
    matchMinerNames,
    resolveIndexedHashes,
  });
});
