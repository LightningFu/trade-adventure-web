/**
 * 资源加载管理器 (Web 版本)
 * 加载图片资源，提供加载进度回调
 */
export class ResourceManager {
  private static instance: ResourceManager;
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private loadedCount: number = 0;
  private totalCount: number = 0;
  private onProgressCallback: ((loaded: number, total: number) => void) | null = null;
  private onCompleteCallback: (() => void) | null = null;
  private onErrorCallback: ((err: string) => void) | null = null;

  private constructor() {}

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  /**
   * 加载单个图片
   */
  loadImage(key: string, src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (this.imageCache.has(key)) {
        resolve(this.imageCache.get(key)!);
        return;
      }

      const image = new Image();
      image.onload = () => {
        this.imageCache.set(key, image);
        this.loadedCount++;
        if (this.onProgressCallback) {
          this.onProgressCallback(this.loadedCount, this.totalCount);
        }
        if (this.loadedCount >= this.totalCount && this.onCompleteCallback) {
          this.onCompleteCallback();
        }
        resolve(image);
      };
      image.onerror = (err: any) => {
        console.error(`[ResourceManager] Failed to load image: ${src}`, err);
        if (this.onErrorCallback) {
          this.onErrorCallback(`Failed to load: ${src}`);
        }
        reject(err);
      };
      image.src = src;
    });
  }

  /**
   * 批量加载图片
   */
  loadImages(
    images: Array<{ key: string; src: string }>,
    onProgress?: (loaded: number, total: number) => void,
    onComplete?: () => void,
    onError?: (err: string) => void
  ): Promise<HTMLImageElement[]> {
    this.onProgressCallback = onProgress || null;
    this.onCompleteCallback = onComplete || null;
    this.onErrorCallback = onError || null;
    this.loadedCount = 0;
    this.totalCount = images.length;

    const promises = images.map((img) => this.loadImage(img.key, img.src));
    return Promise.all(promises);
  }

  /**
   * 获取已缓存的图片
   */
  getImage(key: string): HTMLImageElement | undefined {
    return this.imageCache.get(key);
  }

  /**
   * 检查图片是否已加载
   */
  hasImage(key: string): boolean {
    return this.imageCache.has(key);
  }

  /**
   * 获取加载进度
   */
  getProgress(): { loaded: number; total: number } {
    return { loaded: this.loadedCount, total: this.totalCount };
  }

  /**
   * 清除所有缓存
   */
  clearCache(): void {
    this.imageCache.clear();
    this.loadedCount = 0;
    this.totalCount = 0;
  }
}
