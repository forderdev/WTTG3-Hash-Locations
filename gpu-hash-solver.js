(function initGpuHashSolver(root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.WTTG3_GPU_HASH_SOLVER = api;
})(typeof globalThis !== "undefined" ? globalThis : window, (root) => {
  "use strict";

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  const SLOT_COUNT = 8;
  const WORKGROUP_SIZE = 256;
  const MAX_RESULTS = 64;
  const STATE_COUNT = 0x100000000;
  const MD5_CONSTANTS = Array.from({ length: 64 }, (_, index) =>
    Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000) >>> 0,
  );
  const MD5_SHIFTS = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const LENGTH_SCALE = floatFromBits(0x38c00180);
  const CHARACTER_SCALE = floatFromBits(0x38000100);

  function isSupported() {
    return Boolean(root.navigator?.gpu);
  }

  function nextRand(holder) {
    holder.state = (Math.imul(holder.state, 214013) + 2531011) >>> 0;
    return (holder.state >>> 16) & 0x7fff;
  }

  function generateString(holder) {
    const lengthRoll = nextRand(holder);
    const length = 6 + Math.min(
      2,
      Math.trunc(Math.fround(Math.fround(lengthRoll) * LENGTH_SCALE)),
    );
    let value = "";
    for (let index = 0; index < length; index += 1) {
      const random = nextRand(holder);
      const normalized = Math.fround(Math.fround(random) * CHARACTER_SCALE);
      const scaled = Math.fround(normalized * Math.fround(62));
      const alphabetIndex = Math.min(61, Math.trunc(scaled));
      value += ALPHABET[alphabetIndex];
    }
    return value;
  }

  function md5Prefix(value) {
    const words = new Uint32Array(16);
    for (let index = 0; index < value.length; index += 1) {
      words[index >>> 2] |= value.charCodeAt(index) << ((index & 3) * 8);
    }
    words[value.length >>> 2] |= 0x80 << ((value.length & 3) * 8);
    words[14] = value.length * 8;

    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;
    for (let index = 0; index < 64; index += 1) {
      let f;
      let g;
      if (index < 16) {
        f = (b & c) | (~b & d);
        g = index;
      } else if (index < 32) {
        f = (d & b) | (~d & c);
        g = (5 * index + 1) & 15;
      } else if (index < 48) {
        f = b ^ c ^ d;
        g = (3 * index + 5) & 15;
      } else {
        f = c ^ (b | ~d);
        g = (7 * index) & 15;
      }
      const previousD = d;
      d = c;
      c = b;
      b = (b + rotateLeft((a + f + MD5_CONSTANTS[index] + words[g]) >>> 0, MD5_SHIFTS[index])) >>> 0;
      a = previousD;
    }

    const word = (a + 0x67452301) >>> 0;
    return [word & 255, (word >>> 8) & 255, (word >>> 16) & 255, word >>> 24]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function simulateRun(initialState) {
    const holder = { state: initialState >>> 0 };
    const pairs = [];
    for (let index = 1; index <= SLOT_COUNT; index += 1) {
      const encrypted = md5Prefix(generateString(holder));
      const decrypted = md5Prefix(generateString(holder)).slice(0, 4);
      pairs.push({ index, encrypted, decrypted });
    }
    return pairs;
  }

  async function solve(entries, options = {}) {
    if (!isSupported()) throw createError("unsupported", "WebGPU is unavailable.");
    const expected = normalizeEntries(entries);
    const first = expected.get(1);
    if (!first) throw createError("first-required", "Hash 1 is required.");
    if (expected.size < 2) throw createError("more-required", "At least two hashes are required.");
    throwIfAborted(options.signal);

    const adapter = await root.navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
    if (!adapter) throw createError("unsupported", "No WebGPU adapter is available.");
    const device = await adapter.requestDevice();
    if (device.limits.maxComputeInvocationsPerWorkgroup < WORKGROUP_SIZE) {
      device.destroy?.();
      throw createError("unsupported", "The GPU workgroup limit is too low.");
    }

    const module = device.createShaderModule({ code: buildShader() });
    const compilation = await module.getCompilationInfo();
    const shaderErrors = compilation.messages.filter((message) => message.type === "error");
    if (shaderErrors.length) {
      device.destroy?.();
      throw createError("shader", shaderErrors.map((message) => message.message).join("\n"));
    }

    const pipeline = device.createComputePipeline({
      layout: "auto",
      compute: { module, entryPoint: "main" },
    });
    const paramsBuffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const resultsBuffer = device.createBuffer({
      size: (MAX_RESULTS + 1) * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: paramsBuffer } },
        { binding: 1, resource: { buffer: resultsBuffer } },
      ],
    });

    try {
      device.queue.writeBuffer(resultsBuffer, 0, new Uint32Array(MAX_RESULTS + 1));
      const maxGroups = Math.min(65535, device.limits.maxComputeWorkgroupsPerDimension);
      const batchSize = maxGroups * WORKGROUP_SIZE;
      const batches = Math.ceil(STATE_COUNT / batchSize);
      const target = prefixToWord(first);
      const started = now();

      for (let batch = 0; batch < batches; batch += 1) {
        throwIfAborted(options.signal);
        const processed = batch * batchSize;
        const count = Math.min(batchSize, STATE_COUNT - processed);
        device.queue.writeBuffer(paramsBuffer, 0, new Uint32Array([
          processed >>> 0,
          count,
          target,
          0,
        ]));
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginComputePass();
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(count / WORKGROUP_SIZE));
        pass.end();
        device.queue.submit([encoder.finish()]);
        await device.queue.onSubmittedWorkDone();
        options.onProgress?.({
          batch: batch + 1,
          batches,
          percent: (batch + 1) / batches * 100,
          elapsedMs: now() - started,
        });
      }

      const candidates = await readCandidates(device, resultsBuffer);
      if (candidates.overflow) throw createError("overflow", "Too many PRNG candidates were found.");
      const verified = dedupeRuns(
        candidates.states
          .map((state) => simulateRun(state))
          .filter((pairs) => [...expected].every(([index, encrypted]) =>
            pairs[index - 1]?.encrypted === encrypted,
          )),
      );
      if (!verified.length) throw createError("no-solution", "No PRNG state matched the supplied hashes.");
      if (verified.length > 1) throw createError("ambiguous", "More hashes are required to select one run.");
      return {
        pairs: verified[0],
        candidates: candidates.states.length,
        elapsedMs: now() - started,
      };
    } finally {
      paramsBuffer.destroy();
      resultsBuffer.destroy();
      device.destroy?.();
    }
  }

  function buildShader() {
    return `
      struct Params { base: u32, count: u32, target_hash: u32, padding: u32 }
      struct Results { count: atomic<u32>, states: array<u32, ${MAX_RESULTS}> }
      @group(0) @binding(0) var<uniform> params: Params;
      @group(0) @binding(1) var<storage, read_write> results: Results;
      const K: array<u32, 64> = array<u32, 64>(${MD5_CONSTANTS.map((value) => `${value}u`).join(",")});
      const S: array<u32, 64> = array<u32, 64>(${MD5_SHIFTS.map((value) => `${value}u`).join(",")});

      fn next_rand(state: ptr<function, u32>) -> u32 {
        *state = *state * 214013u + 2531011u;
        return (*state >> 16u) & 0x7fffu;
      }

      fn alphabet(index: u32) -> u32 {
        if (index < 26u) { return 65u + index; }
        if (index < 52u) { return 97u + index - 26u; }
        if (index < 61u) { return 49u + index - 52u; }
        return 48u;
      }

      fn rotl(value: u32, count: u32) -> u32 {
        return (value << count) | (value >> (32u - count));
      }

      fn md5_first(words: ptr<function, array<u32, 16>>) -> u32 {
        var a = 0x67452301u;
        var b = 0xefcdab89u;
        var c = 0x98badcfeu;
        var d = 0x10325476u;
        for (var index = 0u; index < 64u; index += 1u) {
          var f: u32;
          var g: u32;
          if (index < 16u) {
            f = (b & c) | ((~b) & d);
            g = index;
          } else if (index < 32u) {
            f = (d & b) | ((~d) & c);
            g = (5u * index + 1u) & 15u;
          } else if (index < 48u) {
            f = b ^ c ^ d;
            g = (3u * index + 5u) & 15u;
          } else {
            f = c ^ (b | (~d));
            g = (7u * index) & 15u;
          }
          let previous_d = d;
          d = c;
          c = b;
          b = b + rotl(a + f + K[index] + (*words)[g], S[index]);
          a = previous_d;
        }
        return a + 0x67452301u;
      }

      @compute @workgroup_size(${WORKGROUP_SIZE})
      fn main(@builtin(global_invocation_id) id: vec3<u32>) {
        if (id.x >= params.count) { return; }
        let initial_state = params.base + id.x;
        var state = initial_state;
        let length_roll = next_rand(&state);
        let length = 6u + min(2u, u32(f32(length_roll) * bitcast<f32>(0x38c00180u)));
        var words: array<u32, 16>;
        for (var index = 0u; index < length; index += 1u) {
          let random = next_rand(&state);
          let scaled = f32(random) * bitcast<f32>(0x38000100u) * 62.0;
          let character = alphabet(min(61u, u32(scaled)));
          words[index >> 2u] |= character << ((index & 3u) * 8u);
        }
        words[length >> 2u] |= 0x80u << ((length & 3u) * 8u);
        words[14] = length * 8u;
        if (md5_first(&words) == params.target_hash) {
          let slot = atomicAdd(&results.count, 1u);
          if (slot < ${MAX_RESULTS}u) { results.states[slot] = initial_state; }
        }
      }
    `;
  }

  async function readCandidates(device, resultsBuffer) {
    const size = (MAX_RESULTS + 1) * 4;
    const readBuffer = device.createBuffer({
      size,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    const encoder = device.createCommandEncoder();
    encoder.copyBufferToBuffer(resultsBuffer, 0, readBuffer, 0, size);
    device.queue.submit([encoder.finish()]);
    await readBuffer.mapAsync(GPUMapMode.READ);
    const values = new Uint32Array(readBuffer.getMappedRange().slice(0));
    readBuffer.unmap();
    readBuffer.destroy();
    const count = values[0];
    return {
      overflow: count > MAX_RESULTS,
      states: [...values.slice(1, 1 + Math.min(count, MAX_RESULTS))],
    };
  }

  function normalizeEntries(entries) {
    const normalized = new Map();
    for (const entry of entries ?? []) {
      const index = Number(entry.index);
      const encrypted = String(entry.encrypted ?? "").trim().toLowerCase();
      if (index >= 1 && index <= SLOT_COUNT && /^[0-9a-f]{8}$/.test(encrypted)) {
        normalized.set(index, encrypted);
      }
    }
    return normalized;
  }

  function dedupeRuns(runs) {
    return [...new Map(runs.map((pairs) => [
      pairs.map((pair) => `${pair.encrypted}:${pair.decrypted}`).join("|"),
      pairs,
    ])).values()];
  }

  function prefixToWord(prefix) {
    const bytes = prefix.match(/../g).map((part) => Number.parseInt(part, 16));
    return (bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24)) >>> 0;
  }

  function rotateLeft(value, count) {
    return ((value << count) | (value >>> (32 - count))) >>> 0;
  }

  function floatFromBits(bits) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, bits, true);
    return view.getFloat32(0, true);
  }

  function now() {
    return root.performance?.now?.() ?? Date.now();
  }

  function throwIfAborted(signal) {
    if (!signal?.aborted) return;
    throw createError("aborted", "The GPU search was cancelled.");
  }

  function createError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  return Object.freeze({
    isSupported,
    md5Prefix,
    simulateRun,
    solve,
  });
});
