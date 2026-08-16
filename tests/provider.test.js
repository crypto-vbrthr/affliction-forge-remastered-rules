import assert from "node:assert/strict";
import test from "node:test";
import {
  LIBRARY_ID,
  MODULE_ID,
  PACK_COLLECTIONS,
  PROVIDER_ID
} from "../scripts/constants.js";
import { buildProviderRegistration, registerProvider } from "../scripts/provider.js";

test("provider exposes one read-only library backed by the four physical packs", () => {
  const registration = buildProviderRegistration();
  assert.equal(registration.id, PROVIDER_ID);
  assert.equal(registration.moduleId, MODULE_ID);
  assert.equal(registration.libraries.length, 1);
  assert.equal(registration.libraries[0].id, LIBRARY_ID);
  assert.equal(registration.libraries[0].writable, false);
  assert.equal(registration.libraries[0].enabledByDefault, true);
  assert.deepEqual(registration.libraries[0].packs, [...PACK_COLLECTIONS]);
});

test("provider registration is idempotent from the add-on side", () => {
  const providers = [];
  let registerCalls = 0;
  const api = {
    providers: {
      list: () => providers,
      register: (entry) => {
        registerCalls += 1;
        const registered = structuredClone(entry);
        providers.push(registered);
        return registered;
      }
    }
  };

  const first = registerProvider(api);
  const second = registerProvider(api);
  assert.equal(registerCalls, 1);
  assert.equal(first.id, PROVIDER_ID);
  assert.equal(second.id, PROVIDER_ID);
});

test("registration fails clearly without the provider API", () => {
  assert.throws(() => registerProvider({}), /provider API is unavailable/i);
});
