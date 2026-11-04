import { useEffect, useRef } from 'react';
import type * as React from 'react';
import images from '~/content/images.json';
import { screens, type ScreenName } from '~/content/screens';
import { useInView, usePageVisible, useReducedMotion } from '~/lib/motion';

export type ImageEntry = {
  width: number;
  height: number;
  /** Tiny blurred WebP as a data URL, shown while the image loads. */
  placeholder?: string;
  /** Smallest to largest. */
  sources: { width: number; src: string }[];
  /** `gif` files are kept as they are. */
  type: 'webp' | 'gif';
};

const manifest = images as Record<string, ImageEntry>;

/**
 * One product screen. Shows the drawn component (`children`) unless
 * `src/content/screens.ts` points this slot at an image or a video.
 */
export function ScreenSlot({
  name,
  sizes = '(min-width: 1280px) 720px, 100vw',
  children
}: {
  name: ScreenName;
  sizes?: string;
  children: React.ReactNode;
}) {
  const screen = screens[name];
  if (screen.kind === 'image') {
    const entry = manifest[screen.image];
    if (!entry) {
      throw new Error(
        `Screen "${name}" uses image "${screen.image}", which is not in src/content/images.json. Run pnpm add-images first.`
      );
    }
    return <ResponsiveImage entry={entry} alt={screen.alt} sizes={sizes} />;
  }
  if (screen.kind === 'video') return <ScreenVideo {...screen} />;
  return <>{children}</>;
}

export function ResponsiveImage({
  entry,
  alt,
  sizes
}: {
  entry: ImageEntry;
  alt: string;
  sizes: string;
}) {
  const largest = entry.sources[entry.sources.length - 1];
  return (
    <img
      className='screen-media'
      src={entry.type === 'gif' ? largest.src : (entry.sources.find((s) => s.width >= 1600) ?? largest).src}
      srcSet={
        entry.type === 'gif'
          ? undefined
          : entry.sources.map((s) => `${s.src} ${s.width}w`).join(', ')
      }
      sizes={entry.type === 'gif' ? undefined : sizes}
      width={entry.width}
      height={entry.height}
      alt={alt}
      decoding='async'
      style={
        entry.placeholder
          ? {
              backgroundImage: `url(${entry.placeholder})`,
              backgroundSize: 'cover'
            }
          : undefined
      }
    />
  );
}

function ScreenVideo({
  src,
  poster,
  alt,
  width,
  height
}: {
  src: string;
  poster?: string;
  alt: string;
  width: number;
  height: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref);
  const visible = usePageVisible();
  const reduced = useReducedMotion();
  // Plays only while on screen in a visible tab; reduced motion shows the poster.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (inView && visible && !reduced) void video.play().catch(() => {});
    else video.pause();
  }, [inView, visible, reduced]);
  return (
    <video
      ref={ref}
      className='screen-media'
      src={src}
      poster={poster}
      width={width}
      height={height}
      aria-label={alt}
      muted
      loop
      playsInline
      preload='metadata'
    />
  );
}
