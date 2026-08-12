// Cross-tab and real-time backend synchronization broadcast helper
type SyncMessageType = "settings" | "clues";

let syncChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    syncChannel = new BroadcastChannel("stardust_sync_channel");
  } catch (e) {
    console.warn("[BroadcastChannel unavailable]:", e);
  }
}

export function broadcastSync(type: SyncMessageType) {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type, timestamp: Date.now() });
    } catch {}
  }
}

export function subscribeToSync(callback: (type: SyncMessageType) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type) {
      callback(event.data.type);
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === "stardust_event_settings") callback("settings");
    if (event.key === "stardust_team_clues") callback("clues");
  };

  if (syncChannel) {
    syncChannel.addEventListener("message", handleBroadcast);
  }
  window.addEventListener("storage", handleStorage);

  return () => {
    if (syncChannel) {
      syncChannel.removeEventListener("message", handleBroadcast);
    }
    window.removeEventListener("storage", handleStorage);
  };
}
