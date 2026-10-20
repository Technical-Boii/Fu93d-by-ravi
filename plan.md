# Zenixx Relay Clean Rebuild Plan

## Scope

Build a clean Android/Expo app with package ID `app.zenixx.relay`, using the supplied APK only as a visual and flow reference. The rebuild will preserve the recognizable Zenixx Relay splash, approval gate, device-key display, copy/share/check-again actions, approved state, and retry/error states where the reference makes them observable. It will not embed a license key, admin password, session, or approval bypass.

## Implementation

- Use the fixed Expo Router / React Native / TypeScript starter.
- Generate and persist a random installation UUID in app-private storage with SecureStore; never use IMEI or restricted hardware IDs.
- Use the documented HTTPS license registry API at `https://rkpanel-35kfe9tt.manus.space/api/license-registry`.
- Verify user-entered keys with `POST /verify`, sending exact `productId: app.zenix.relay` and the persisted `deviceId`.
- Unlock licensed content only when the server returns `valid: true`; retain expiry and product mismatch messaging.
- Provide a request-to-admin path via `POST /requests` and Android share intent for the displayed device key.
- Show an approved relay-console WebView only after successful verification, with lifecycle-safe loading and explicit content-load error/retry behavior.
- Keep network timeout, offline, unknown-key, expired-key, and rate-limit states actionable.

## Design

Reference movement: cyberpunk utility console. Core principles: dark rainy-city atmosphere, high-contrast mint/cyan accents, compact operational cards, and clear status feedback. Color philosophy: deep navy surfaces create a calm secure backdrop while mint/cyan communicates verified connectivity and magenta is reserved for warnings. Layout: portrait-first, one-handed vertical flow with a hero/splash header, single approval card, and a status strip rather than dense grids. Signature elements: rain/circuit visual, monospaced device-key treatment, and glowing status dot. Interaction: every network action has visible progress and a recoverable retry state. Typography: system sans for instructions with monospace for device/license identifiers. Brand voice: concise Hindi/English hybrid copy matching the reference, such as “Aapki device key niche hai” and “Check approval again”.

## Project structure

- `app/(tabs)/index.tsx`: approval gate, status flow, and approved console screen.
- `lib/license-registry.ts`: API client, installation ID persistence, request and verify types.
- `components/`: reusable buttons, status card, and WebView boundary if needed.
- `assets/images/`: supplied/reference branding assets and launcher assets.
- `app.config.ts`: app name, package ID, icon and splash configuration.
- `TODO.md`: acceptance outcomes and unresolved parity notes.

## Deployment constraints

Dashboard must produce the native Android APK/AAB from the accepted project checkpoint. Keep the new signing keystore and password outside the app repository and back them up securely. The custom key `RK-F9K3D-BY-R9VII`, if used, must be issued in the server admin panel for product `app.zenixx.relay`; it must not be compiled into the APK.
