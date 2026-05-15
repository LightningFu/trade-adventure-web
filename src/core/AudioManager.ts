/**
 * 音频管理器 (Web 版本)
 * 使用 HTML5 Audio API
 */
export class AudioManager {
  private static instance: AudioManager;
  private bgmElement: HTMLAudioElement | null = null;
  private sfxPool: Map<string, HTMLAudioElement> = new Map();
  private bgmVolume: number = 0.5;
  private sfxVolume: number = 0.8;
  private isMuted: boolean = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * 播放背景音乐
   */
  playBGM(src: string, loop: boolean = true): void {
    this.stopBGM();
    this.bgmElement = new Audio(src);
    this.bgmElement.loop = loop;
    this.bgmElement.volume = this.isMuted ? 0 : this.bgmVolume;
    this.bgmElement.play().catch((err) => {
      console.error('[AudioManager] BGM play error:', err);
    });

    this.bgmElement.addEventListener('error', (err) => {
      console.error('[AudioManager] BGM error:', err);
    });
  }

  /**
   * 停止背景音乐
   */
  stopBGM(): void {
    if (this.bgmElement) {
      this.bgmElement.pause();
      this.bgmElement.currentTime = 0;
      this.bgmElement = null;
    }
  }

  /**
   * 暂停背景音乐
   */
  pauseBGM(): void {
    if (this.bgmElement) {
      this.bgmElement.pause();
    }
  }

  /**
   * 恢复背景音乐
   */
  resumeBGM(): void {
    if (this.bgmElement) {
      this.bgmElement.play().catch((err) => {
        console.error('[AudioManager] BGM resume error:', err);
      });
    }
  }

  /**
   * 播放音效
   */
  playSFX(src: string): void {
    if (this.isMuted) return;

    // 复用或创建音效元素
    let audio = this.sfxPool.get(src);
    if (!audio) {
      audio = new Audio(src);
      this.sfxPool.set(src, audio);
    }

    audio.volume = this.sfxVolume;
    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.error('[AudioManager] SFX play error:', err);
    });
  }

  /**
   * 设置BGM音量
   */
  setBGMVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmElement) {
      this.bgmElement.volume = this.isMuted ? 0 : this.bgmVolume;
    }
  }

  /**
   * 设置SFX音量
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 静音切换
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.bgmElement) {
      this.bgmElement.volume = this.isMuted ? 0 : this.bgmVolume;
    }
    return this.isMuted;
  }

  /**
   * 是否静音
   */
  getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 销毁所有音频资源
   */
  destroy(): void {
    this.stopBGM();
    this.sfxPool.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.sfxPool.clear();
  }
}
