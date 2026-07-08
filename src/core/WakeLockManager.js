export class WakeLockManager {
  constructor() {
    this.enabled = false;
    this.sentinel = null;
    this.supported = typeof navigator !== "undefined" && "wakeLock" in navigator;

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);

    if (!this.supported) {
      return;
    }

    if (!this.enabled) {
      void this.release();
      return;
    }

    if (document.visibilityState === "visible") {
      void this.request();
    }
  }

  async request() {
    if (!this.supported || !this.enabled || this.sentinel || document.visibilityState !== "visible") {
      return;
    }

    try {
      const nextSentinel = await navigator.wakeLock.request("screen");
      this.sentinel = nextSentinel;

      nextSentinel.addEventListener("release", () => {
        this.sentinel = null;
        if (this.enabled && document.visibilityState === "visible") {
          void this.request();
        }
      });
    } catch {
      this.sentinel = null;
    }
  }

  async release() {
    if (!this.sentinel) {
      return;
    }

    const lock = this.sentinel;
    this.sentinel = null;

    try {
      await lock.release();
    } catch {
      // Ignore release failures caused by browser policy or stale sentinels.
    }
  }

  handleVisibilityChange() {
    if (!this.supported) {
      return;
    }

    if (document.visibilityState === "visible") {
      if (this.enabled) {
        void this.request();
      }
      return;
    }

    void this.release();
  }
}