/**
 * utils.ts
 */

// convert `on_enter_ready` to `onEnterReady`
export function nameUp (name: string) {
  return name.replace(/_([a-zA-Z])/g, (m, p1) => p1.toUpperCase())
}
