import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import { ProtoSchema } from '@/types/Protobuf'
import { getTopicCandidatesSignature, learnProtobufResolution, resolveProtobuf, subscribeToTopicCache } from '@/utils/protobuf/resolve'

/** Lightweight row path: resolve while rendering, learn only after commit. */
export function useProtobufResolution(binaryData: string | undefined, subject: string | undefined, schemas: ProtoSchema[], enabled = true) {
  const snapshot = useCallback(() => getTopicCandidatesSignature(subject), [subject])
  const signature = useSyncExternalStore(subscribeToTopicCache, snapshot, snapshot)
  const resolution = useMemo(
    () => enabled && binaryData ? resolveProtobuf(binaryData, schemas, subject) : undefined,
    [enabled, binaryData, schemas, subject, signature],
  )
  useEffect(() => {
    learnProtobufResolution(subject, resolution)
  }, [subject, resolution])
  return resolution
}
