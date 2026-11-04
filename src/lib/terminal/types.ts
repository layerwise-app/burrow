// Types for the demo terminal on the home page. The commands and their output
// live in `src/content/terminal.ts`; the engine in `./engine.ts` runs them.

/**
 * Output text uses a tiny markup: `{tone:text}` colors a span. Tones:
 * `dim`, `b` (bold, bright), `ok` (green), `warn` (yellow), `link` (cyan),
 * `hl` (magenta, "you are here"), `bar` (a run of █ blocks drawn without
 * seams). Everything else prints as plain text.
 */
export type Markup = string;

export type Tone = 'dim' | 'b' | 'ok' | 'warn' | 'link' | 'hl' | 'bar';

export type Step =
  /** Print one line after waiting `delay` ms (default 0). */
  | { type: 'line'; text: Markup; delay?: number }
  /** Draw a progress bar that fills over `duration` ms, then print `done`. */
  | { type: 'progress'; label: string; duration: number; done?: Markup }
  /** Wipe the screen. */
  | { type: 'clear' };

export type Preview = {
  branch: string;
  status: 'up' | 'asleep';
  /** Human age, like `3d` or `5h`. */
  age: string;
  commit: string;
};

export type TerminalState = {
  previews: Preview[];
};

export type CommandContext = {
  /** Words after the command, like `['feat-checkout']`. */
  args: string[];
  state: TerminalState;
  /** Version of the CLI, from the newest changelog entry. */
  version: string;
  /** The preview URL for a branch, as text. */
  url: (branch: string) => string;
  /** How many characters fit on one line, like `$COLUMNS`. About 44 on phones. */
  columns: number;
};

export type CommandResult = {
  steps: Step[];
  /** The next state, if the command changed anything. */
  state?: TerminalState;
};

export type Command = {
  /** Shown by `help`, like `burrow logs <branch>`. Omit to hide from help. */
  usage?: string;
  summary?: string;
  /** Tab-complete the first argument with a branch name. */
  completeBranch?: boolean;
  run: (ctx: CommandContext) => CommandResult;
};

export type TerminalScript = {
  /** The CLI's name, like `burrow`. Unknown `burrow <sub>` gets its own reply. */
  program: string;
  /** Text in the window's title bar. */
  title: string;
  /** Prompt markup shown before the cursor. */
  prompt: Markup;
  /** Typed automatically on load, then the prompt is the visitor's. */
  introCommand: string;
  /** Printed above the first prompt. */
  welcome: Markup[];
  /** Preview URL pattern; `{branch}` is replaced. */
  urlPattern: string;
  initialState: TerminalState;
  /** Keys are what people type: `help`, `burrow up`, `burrow logs`, … */
  commands: Record<string, Command>;
  /** Reply when the first word is unknown. `{cmd}` is replaced. */
  notFound: Markup[];
  /** Reply when `burrow <sub>` is unknown. `{cmd}` is replaced. */
  unknownSubcommand: Markup[];
};
