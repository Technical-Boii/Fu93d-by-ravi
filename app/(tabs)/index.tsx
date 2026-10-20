import * as Clipboard from "expo-clipboard";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { getInstallationId, PRODUCT_ID, requestApproval, verifyLicense } from "@/lib/license-registry";

const CONSOLE_URL = "https://rkpanel-35kfe9tt.manus.space/api/license-registry/";
type Phase = "loading" | "gate" | "checking" | "approved" | "error";

function errorMessage(error: unknown) {
  if (error instanceof Error && error.name === "AbortError") return "Server ne response nahi diya. Thodi der baad retry karo.";
  if (error instanceof TypeError) return "Internet connection check karo aur phir retry karo.";
  return error instanceof Error ? error.message : "Server se verify nahi ho paya.";
}

export default function HomeScreen() {
  const [deviceId, setDeviceId] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [phase, setPhase] = useState<Phase>("loading");
  const [notice, setNotice] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    getInstallationId()
      .then((id) => { setDeviceId(id); setPhase("gate"); })
      .catch(() => { setNotice("Installation ID create nahi ho payi. Retry karo."); setPhase("error"); });
  }, []);

  const shortDeviceId = useMemo(
    () => deviceId ? `${deviceId.slice(0, 8)}…${deviceId.slice(-6)}` : "creating…",
    [deviceId],
  );

  async function checkApproval() {
    if (!licenseKey.trim() || !deviceId) { setNotice("Pehle apni license key enter karo."); return; }
    setPhase("checking");
    setNotice("Checking approval");
    try {
      const response = await verifyLicense(licenseKey, deviceId);
      if (response.valid === true) {
        setNotice(response.expiresAt ? `Approved · valid till ${new Date(response.expiresAt).toLocaleDateString()}` : "Approved");
        setPhase("approved");
      } else {
        setNotice("Your key not approved. Admin ko key send karo.");
        setPhase("gate");
      }
    } catch (error) {
      setNotice(errorMessage(error));
      setPhase("error");
    }
  }

  async function sendToAdmin() {
    if (!deviceId) return;
    try {
      const response = await requestApproval(deviceId);
      setRequestSent(true);
      const body = `Zenixx Relay approval request\nProduct: ${PRODUCT_ID}\nDevice key: ${deviceId}\nRequest ID: ${response.requestId ?? "pending"}`;
      if (Platform.OS === "web") {
        await navigator.clipboard?.writeText(body);
        setNotice("Request details copy ho gaye. Admin ko send karo.");
      } else {
        await Share.share({ message: body, title: "Send key to admin" });
        setNotice("Request admin ko send karne ke liye ready hai.");
      }
    } catch (error) { setNotice(errorMessage(error)); }
  }

  async function copyKey() {
    if (!deviceId) return;
    await Clipboard.setStringAsync(deviceId);
    setNotice("Key copy ho gayi");
  }

  function retry() {
    setNotice("");
    setPhase(deviceId ? "gate" : "loading");
  }

  if (phase === "loading") {
    return <Backdrop><View style={styles.center}><ActivityIndicator color="#7fffea" size="large" /><Text style={styles.loadingText}>Loading</Text></View></Backdrop>;
  }

  if (phase === "approved") {
    return (
      <Backdrop>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}><View><Text style={styles.eyebrow}>ZENIXX</Text><Text style={styles.title}>Relay Console</Text></View><View style={styles.approvedPill}><View style={styles.dot} /><Text style={styles.approvedText}>APPROVED</Text></View></View>
          <View style={styles.consoleCard}><Text style={styles.consoleTitle}>Secure relay channel</Text><Text style={styles.consoleSub}>License verified for this installation.</Text><View style={styles.webFrame}>{Platform.OS === "web" ? <Pressable style={styles.primaryButton} onPress={() => Linking.openURL(CONSOLE_URL)}><Text style={styles.primaryText}>Open relay console</Text></Pressable> : <WebView source={{ uri: CONSOLE_URL }} startInLoadingState renderLoading={() => <ActivityIndicator color="#7fffea" style={{ flex: 1 }} />} onError={() => setNotice("Console load nahi hua. Retry karo.")} />}</View></View>{notice ? <Text style={styles.notice}>{notice}</Text> : null}
        </SafeAreaView>
      </Backdrop>
    );
  }

  return (
    <Backdrop>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}><Text style={styles.eyebrow}>ZENIXX</Text><Text style={styles.title}>Relay</Text><Text style={styles.tagline}>Ye app private hai</Text></View>
          <View style={styles.statusLine}><View style={[styles.dot, phase === "error" && styles.dotWarn]} /><Text style={styles.statusText}>{phase === "checking" ? "CHECKING APPROVAL" : phase === "error" ? "OFFLINE / ERROR" : "ACCESS GATE"}</Text></View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Approval required</Text>
            <Text style={styles.cardBody}>Aapki device key niche hai. Ye key admin ko bhejo, approve hone ke baad app khud khul jayega.</Text>
            <View style={styles.keyBox}><Text style={styles.keyLabel}>YOUR DEVICE KEY</Text><Text selectable style={styles.key}>{shortDeviceId}</Text></View>
            <TextInput value={licenseKey} onChangeText={setLicenseKey} placeholder="Enter license key" placeholderTextColor="#708091" autoCapitalize="characters" autoCorrect={false} style={styles.input} accessibilityLabel="License key" />
            <Text style={styles.helper}>Server verify ke liye apni issued license key enter karo.</Text>
            <Pressable onPress={checkApproval} disabled={phase === "checking"} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>{phase === "checking" ? "Checking…" : "Check approval"}</Text></Pressable>
            <View style={styles.row}><Pressable onPress={copyKey} style={styles.secondaryButton}><Text style={styles.secondaryText}>Copy key</Text></Pressable><Pressable onPress={sendToAdmin} style={styles.secondaryButton}><Text style={styles.secondaryText}>{requestSent ? "Sent" : "Send to admin"}</Text></Pressable></View>
            {(phase === "error" || notice) ? <View style={styles.noticeBox}><Text style={styles.notice}>{notice || "Server so raha ho sakta hai. Retry dabao."}</Text><Pressable onPress={retry}><Text style={styles.retry}>Retry</Text></Pressable></View> : null}
          </View>
          <Text style={styles.footer}>make by zenixx · {PRODUCT_ID}</Text>
        </ScrollView>
      </SafeAreaView>
    </Backdrop>
  );
}

function Backdrop({ children }: { children: ReactNode }) { return <View style={styles.backdrop}>{children}</View>; }

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#071b2d" }, safe: { flex: 1 }, scroll: { flexGrow: 1, padding: 22, justifyContent: "center" }, center: { flex: 1, justifyContent: "center", alignItems: "center" }, loadingText: { color: "#b4d5dc", marginTop: 14, letterSpacing: 1 }, brand: { marginBottom: 24 }, eyebrow: { color: "#68ffe0", fontSize: 13, fontWeight: "800", letterSpacing: 4 }, title: { color: "#f2ffff", fontSize: 42, fontWeight: "800", letterSpacing: -1 }, tagline: { color: "#8ca9b6", marginTop: 6, fontSize: 15 }, statusLine: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 12 }, statusText: { color: "#92a9b6", fontSize: 11, fontWeight: "800", letterSpacing: 1.6 }, dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#68ffe0", shadowColor: "#68ffe0", shadowOpacity: 0.8, shadowRadius: 8 }, dotWarn: { backgroundColor: "#ff7eb6" }, card: { backgroundColor: "#102d42", borderColor: "#245166", borderWidth: 1, borderRadius: 22, padding: 20 }, cardTitle: { color: "#f2ffff", fontSize: 22, fontWeight: "800", marginBottom: 8 }, cardBody: { color: "#a5bec8", lineHeight: 22, fontSize: 14 }, keyBox: { backgroundColor: "#071b2d", borderColor: "#2d6574", borderWidth: 1, borderRadius: 14, padding: 15, marginTop: 18 }, keyLabel: { color: "#6d99a5", fontSize: 10, fontWeight: "800", letterSpacing: 1.6, marginBottom: 7 }, key: { color: "#77ffe4", fontFamily: "monospace", fontSize: 16 }, input: { marginTop: 14, borderRadius: 12, borderWidth: 1, borderColor: "#396476", color: "#f2ffff", paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, backgroundColor: "#0b2437" }, helper: { color: "#7897a5", fontSize: 12, marginTop: 8 }, primaryButton: { backgroundColor: "#68ffe0", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, alignItems: "center", marginTop: 17 }, pressed: { opacity: 0.75 }, primaryText: { color: "#06202c", fontWeight: "800", fontSize: 15 }, row: { flexDirection: "row", gap: 10, marginTop: 10 }, secondaryButton: { flex: 1, borderColor: "#3d6978", borderWidth: 1, borderRadius: 11, paddingVertical: 12, alignItems: "center" }, secondaryText: { color: "#b9d7df", fontWeight: "700", fontSize: 13 }, noticeBox: { backgroundColor: "#162f40", borderRadius: 12, padding: 12, marginTop: 14 }, notice: { color: "#b8d4db", fontSize: 13, lineHeight: 19 }, retry: { color: "#68ffe0", fontWeight: "800", marginTop: 7 }, footer: { color: "#567787", fontSize: 11, textAlign: "center", marginTop: 24 }, header: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, approvedPill: { flexDirection: "row", alignItems: "center", gap: 7, borderColor: "#2d6b6c", borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 }, approvedText: { color: "#68ffe0", fontSize: 10, fontWeight: "800", letterSpacing: 1 }, consoleCard: { flex: 1, margin: 14, backgroundColor: "#102d42", borderRadius: 18, borderColor: "#245166", borderWidth: 1, padding: 14 }, consoleTitle: { color: "#f2ffff", fontSize: 20, fontWeight: "800" }, consoleSub: { color: "#9dbac2", marginTop: 5, marginBottom: 12 }, webFrame: { flex: 1, minHeight: 380, overflow: "hidden", borderRadius: 12, backgroundColor: "#071b2d" },
});
