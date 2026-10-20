import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const LICENSE_API = "https://rkpanel-35kfe9tt.manus.space/api/license-registry";
export const PRODUCT_ID = "app.zenix.relay";
const INSTALLATION_ID_KEY = "zenixx_relay_installation_id";
const REQUEST_TIMEOUT_MS = 15_000;

export type VerifyResult = {
  valid?: boolean;
  productId?: string;
  expiresAt?: string;
  error?: string;
  code?: string;
};

export type LicenseRequestResult = {
  requestId?: string;
  status?: string;
  error?: string;
};

function makeUuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function readStored(key: string) {
  if (Platform.OS === "web") {
    return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
  }
  return SecureStore.getItemAsync(key);
}

async function writeStored(key: string, value: string) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getInstallationId() {
  const existing = await readStored(INSTALLATION_ID_KEY);
  if (existing) return existing;
  const id = makeUuid();
  await writeStored(INSTALLATION_ID_KEY, id);
  return id;
}

async function postJson<T>(path: string, body: Record<string, string>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${LICENSE_API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const raw = await response.text();
    let data = {} as T & { error?: string };
    try {
      data = raw ? (JSON.parse(raw) as T & { error?: string }) : ({} as T & { error?: string });
    } catch {
      data = { error: raw || `Request failed (${response.status})` } as T & { error?: string };
    }
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyLicense(licenseKey: string, deviceId: string) {
  return postJson<VerifyResult>("/verify", {
    licenseKey: licenseKey.trim(),
    productId: PRODUCT_ID,
    deviceId,
  });
}

export async function requestApproval(deviceId: string, requesterName = "Zenixx Relay user") {
  return postJson<LicenseRequestResult>("/requests", {
    productId: PRODUCT_ID,
    productName: "Zenixx Relay",
    deviceId,
    requesterName,
    message: "Please approve this installation.",
  });
}
