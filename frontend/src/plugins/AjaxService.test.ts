import { describe, expect, it, vi } from 'vitest';

// Mock all problematic imports before importing AjaxService
vi.mock('@/stores/log', () => ({
  default: {
    add: vi.fn(),
  }
}));

vi.mock('@/stores/log/utils', () => ({
  MESSAGE_TYPE: {
    ERROR: 'error',
  }
}));

vi.mock('@/stores/stacks/viewBase', () => ({
  ViewStore: class ViewStore {}
}));

vi.mock('@/stores/stacks/utils', () => ({
  LOAD_STATE: {
    LOADING: 'loading',
    IDLE: 'idle',
    ERROR: 'error',
  }
}));

vi.mock('@/utils/object', () => ({
  camelToSnake: vi.fn((obj) => obj),
  snakeToCamel: vi.fn((obj) => obj),
}));

vi.mock('@/stores/stacks/loadBase', () => ({
  LoadBaseStore: class LoadBaseStore {}
}));

import { AjaxService } from './AjaxService';

describe('AjaxService', () => {
  describe('encodeUrl', () => {
    // Create a new instance of AjaxService for testing
    const ajaxService = new AjaxService();

    it('should encode URL path segments correctly', () => {
      const url = 'connection/test/stream/messages';
      const encodedUrl = ajaxService.encodeUrl(url);
      expect(encodedUrl).toBe('connection/test/stream/messages');
    });

    it('should encode special characters in path segments', () => {
      const url = 'connection/test space/stream+name/messages';
      const encodedUrl = ajaxService.encodeUrl(url);
      expect(encodedUrl).toBe('connection/test%20space/stream%2Bname/messages');
    });

    it('should handle URLs with query parameters', () => {
      const url = 'connection/test/stream/messages?seq_start=22&interval=2';
      const encodedUrl = ajaxService.encodeUrl(url);
      expect(encodedUrl).toBe('connection/test/stream/messages?seq_start=22&interval=2');
    });

    it('should handle URLs with multiple question marks where only the last one is for query params', () => {
      const url = 'connection/stream?with?questions/messages?seq_start=22&interval=2';
      const encodedUrl = ajaxService.encodeUrl(url);
      expect(encodedUrl).toBe('connection/stream%3Fwith%3Fquestions/messages?seq_start=22&interval=2');
    });

    it('should correctly encode URLs with special characters in path but preserve query string', () => {
      const url = 'connection/test space/stream+name/messages?seq_start=22&interval=2';
      const encodedUrl = ajaxService.encodeUrl(url);
      expect(encodedUrl).toBe('connection/test%20space/stream%2Bname/messages?seq_start=22&interval=2');
    });

    it('should correctly handle stream names with special characters like ? and &', () => {
      const url = 'connection/99293a6f-ecf5-4125-97c4-5e375446480c/stream?name&special/messages?seq_start=22&interval=2';
      const encodedUrl = ajaxService.encodeUrl(url);
      expect(encodedUrl).toBe('connection/99293a6f-ecf5-4125-97c4-5e375446480c/stream%3Fname%26special/messages?seq_start=22&interval=2');
    });

    it('should correctly handle a complex example of query string', () => {
      const url = 'http://127.0.0.1:31311/api/connection/99293a6f-ecf5-4125-97c4-5e375446480c/streamstream_name/messages?seq_start=22&interval=2&subjects=latest_event&';
      const encodedUrl = ajaxService.encodeUrl(url);
      expect(encodedUrl).toBe('http%3A//127.0.0.1%3A31311/api/connection/99293a6f-ecf5-4125-97c4-5e375446480c/streamstream_name/messages?seq_start=22&interval=2&subjects=latest_event&');
    });

  });
});
