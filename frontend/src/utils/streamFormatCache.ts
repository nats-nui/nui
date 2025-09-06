import { MSG_FORMAT } from "./editor"

const CACHE_KEY = "stream-format-cache"

// In-memory cache for fast reads
const memoryCache = new Map<string, MSG_FORMAT>()

function getStreamKey(connectionId: string, streamName: string): string {
  return `${connectionId}:${streamName}`
}

/**
 * Load cached formats from localStorage into memory on first access
 */
function loadCacheFromStorage(): void {
  if (memoryCache.size > 0) return // Already loaded
  
  try {
    const cache = localStorage.getItem(CACHE_KEY)
    if (cache) {
      const parsedCache = JSON.parse(cache)
      Object.entries(parsedCache).forEach(([key, format]) => {
        memoryCache.set(key, format as MSG_FORMAT)
      })
    }
  } catch (error) {
    console.error("Failed to load stream format cache:", error)
  }
}

/**
 * Get the cached format for a specific stream (memory read)
 */
export function getStreamFormat(connectionId: string, streamName: string): MSG_FORMAT | null {
  if (!connectionId || !streamName) return null
  
  loadCacheFromStorage() // Ensure cache is loaded
  const streamKey = getStreamKey(connectionId, streamName)
  return memoryCache.get(streamKey) || null
}

/**
 * Set the format for a specific stream (memory + localStorage write)
 */
export function setStreamFormat(connectionId: string, streamName: string, format: MSG_FORMAT): void {
  if (!connectionId || !streamName || !format) return
  
  const streamKey = getStreamKey(connectionId, streamName)
  
  // Update memory cache
  memoryCache.set(streamKey, format)
  
  // Persist to localStorage
  try {
    const cacheObject = Object.fromEntries(memoryCache.entries())
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject))
  } catch (error) {
    console.error("Failed to persist stream format cache:", error)
  }
}