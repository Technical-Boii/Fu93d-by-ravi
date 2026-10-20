# Zenixx Relay Clean Rebuild TODO

## Package and branding

- [ ] The Android application ID is exactly `app.zenixx.relay`, the display name is `Zenixx Relay`, and the supplied/reference cyberpunk branding is carried into splash, launcher, and main screen assets.

## Approval and installation identity

- [ ] The app generates one random app-private installation ID on first launch, persists it across launches, and does not use IMEI, serial, or another restricted hardware identifier.
- [ ] The approval screen shows a user-editable license-key field and the installation/device key context without embedding any fixed license key, admin password, session, or bypass.
- [ ] Copy key gives accessible confirmation, and Send to admin opens a share/contact intent with the information needed for approval.
- [ ] Check approval again shows progress, prevents duplicate requests, and refreshes the server result.

## Server verification

- [ ] The app calls HTTPS `POST https://rkpanel-35kfe9tt.manus.space/api/license-registry/verify` with `licenseKey`, exact `productId: app.zenix.relay`, and the persisted `deviceId`.
- [ ] Only a successful response with `valid: true` unlocks licensed content; invalid, expired, product-mismatch, device-mismatch, rate-limit, offline, and service errors remain locked and actionable.
- [ ] The app can submit a license request through the documented `/requests` endpoint when the user asks for approval.

## Approved content and recovery

- [ ] After valid approval, the app presents the relay-console content in a safe WebView boundary and handles loading failure with Retry.
- [ ] Splash/loading, approval, approved, offline, server-error, invalid-key, and retry states are visually coherent in portrait and one-handed use.

## Release handoff

- [ ] TypeScript diagnostics and project checks pass.
- [ ] The project is checkpointed with source/configuration ready for Dashboard Android APK/AAB build.
- [ ] Deployment instructions explain server-side custom-key issuance for `app.zenix.relay`, Android testing, and why the signing keystore must be backed up.

## Known parity limitation

- [ ] Exact undocumented behavior of the original APK cannot be guaranteed because its source project and original backend content were lost; only its readable UI/flow and documented license API are reproduced.
