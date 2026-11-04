import { describe, expect, it } from 'vitest';
import { terminal } from '~/content/terminal';
import { complete, run } from './engine';
import { plainText } from './markup';
import type { CommandResult, TerminalState } from './types';

const VERSION = '9.9.9';
const output = (result: CommandResult) =>
  result.steps
    .map((step) => (step.type === 'line' ? plainText(step.text) : step.type))
    .join('\n');

function session() {
  let state: TerminalState = structuredClone(terminal.initialState);
  return (input: string) => {
    const result = run(terminal, input, state, VERSION);
    if (result.state) state = result.state;
    return { text: output(result), state };
  };
}

describe('terminal commands', () => {
  it('lists every documented command in help', () => {
    const { text } = session()('help');
    for (const command of Object.values(terminal.commands)) {
      if (command.usage) expect(text).toContain(plainText(command.usage));
    }
  });

  it('keeps state between commands: down removes a preview from ls', () => {
    const exec = session();
    expect(exec('burrow ls').text).toContain('exp-new-onboarding');
    exec('burrow down exp-new-onboarding');
    const after = exec('burrow ls');
    expect(after.text).not.toContain('exp-new-onboarding');
    expect(after.state.previews.map((p) => p.branch)).not.toContain('exp-new-onboarding');
  });

  it('adds the current branch on burrow up and prints its URL', () => {
    const exec = session();
    const { text, state } = exec('burrow up');
    expect(text).toContain('https://feat-checkout.');
    expect(state.previews.some((p) => p.branch === 'feat-checkout')).toBe(true);
    expect(exec('burrow ls').text).toContain('feat-checkout');
  });

  it('answers unknown input helpfully', () => {
    const exec = session();
    expect(exec('burow ls').text).toMatch(/command not found: burow/);
    expect(exec('burrow lss').text).toMatch(/did you mean burrow ls\?/);
    expect(exec('burrow deploy').text).toContain('deploy');
  });
});

describe('narrow terminals (phones)', () => {
  const PHONE = 44;
  const widest = (input: string, state = terminal.initialState) =>
    Math.max(
      ...run(terminal, input, state, '2.4.0', PHONE).steps.map((step) =>
        step.type === 'line' ? plainText(step.text).length : 0
      )
    );

  it('fits the intro, help, ls, and logs on one line each', () => {
    expect(widest('burrow up')).toBeLessThanOrEqual(PHONE);
    expect(widest('help')).toBeLessThanOrEqual(PHONE);
    expect(widest('burrow ls')).toBeLessThanOrEqual(PHONE);
    for (const preview of terminal.initialState.previews) {
      expect(widest(`burrow logs ${preview.branch}`)).toBeLessThanOrEqual(PHONE);
    }
  });

  it('keeps the wide layout when there is room', () => {
    const ls = run(terminal, 'burrow ls', terminal.initialState, '2.4.0', 100);
    expect(output(ls)).toContain('HOST');
  });
});

describe('tab completion', () => {
  const state = terminal.initialState;

  it('completes command words', () => {
    expect(complete(terminal, 'bur', state).value).toBe('burrow ');
    expect(complete(terminal, 'burrow sh', state).value).toBe('burrow share ');
  });

  it('completes branch names from the current state', () => {
    expect(complete(terminal, 'burrow down exp', state).value).toBe(
      'burrow down exp-new-onboarding '
    );
  });

  it('lists options when the completion is ambiguous', () => {
    const result = complete(terminal, 'burrow l', state);
    expect(result.options).toEqual(['logs', 'ls']);
  });
});
