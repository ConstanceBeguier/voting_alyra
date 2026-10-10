'use client'
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False while rendering on the server, true once mounted on the client.
 * Used to avoid hydration mismatches on wallet-dependent UI.
 */
export function useClientMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
