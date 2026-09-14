class AudioAlertService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastAlertTime: number = 0;
  private minIntervalMs: number = 3000; // Evita repetição excessiva (throttle)

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autoscanner_audio_muted');
      if (saved) {
        this.isMuted = saved === 'true';
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoscanner_audio_muted', String(muted));
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Beep de Advertência (880Hz / tom de alerta amarelo)
   */
  public playWarningBeep(): void {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastAlertTime < this.minIntervalMs) return;
    this.lastAlertTime = now;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Falha silenciosa de áudio
    }
  }

  /**
   * Alarme de Perigo Crítico (1200Hz urgente modulado / vermelho)
   */
  public playDangerAlert(): void {
    if (this.isMuted) return;
    const now = Date.now();
    if (now - this.lastAlertTime < this.minIntervalMs) return;
    this.lastAlertTime = now;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // Beep 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1200, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);

      // Beep 2 (ecoador urgente)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1400, ctx.currentTime + 0.2);
      osc2.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.35);

      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(ctx.currentTime + 0.2);
      osc2.stop(ctx.currentTime + 0.35);
    } catch {
      // Falha silenciosa
    }
  }

  /**
   * Chime suave de confirmação de comando
   */
  public playSuccessChime(): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Falha silenciosa
    }
  }
}

export const audioAlerts = new AudioAlertService();
