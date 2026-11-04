import { fill } from './markup';
import type {
  Command,
  CommandResult,
  TerminalScript,
  TerminalState
} from './types';

export type Resolved = { command: Command; args: string[]; name: string };

function words(input: string) {
  return input.trim().split(/\s+/).filter(Boolean);
}

/** Finds the command for a line like `burrow logs main`, longest name first. */
export function resolve(
  script: TerminalScript,
  input: string
): Resolved | undefined {
  const parts = words(input);
  for (let take = Math.min(parts.length, 3); take > 0; take--) {
    const name = parts.slice(0, take).join(' ');
    const command = script.commands[name];
    if (command) return { command, args: parts.slice(take), name };
  }
  return undefined;
}

function distance(a: string, b: string) {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = tmp;
    }
  }
  return dp[b.length];
}

/** The closest known command, for "did you mean" replies. */
export function suggest(script: TerminalScript, input: string) {
  const typed = words(input).slice(0, 2).join(' ');
  let best: string | undefined;
  let bestScore = Infinity;
  for (const name of Object.keys(script.commands)) {
    if (!script.commands[name].usage) continue;
    const score = distance(typed, name);
    if (score < bestScore) {
      best = name;
      bestScore = score;
    }
  }
  return bestScore <= Math.max(2, Math.floor(typed.length / 4))
    ? best
    : undefined;
}

export function run(
  script: TerminalScript,
  input: string,
  state: TerminalState,
  version: string,
  columns = 80
): CommandResult {
  const resolved = resolve(script, input);
  const url = (branch: string) => fill(script.urlPattern, { branch });
  // `burrow` alone is a command (it prints help), but `burrow nope` is not.
  const isBareProgram = resolved?.name === script.program && resolved.args.length > 0;
  if (resolved && !isBareProgram) {
    return resolved.command.run({
      args: resolved.args,
      state,
      version,
      url,
      columns
    });
  }
  const parts = words(input);
  const isSub = parts[0] === script.program;
  const template = isSub ? script.unknownSubcommand : script.notFound;
  const cmd = isSub ? parts.slice(1).join(' ') : parts[0];
  const hint = suggest(script, input);
  return {
    steps: [
      ...template.map((line) => ({
        type: 'line' as const,
        text: fill(line, { cmd: cmd ?? '' })
      })),
      ...(hint
        ? [{ type: 'line' as const, text: `{dim:did you mean} {b:${hint}}{dim:?}` }]
        : [])
    ]
  };
}

function commonPrefix(values: string[]) {
  if (values.length === 0) return '';
  let prefix = values[0];
  for (const value of values.slice(1)) {
    while (!value.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

export type Completion = {
  /** The new input value. */
  value: string;
  /** Candidates to list when the completion is ambiguous. */
  options: string[];
};

/** Tab completion for commands and branch names, like a shell. */
export function complete(
  script: TerminalScript,
  input: string,
  state: TerminalState
): Completion {
  const endsWithSpace = /\s$/.test(input);
  const parts = words(input);
  const current = endsWithSpace ? '' : (parts.pop() ?? '');
  const before = parts;
  const lead = before.length ? before.join(' ') + ' ' : '';

  let candidates: string[] = [];
  const resolved = before.length ? resolve(script, before.join(' ')) : undefined;
  if (resolved && resolved.args.length === 0 && resolved.command.completeBranch) {
    candidates = state.previews.map((preview) => preview.branch);
  } else {
    // Next word of any visible command that starts with what is typed so far.
    const names = Object.keys(script.commands).filter(
      (name) => script.commands[name].usage
    );
    const next = new Set<string>();
    for (const name of names) {
      const nameParts = name.split(' ');
      if (nameParts.length <= before.length) continue;
      if (nameParts.slice(0, before.length).join(' ') !== before.join(' '))
        continue;
      next.add(nameParts[before.length]);
    }
    candidates = [...next];
  }

  const matches = candidates.filter((c) => c.startsWith(current)).sort();
  if (matches.length === 0) return { value: input, options: [] };
  if (matches.length === 1) return { value: lead + matches[0] + ' ', options: [] };
  const prefix = commonPrefix(matches);
  if (prefix.length > current.length) {
    return { value: lead + prefix, options: [] };
  }
  return { value: input, options: matches };
}
