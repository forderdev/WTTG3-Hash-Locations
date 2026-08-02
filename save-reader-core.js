(function initSaveReader(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.WTTG3_SAVE_READER = api;
})(typeof globalThis !== "undefined" ? globalThis : window, () => {
  "use strict";

  const MAX_FILE_SIZE = 64 * 1024 * 1024;
  const MAX_COLLECTION_ITEMS = 2_000_000;

  function parseSave(source, fileName = "WTTGSD_SaveGame.sav") {
    const bytes =
      source instanceof Uint8Array ? source.slice() : new Uint8Array(source);
    if (!bytes.length || bytes.length > MAX_FILE_SIZE) {
      throw new Error("Save file size is outside the supported range.");
    }

    const reader = new BinaryReader(bytes);
    if (reader.readAscii(4) !== "GVAS") {
      throw new Error("The selected file is not an Unreal Engine GVAS save.");
    }

    const saveGameFileVersion = reader.readInt32();
    const packageFileVersionUE4 = reader.readInt32();
    const packageFileVersionUE5 =
      saveGameFileVersion >= 3 ? reader.readInt32() : 0;
    const engineVersion = {
      major: reader.readUInt16(),
      minor: reader.readUInt16(),
      patch: reader.readUInt16(),
      changelist: reader.readUInt32(),
      branch: reader.readFString().value,
    };
    const customVersionFormat = reader.readInt32();
    const customVersionCount = reader.readInt32();
    assertCollectionCount(customVersionCount, "custom version");
    for (let index = 0; index < customVersionCount; index += 1) {
      reader.skip(16);
      reader.readInt32();
    }

    const saveGameClassName = reader.readFString().value;
    const rootDataFlags = reader.readUInt8();
    if (packageFileVersionUE5 < 1017) {
      throw new Error("This reader expects the WTTG3 UE5.6 save format.");
    }
    if (!saveGameClassName.endsWith(".WTTGSDSaveGame")) {
      throw new Error(`Unsupported SaveGame class: ${saveGameClassName}`);
    }

    const rootList = readPropertyList(reader);
    const versions = extractModuleVersions(rootList);
    const modules = extractModules(rootList, versions);
    if (modules.length !== versions.size) {
      throw new Error(`Module table mismatch: ${modules.length}/${versions.size}`);
    }

    return {
      fileName,
      fileSize: bytes.length,
      header: {
        saveGameFileVersion,
        packageFileVersionUE4,
        packageFileVersionUE5,
        engineVersion,
        customVersionFormat,
        customVersionCount,
        saveGameClassName,
        rootDataFlags,
      },
      rootList,
      modules,
      gameBuildId: stringProperty(rootList, "GameBuildId"),
    };
  }

  function extractHelperSnapshot(document) {
    const keys = moduleObject(document, "Keys");
    const webSites = moduleObject(document, "WebSites");
    const virtMesh = moduleObject(document, "VirtMesh");
    const timeKeeper = moduleObject(document, "TimeKeeper");
    const playerData = moduleObject(document, "PlayerData");
    const encrypted = stringArray(keys.EncryptedKeys, 8);
    const decrypted = stringArray(keys.DecryptedKeys, 8);
    const keyPairs = Array.from({ length: 8 }, (_, slot) => ({
      index: slot + 1,
      encrypted: normalizeHex(encrypted[slot], 8),
      decrypted: normalizeHex(decrypted[slot], 4),
    }));
    const sites = arrayObjects(webSites.SavedSites);
    const machines = arrayObjects(virtMesh.SavedMachines).map((machine) => ({
      name: primitiveString(machine.MachineName),
      tier: primitiveNumber(machine.Tier),
      state: primitiveNumber(machine.State),
    }));

    return {
      fileName: document.fileName,
      fileSize: document.fileSize,
      gameBuildId: document.gameBuildId,
      keyPairs,
      winURL: normalizeHex(primitiveString(keys.WinURL), 32),
      sites: {
        total: sites.length,
        visited: sites.filter((site) => primitiveBoolean(site.Visited)).length,
        seized: sites.filter((site) => primitiveBoolean(site.Seized)).length,
        keySites: sites
          .filter((site) => primitiveBoolean(site.HasKey))
          .map((site) => ({
            name: primitiveString(site.Name),
            key: primitiveString(site.KeyString),
          })),
      },
      machines,
      minerNames: machines
        .filter((machine) => machine.state === 4)
        .map((machine) => machine.name),
      mountedCount: primitiveNumber(playerData.CurrentVirtualMachinesMounted),
      dosCoin: primitiveNumber(playerData.DOSCoinBalance),
      time: dateTimeParts(timeKeeper.CurrentTime),
      hoursLeft: primitiveNumber(timeKeeper.HoursLeft),
      totalGameHours: primitiveNumber(timeKeeper.TotalGameHours),
    };
  }

  function extractModuleVersions(list) {
    const value = propertyValue(list, "ModuleVersions");
    if (!value || value.kind !== "map") {
      throw new Error("ModuleVersions table was not found.");
    }
    const versions = new Map();
    for (const entry of value.entries) {
      if (
        entry.key.kind !== "string" ||
        entry.value.kind !== "number" ||
        typeof entry.value.value !== "number"
      ) {
        throw new Error("Invalid ModuleVersions entry.");
      }
      versions.set(entry.key.value, entry.value.value);
    }
    return versions;
  }

  function extractModules(list, versions) {
    const value = propertyValue(list, "ModuleBlobs");
    if (!value || value.kind !== "map") {
      throw new Error("ModuleBlobs table was not found.");
    }
    return value.entries.map((entry) => {
      if (entry.key.kind !== "string" || entry.value.kind !== "tagged-struct") {
        throw new Error("Invalid ModuleBlobs entry.");
      }
      const bytesValue = propertyValue(entry.value.list, "Bytes");
      if (!bytesValue || bytesValue.kind !== "byte-array" || !bytesValue.bytes.length) {
        throw new Error(`Module ${entry.key.value} is empty.`);
      }
      const reader = new BinaryReader(bytesValue.bytes);
      const mode = reader.readUInt8();
      return {
        name: entry.key.value,
        version: versions.get(entry.key.value) ?? null,
        mode,
        list: mode === 0 ? readPropertyList(reader) : null,
      };
    });
  }

  function readPropertyList(reader) {
    const properties = [];
    while (reader.remaining >= 4) {
      const name = reader.readFString();
      if (name.value === "None") return { properties };
      const type = reader.readTypeName();
      const originalSize = reader.readUInt32();
      const extension = reader.readUInt8();
      const payload = reader.readBytes(originalSize);
      let value;
      if (type.name === "BoolProperty") {
        value = { kind: "bool", value: (extension & 0x10) !== 0 };
      } else {
        const payloadReader = new BinaryReader(payload);
        try {
          value = readTypedValue(payloadReader, type, extension);
          if (payloadReader.remaining !== 0) {
            throw new Error(`${payloadReader.remaining} unread bytes`);
          }
        } catch (error) {
          value = {
            kind: "opaque",
            bytes: payload,
            reason: error instanceof Error ? error.message : "Unreadable property",
          };
        }
      }
      properties.push({ name, type, extension, value, originalSize });
    }
    throw new Error("Property list has no None terminator.");
  }

  function readTypedValue(reader, type, extension = 0) {
    switch (type.name) {
      case "BoolProperty":
        return { kind: "bool", value: reader.readUInt8() !== 0 };
      case "ByteProperty":
        return { kind: "number", numberType: "byte", value: reader.readUInt8() };
      case "IntProperty":
        return { kind: "number", numberType: "int32", value: reader.readInt32() };
      case "UInt32Property":
        return { kind: "number", numberType: "uint32", value: reader.readUInt32() };
      case "Int64Property":
        return { kind: "number", numberType: "int64", value: reader.readInt64().toString() };
      case "FloatProperty":
        return { kind: "number", numberType: "float32", value: reader.readFloat32() };
      case "DoubleProperty":
        return { kind: "number", numberType: "float64", value: reader.readFloat64() };
      case "StrProperty":
      case "NameProperty":
      case "EnumProperty":
      case "ObjectProperty":
      case "SoftObjectProperty":
      case "ClassProperty":
        return reader.readFString();
      case "StructProperty":
        return readStructValue(reader, type, extension);
      case "ArrayProperty":
        return readArrayValue(reader, type);
      case "MapProperty":
        return readMapValue(reader, type);
      case "SetProperty":
        return readSetValue(reader, type);
      default:
        return {
          kind: "opaque",
          bytes: reader.readBytes(reader.remaining),
          reason: `Unsupported property type: ${type.name}`,
        };
    }
  }

  function readStructValue(reader, type, extension) {
    const structName = type.parameters[0]?.name ?? "UnknownStruct";
    if ((extension & 0x08) !== 0) {
      switch (structName) {
        case "DateTime":
          return { kind: "native-struct", structName, fields: { ticks: reader.readInt64().toString() } };
        case "Vector":
          return { kind: "native-struct", structName, fields: { x: reader.readFloat64(), y: reader.readFloat64(), z: reader.readFloat64() } };
        case "Rotator":
          return { kind: "native-struct", structName, fields: { pitch: reader.readFloat64(), yaw: reader.readFloat64(), roll: reader.readFloat64() } };
        case "Vector2D":
          return { kind: "native-struct", structName, fields: { x: reader.readFloat64(), y: reader.readFloat64() } };
        case "IntPoint":
          return { kind: "native-struct", structName, fields: { x: reader.readInt32(), y: reader.readInt32() } };
        case "LinearColor":
          return { kind: "native-struct", structName, fields: { r: reader.readFloat32(), g: reader.readFloat32(), b: reader.readFloat32(), a: reader.readFloat32() } };
        case "Quat":
          return { kind: "native-struct", structName, fields: { x: reader.readFloat64(), y: reader.readFloat64(), z: reader.readFloat64(), w: reader.readFloat64() } };
        case "Guid":
          return { kind: "native-struct", structName, fields: { value: bytesToHex(reader.readBytes(16)) } };
        default:
          return { kind: "native-struct", structName, fields: {}, raw: reader.readBytes(reader.remaining) };
      }
    }
    return { kind: "tagged-struct", structName, list: readPropertyList(reader) };
  }

  function readArrayValue(reader, type) {
    const innerType = type.parameters[0];
    if (!innerType) throw new Error("Array inner type is missing.");
    const count = reader.readInt32();
    assertCollectionCount(count, "array");
    if (innerType.name === "ByteProperty") {
      return { kind: "byte-array", bytes: reader.readBytes(count) };
    }
    const items = [];
    for (let index = 0; index < count; index += 1) {
      items.push(readTypedValue(reader, innerType));
    }
    return { kind: "array", innerType, items };
  }

  function readMapValue(reader, type) {
    const keyType = type.parameters[0];
    const valueType = type.parameters[1];
    if (!keyType || !valueType) throw new Error("Map type parameters are missing.");
    const removedCount = reader.readInt32();
    assertCollectionCount(removedCount, "map removed");
    const removed = [];
    for (let index = 0; index < removedCount; index += 1) {
      removed.push(readTypedValue(reader, keyType));
    }
    const count = reader.readInt32();
    assertCollectionCount(count, "map");
    const entries = [];
    for (let index = 0; index < count; index += 1) {
      entries.push({
        key: readTypedValue(reader, keyType),
        value: readTypedValue(reader, valueType),
      });
    }
    return { kind: "map", keyType, valueType, removed, entries };
  }

  function readSetValue(reader, type) {
    const innerType = type.parameters[0];
    if (!innerType) throw new Error("Set inner type is missing.");
    const removedCount = reader.readInt32();
    assertCollectionCount(removedCount, "set removed");
    const removed = [];
    for (let index = 0; index < removedCount; index += 1) {
      removed.push(readTypedValue(reader, innerType));
    }
    const count = reader.readInt32();
    assertCollectionCount(count, "set");
    const items = [];
    for (let index = 0; index < count; index += 1) {
      items.push(readTypedValue(reader, innerType));
    }
    return { kind: "set", innerType, removed, items };
  }

  function propertyValue(list, name) {
    return list?.properties.find((property) => property.name.value === name)?.value;
  }

  function stringProperty(list, name) {
    const value = propertyValue(list, name);
    return value?.kind === "string" ? value.value : null;
  }

  function moduleObject(document, name) {
    const module = document.modules.find((entry) => entry.name === name);
    if (!module?.list) return {};
    return objectFromList(module.list);
  }

  function objectFromList(list) {
    return Object.fromEntries(
      list.properties.map((property) => [property.name.value, unwrap(property.value)]),
    );
  }

  function unwrap(value) {
    switch (value.kind) {
      case "string":
      case "number":
      case "bool":
        return value.value;
      case "native-struct":
        return value.fields;
      case "tagged-struct":
        return objectFromList(value.list);
      case "array":
        return value.items.map(unwrap);
      case "map":
        return value.entries.map((entry) => [unwrap(entry.key), unwrap(entry.value)]);
      case "set":
        return value.items.map(unwrap);
      case "byte-array":
        return value.bytes;
      default:
        return null;
    }
  }

  function stringArray(value, limit) {
    return Array.isArray(value)
      ? value.slice(0, limit).map(primitiveString)
      : [];
  }

  function arrayObjects(value) {
    return Array.isArray(value)
      ? value.filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry))
      : [];
  }

  function primitiveString(value) {
    return typeof value === "string" ? value : "";
  }

  function primitiveNumber(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  function primitiveBoolean(value) {
    return value === true;
  }

  function normalizeHex(value, length) {
    const match = primitiveString(value).trim().toLowerCase();
    return new RegExp(`^[0-9a-f]{${length}}$`).test(match) ? match : "";
  }

  function dateTimeParts(value) {
    const ticks = value && typeof value === "object" ? value.ticks : null;
    if (typeof ticks !== "string" || !/^\d+$/.test(ticks)) return null;
    try {
      const ticksInDay = BigInt(ticks) % 864000000000n;
      const hour = Number(ticksInDay / 36000000000n);
      const minute = Number((ticksInDay % 36000000000n) / 600000000n);
      return { hour, minute, label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` };
    } catch {
      return null;
    }
  }

  function bytesToHex(bytes) {
    return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  }

  function assertCollectionCount(count, label) {
    if (!Number.isInteger(count) || count < 0 || count > MAX_COLLECTION_ITEMS) {
      throw new Error(`Invalid ${label} item count: ${count}`);
    }
  }

  class BinaryReader {
    constructor(bytes) {
      this.bytes = bytes;
      this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      this.offset = 0;
    }

    get remaining() {
      return this.bytes.length - this.offset;
    }

    ensure(length) {
      if (!Number.isInteger(length) || length < 0 || this.offset + length > this.bytes.length) {
        throw new Error(`Unexpected end of file at 0x${this.offset.toString(16)}.`);
      }
    }

    skip(length) {
      this.ensure(length);
      this.offset += length;
    }

    readBytes(length) {
      this.ensure(length);
      const result = this.bytes.slice(this.offset, this.offset + length);
      this.offset += length;
      return result;
    }

    readAscii(length) {
      return String.fromCharCode(...this.readBytes(length));
    }

    readUInt8() {
      this.ensure(1);
      return this.view.getUint8(this.offset++);
    }

    readUInt16() {
      this.ensure(2);
      const value = this.view.getUint16(this.offset, true);
      this.offset += 2;
      return value;
    }

    readInt32() {
      this.ensure(4);
      const value = this.view.getInt32(this.offset, true);
      this.offset += 4;
      return value;
    }

    readUInt32() {
      this.ensure(4);
      const value = this.view.getUint32(this.offset, true);
      this.offset += 4;
      return value;
    }

    readInt64() {
      this.ensure(8);
      const value = this.view.getBigInt64(this.offset, true);
      this.offset += 8;
      return value;
    }

    readFloat32() {
      this.ensure(4);
      const value = this.view.getFloat32(this.offset, true);
      this.offset += 4;
      return value;
    }

    readFloat64() {
      this.ensure(8);
      const value = this.view.getFloat64(this.offset, true);
      this.offset += 8;
      return value;
    }

    readFString() {
      const length = this.readInt32();
      if (length === 0) return { kind: "string", value: "", encoding: "utf8" };
      if (Math.abs(length) > MAX_FILE_SIZE) throw new Error("Invalid FString length.");
      if (length > 0) {
        const payload = this.readBytes(length);
        if (payload[payload.length - 1] !== 0) throw new Error("Invalid UTF-8 FString.");
        return {
          kind: "string",
          value: new TextDecoder("utf-8", { fatal: true }).decode(payload.slice(0, -1)),
          encoding: "utf8",
        };
      }
      const payload = this.readBytes(-length * 2);
      if (payload[payload.length - 1] !== 0 || payload[payload.length - 2] !== 0) {
        throw new Error("Invalid UTF-16 FString.");
      }
      return {
        kind: "string",
        value: new TextDecoder("utf-16le", { fatal: true }).decode(payload.slice(0, -2)),
        encoding: "utf16le",
      };
    }

    readTypeName(depth = 0) {
      if (depth > 16) throw new Error("Property type tree is too deep.");
      const name = this.readFString();
      const count = this.readInt32();
      if (count < 0 || count > 64) throw new Error(`Invalid type parameter count: ${count}`);
      const parameters = [];
      for (let index = 0; index < count; index += 1) {
        parameters.push(this.readTypeName(depth + 1));
      }
      return { name: name.value, encoding: name.encoding, parameters };
    }
  }

  return { parseSave, extractHelperSnapshot, MAX_FILE_SIZE };
});
