// Product screens on the home page. Each one is drawn in code by default.
// To show a screenshot instead, add it with `pnpm add-images <file>` and
// set the screen to `{ kind: 'image', image: '<name>', alt: '…' }`.
// For a video, put the file in `public/` and use `{ kind: 'video', … }`.

export type Screen =
  /** The React component drawn with sample data. */
  | { kind: 'drawn' }
  /** An image from `src/content/images.json` (written by `pnpm add-images`). */
  | { kind: 'image'; image: string; alt: string }
  | {
      kind: 'video';
      /** A file in `public/`, like `/videos/demo.mp4`. */
      src: string;
      /** Still frame shown before it plays, like `/images/demo-1600.webp`. */
      poster?: string;
      alt: string;
      width: number;
      height: number;
    };

export type ScreenName = 'heroTerminal';

export const screens: Record<ScreenName, Screen> = {
  /** The working terminal in the hero. */
  heroTerminal: { kind: 'drawn' }
};
