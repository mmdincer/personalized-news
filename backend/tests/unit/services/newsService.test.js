/**
 * Unit tests for News Service
 */

const newsService = require('../../../services/newsService');

describe('News Service', () => {
  describe('getCacheKey', () => {
    it('should generate correct cache key', () => {
      const key = newsService.getCacheKey('technology', 1, 20);
      expect(key).toBe('news:technology:1:20');
    });

    it('should handle "all" category', () => {
      const key = newsService.getCacheKey(null, 1, 20);
      expect(key).toBe('news:all:1:20');
    });
  });

  describe('getRateLimitStats', () => {
    it('should return rate limit statistics', () => {
      const stats = newsService.getRateLimitStats();
      expect(stats).toHaveProperty('dailyCount');
      expect(stats).toHaveProperty('remaining');
      expect(typeof stats.dailyCount).toBe('number');
      expect(typeof stats.remaining).toBe('number');
    });
  });

  describe('clearCache', () => {
    it('should clear cache without errors', () => {
      expect(() => newsService.clearCache()).not.toThrow();
    });
  });

  describe('Cache cleanup', () => {
    it('should start cache cleanup without errors', () => {
      expect(() => newsService.startCacheCleanup()).not.toThrow();
    });

    it('should stop cache cleanup without errors', () => {
      expect(() => newsService.stopCacheCleanup()).not.toThrow();
    });
  });

  describe('Constants', () => {
    it('should export required constants', () => {
      expect(newsService.CACHE_DURATION_MS).toBe(15 * 60 * 1000);
      expect(newsService.MAX_REQUESTS_PER_DAY).toBe(500); // The Guardian API free tier
      expect(newsService.MAX_REQUESTS_PER_SECOND).toBe(1); // The Guardian API free tier
    });
  });
});
