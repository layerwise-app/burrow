import { useEffect, useState, useSyncExternalStore } from 'react';
import type { RefObject } from 'react';

const REDUCED = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED).matches;
}

export function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false
  );
}

/** Whether the element is on screen; `once` stops watching after the first time. */
export function useInView(
  ref: RefObject<Element | null>,
  { once = false, rootMargin = '0px', threshold = 0 } = {}
) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin, threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, once, rootMargin, threshold]);
  return inView;
}

/** Whether the tab is visible. */
export function usePageVisible() {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange);
      return () => document.removeEventListener('visibilitychange', onChange);
    },
    () => document.visibilityState === 'visible',
    () => true
  );
}

/**
 * A clock that only runs while `isActive()` is true (on screen, tab visible),
 * so timed sequences pause instead of finishing unseen. Built on
 * requestAnimationFrame, which browsers already stop in hidden tabs.
 */
export function createClock(isActive: () => boolean, signal: AbortSignal) {
  return function sleep(ms: number) {
    return new Promise<void>((resolve, reject) => {
      if (signal.aborted) return reject(signal.reason);
      if (ms <= 0) return resolve();
      let elapsed = 0;
      let last = performance.now();
      let frame = 0;
      const onAbort = () => {
        cancelAnimationFrame(frame);
        reject(signal.reason);
      };
      signal.addEventListener('abort', onAbort, { once: true });
      const tick = (now: number) => {
        const dt = Math.min(now - last, 100);
        last = now;
        if (isActive()) elapsed += dt;
        if (elapsed >= ms) {
          signal.removeEventListener('abort', onAbort);
          resolve();
        } else {
          frame = requestAnimationFrame(tick);
        }
      };
      frame = requestAnimationFrame(tick);
    });
  };
}
