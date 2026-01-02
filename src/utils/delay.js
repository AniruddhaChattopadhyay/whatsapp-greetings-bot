import config from './config.js';

export function getRandomDelay() {
  const minDelay = config.get('delays.minDelay') || 30000;
  const maxDelay = config.get('delays.maxDelay') || 60000;
  const randomize = config.get('delays.randomize');

  if (!randomize) {
    return minDelay;
  }

  // Generate random delay between min and max
  return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function delayWithProgress(ms, onProgress = null) {
  const startTime = Date.now();
  const interval = 100; // Update every 100ms

  while (Date.now() - startTime < ms) {
    await sleep(interval);
    if (onProgress) {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / ms, 1);
      onProgress(progress);
    }
  }
}

export class RateLimiter {
  constructor() {
    this.dailyCount = 0;
    this.lastResetDate = new Date().toDateString();
    this.enabled = config.get('limits.enabled');
    this.dailyLimit = config.get('limits.dailyLimit');
  }

  checkAndIncrement() {
    this.resetIfNewDay();

    if (!this.enabled) {
      return { allowed: true, remaining: Infinity };
    }

    if (this.dailyCount >= this.dailyLimit) {
      return {
        allowed: false,
        remaining: 0,
        message: `Daily limit of ${this.dailyLimit} messages reached`
      };
    }

    this.dailyCount++;
    return {
      allowed: true,
      remaining: this.dailyLimit - this.dailyCount
    };
  }

  resetIfNewDay() {
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.dailyCount = 0;
      this.lastResetDate = today;
    }
  }

  getRemainingCount() {
    this.resetIfNewDay();
    return this.enabled ? this.dailyLimit - this.dailyCount : Infinity;
  }

  reset() {
    this.dailyCount = 0;
  }
}

export const rateLimiter = new RateLimiter();
