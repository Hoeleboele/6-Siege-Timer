export class Timer {
  constructor({ onTick = () => {}, onZero = () => {} } = {}) {
    this.totalSeconds = 0;
    this.remainingSeconds = 0;
    this.running = false;
    this.intervalId = null;
    this.lastTimestamp = null;
    this.onTick = onTick;
    this.onZero = onZero;
    this._audioCtx = null;
    this._lastSoundSecond = null;
  }

  _getAudioCtx() {
    if (!this._audioCtx || this._audioCtx.state === 'closed') {
      this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._audioCtx;
  }

  _playBeep(frequency = 880, duration = 0.08, volume = 0.4) {
    try {
      const ctx = this._getAudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = 'sine';
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (_) {
      // Audio not available
    }
  }

  _checkWarningSound(seconds) {
    if (seconds <= 0 || seconds === this._lastSoundSecond) return;
    if (seconds <= 10) {
      this._lastSoundSecond = seconds;
      this._playBeep(1046, 0.1, 0.5); // high beep every second
    } else if (seconds <= 30 && seconds % 2 === 0) {
      this._lastSoundSecond = seconds;
      this._playBeep(660, 0.1, 0.35); // lower beep every 2 seconds
    }
  }

  setDuration(seconds) {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    this.totalSeconds = safeSeconds;
    this.remainingSeconds = safeSeconds;
    this._lastSoundSecond = null;
    this.onTick(this.remainingSeconds);
  }

  setRemaining(seconds) {
    this.remainingSeconds = Math.max(0, Number(seconds) || 0);
    this.onTick(this.remainingSeconds);
  }

  start() {
    if (this.running || this.remainingSeconds <= 0) {
      return;
    }

    this.running = true;
    this._lastSoundSecond = null;
    this.lastTimestamp = Date.now();

    this.intervalId = window.setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - this.lastTimestamp) / 1000);

      if (elapsed <= 0) {
        return;
      }

      this.lastTimestamp += elapsed * 1000;
      this.remainingSeconds = Math.max(0, this.remainingSeconds - elapsed);
      this._checkWarningSound(this.remainingSeconds);
      this.onTick(this.remainingSeconds);

      if (this.remainingSeconds === 0) {
        this.pause();
        this.onZero();
      }
    }, 150);
  }

  pause() {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resume() {
    this.start();
  }

  stop() {
    this.pause();
    this.remainingSeconds = 0;
    this.totalSeconds = 0;
    this.onTick(this.remainingSeconds);
  }

  addSeconds(deltaSeconds) {
    this.remainingSeconds = Math.max(0, this.remainingSeconds + deltaSeconds);
    this.onTick(this.remainingSeconds);
  }

  isRunning() {
    return this.running;
  }
}
