import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type * as React from 'react';
import { TERMINAL_INPUT_ID } from '~/components/layout/navigation';
import { Box } from '~/components/tui/Box';
import { Markup } from '~/components/tui/Text';
import { terminal as script } from '~/content/terminal';
import { latestRelease } from '~/lib/changelog';
import {
  createClock,
  prefersReducedMotion,
  useInView,
  usePageVisible,
  useReducedMotion,
  useSeen
} from '~/lib/motion';
import { complete, run } from '~/lib/terminal/engine';
import type { Step, TerminalState } from '~/lib/terminal/types';

type Line = { id: number; text: string; input?: string };

const MAX_LINES = 240;
const BAR_WIDTH = 24;
const EIGHTHS = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉'];

function bar(progress: number) {
  const total = Math.round(progress * BAR_WIDTH * 8);
  const full = Math.floor(total / 8);
  const part = EIGHTHS[total % 8];
  const rest = BAR_WIDTH - full - (part ? 1 : 0);
  return `{bar:${'█'.repeat(full)}${part}}{dim:${'░'.repeat(Math.max(0, rest))}}`;
}

function progressLine(label: string, progress: number) {
  const pct = `${Math.round(progress * 100)}%`.padStart(4);
  return `${label}${bar(progress)} ${progress >= 1 ? '{ok:' + pct + '}' : pct}`;
}

/** Characters per line inside the terminal, so commands can fit the screen. */
function measureColumns(screen: HTMLElement | null) {
  if (!screen) return 80;
  const probe = document.createElement('span');
  probe.textContent = '0'.repeat(20);
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
  screen.appendChild(probe);
  const ch = probe.getBoundingClientRect().width / 20;
  probe.remove();
  const style = getComputedStyle(screen);
  const width = screen.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  return ch > 0 ? Math.floor(width / ch) : 80;
}

/** The working demo terminal: types `burrow up` on load, then it's yours. */
export function Terminal() {
  const version = latestRelease.version;
  const [lines, setLines] = useState<Line[]>(() =>
    script.welcome.map((text, id) => ({ id, text }))
  );
  const [live, setLive] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [caret, setCaret] = useState(0);
  const [typed, setTyped] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);

  const stateRef = useRef<TerminalState>(script.initialState);
  const historyRef = useRef<string[]>([]);
  const historyIndex = useRef<number | null>(null);
  const draftRef = useRef('');
  const idRef = useRef(script.welcome.length);
  const instantRef = useRef(false);
  const cancelRef = useRef<AbortController | null>(null);
  const queuedRef = useRef<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const inView = useInView(rootRef);
  const visible = usePageVisible();
  // The intro waits until the terminal is at least half on screen, so nobody
  // scrolls down to output that already finished. Reduced motion shows the
  // finished output right away.
  const seen = useSeen(rootRef, 0.5);
  const reduced = useReducedMotion();
  const startIntro = seen || reduced;
  const activeRef = useRef(false);
  activeRef.current = inView && visible;

  const push = useCallback((text: string, inputText?: string) => {
    const id = idRef.current++;
    setLines((prev) => {
      const next = [...prev, { id, text, input: inputText }];
      return next.length > MAX_LINES ? next.slice(-MAX_LINES) : next;
    });
  }, []);

  // The prompt floats under the output and moves with a transform, so new
  // output never shifts the layout. The log keeps room for it at the bottom.
  const placePrompt = useCallback(() => {
    const log = logRef.current;
    const prompt = promptRef.current;
    if (!log || !prompt) return;
    const screen = prompt.offsetParent ?? log;
    prompt.classList.add('is-floating');
    const height = prompt.getBoundingClientRect().height;
    if (log.style.paddingBottom !== `${height}px`) log.style.paddingBottom = `${height}px`;
    // Measured from the top of the screen's padding box, where `top: 0` is.
    const top = screen.getBoundingClientRect().top + screen.clientTop - screen.scrollTop;
    const y = log.getBoundingClientRect().bottom - top - height;
    prompt.style.transform = `translateY(${y}px)`;
  }, []);

  // Keep the newest output in view inside the terminal (never the page).
  useLayoutEffect(() => {
    placePrompt();
    const screen = screenRef.current;
    if (screen) screen.scrollTop = screen.scrollHeight;
  }, [lines, live, input, typed, busy, placePrompt]);

  // Lines rewrap when the terminal changes width.
  useEffect(() => {
    const screen = screenRef.current;
    if (!screen || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => placePrompt());
    observer.observe(screen);
    return () => observer.disconnect();
  }, [placePrompt]);

  const playSteps = useCallback(
    async (steps: Step[], signal: AbortSignal) => {
      const clock = createClock(() => activeRef.current, signal);
      const wait = async (ms: number) => {
        if (!instantRef.current) await clock(ms);
        if (signal.aborted) throw signal.reason;
      };
      for (const step of steps) {
        if (signal.aborted) return;
        if (step.type === 'clear') {
          setLines([]);
          continue;
        }
        if (step.type === 'line') {
          await wait(step.delay ?? 0);
          push(step.text);
          continue;
        }
        // Progress bar: redraw one line until it is full.
        let elapsed = 0;
        while (elapsed < step.duration && !instantRef.current) {
          setLive(progressLine(step.label, elapsed / step.duration));
          await wait(32);
          elapsed = Math.min(step.duration, elapsed + 32);
        }
        setLive(null);
        push(progressLine(step.label, 1));
        if (step.done) push(step.done);
      }
    },
    [push]
  );

  const execute = useCallback(
    async (raw: string) => {
      push(script.prompt, raw);
      const trimmed = raw.trim();
      if (!trimmed) return;
      const history = historyRef.current;
      if (history[history.length - 1] !== trimmed) history.push(trimmed);
      historyIndex.current = null;

      const result = run(script, trimmed, stateRef.current, version, measureColumns(screenRef.current));
      if (result.state) stateRef.current = result.state;

      const controller = new AbortController();
      cancelRef.current = controller;
      setBusy(true);
      try {
        await playSteps(result.steps, controller.signal);
      } catch {
        // Cancelled with ctrl+c.
      } finally {
        setLive(null);
        setBusy(false);
        instantRef.current = prefersReducedMotion();
        cancelRef.current = null;
      }
      const queued = queuedRef.current;
      if (queued !== null) {
        queuedRef.current = null;
        setInput('');
        setCaret(0);
        await execute(queued);
      }
    },
    [playSteps, push, version]
  );

  // The intro: type the command at human speed, then stream its output.
  useEffect(() => {
    if (!startIntro) return;
    // Someone already used the terminal (it was focused with `/`): skip it.
    if (historyRef.current.length > 0) return;
    const controller = new AbortController();
    const clock = createClock(() => activeRef.current, controller.signal);
    const wait = async (ms: number) => {
      if (!instantRef.current) await clock(ms);
      if (controller.signal.aborted) throw controller.signal.reason;
    };
    const command = script.introCommand;

    (async () => {
      if (prefersReducedMotion()) instantRef.current = true;
      setBusy(true);
      try {
        await wait(650);
        for (let i = 1; i <= command.length; i++) {
          setTyped(command.slice(0, i));
          await wait(command[i - 1] === ' ' ? 140 : 55 + Math.random() * 75);
        }
        await wait(380);
      } catch {
        return;
      }
      if (controller.signal.aborted) return;
      setTyped(null);
      setBusy(false);
      await execute(command);
    })();

    return () => controller.abort();
    // Runs once, when the terminal is first seen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startIntro]);

  const updateCaret = () => {
    const el = inputRef.current;
    if (el) setCaret(el.selectionStart ?? el.value.length);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const el = event.currentTarget;
    if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      if (busy && cancelRef.current) {
        cancelRef.current.abort();
        push('{dim:^C}');
      } else {
        push(script.prompt, `${input}^C`);
        setInput('');
        setCaret(0);
      }
      return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      setLines([]);
      return;
    }
    // Typing during the intro or a running command fast-forwards it.
    if (busy && (event.key.length === 1 || event.key === 'Enter')) {
      instantRef.current = true;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (busy) {
        queuedRef.current = input;
        return;
      }
      const raw = input;
      setInput('');
      setCaret(0);
      void execute(raw);
      return;
    }
    if (event.key === 'Tab' && !event.shiftKey && input.trim() !== '') {
      const result = complete(script, input, stateRef.current);
      if (result.value !== input || result.options.length > 0) {
        event.preventDefault();
        if (result.options.length > 0) {
          push(script.prompt, input);
          push(result.options.map((o) => `{b:${o}}`).join('   '));
        }
        setInput(result.value);
        setCaret(result.value.length);
        requestAnimationFrame(() =>
          el.setSelectionRange(result.value.length, result.value.length)
        );
      }
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const history = historyRef.current;
      if (history.length === 0) return;
      event.preventDefault();
      let index = historyIndex.current;
      if (event.key === 'ArrowUp') {
        if (index === null) {
          draftRef.current = input;
          index = history.length - 1;
        } else {
          index = Math.max(0, index - 1);
        }
      } else if (index !== null) {
        index = index + 1;
        if (index >= history.length) index = null;
      }
      historyIndex.current = index;
      const value = index === null ? draftRef.current : history[index];
      setInput(value);
      setCaret(value.length);
      requestAnimationFrame(() => el.setSelectionRange(value.length, value.length));
    }
  };

  const focusInput = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  // `/` from anywhere on the site, or arriving at /#terminal, focuses the prompt.
  useEffect(() => {
    if (window.location.hash === '#terminal') {
      rootRef.current?.scrollIntoView({ block: 'center' });
      inputRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const shown = typed ?? input;
  const cursorAt = typed !== null ? typed.length : Math.min(caret, input.length);
  const before = shown.slice(0, cursorAt);
  const under = shown.slice(cursorAt, cursorAt + 1) || ' ';
  const after = shown.slice(cursorAt + 1);
  const cursorClass =
    typed !== null || focused
      ? `term-cursor${typed !== null ? ' is-solid' : ''}`
      : 'term-cursor is-idle';

  return (
    <div ref={rootRef} className={activeRef.current ? 'terminal' : 'terminal is-paused'}>
      <Box
        title={script.title}
        aside={<span className='t-dim'>demo · runs in your browser</span>}
        bodyClassName='term-body'
      >
        {/* The frame holds the padding, so the scrolling area shows whole lines
            only and no line sits half under the title. */}
        <div className='term-frame' onClick={focusInput}>
          <div ref={screenRef} className='term-screen thin-scroll'>
            <div
              ref={logRef}
              role='log'
              aria-live='polite'
              aria-relevant='additions'
              aria-busy={busy}
              aria-label='Terminal output'
            >
              {lines.map((line) => (
                <div key={line.id} className='term-line'>
                  <Markup text={line.text} />
                  {line.input !== undefined ? <span>{line.input}</span> : null}
                </div>
              ))}
              {live !== null ? (
                // Redrawn as a new line each frame, so the filling bar never counts as layout shift.
                <div key={live} className='term-line' aria-hidden='true'>
                  <Markup text={live} />
                </div>
              ) : null}
            </div>
            <div ref={promptRef} className='term-line term-prompt'>
              <span aria-hidden='true'>
                {/* While a command runs there is no prompt, only the cursor. */}
                {busy && typed === null ? null : <Markup text={script.prompt} />}
                {busy && typed === null ? null : before}
                {/* A new cursor per position: it moves by appearing, not by shifting. */}
                <span key={`${busy && typed === null ? 'busy' : 'at'}-${cursorAt}`} className={cursorClass}>
                  {busy && typed === null ? ' ' : under}
                </span>
                {busy && typed === null ? null : after}
              </span>
              <input
                ref={inputRef}
                id={TERMINAL_INPUT_ID}
                className='term-input'
                aria-label='Type a burrow command, then press Enter. Try help.'
                autoComplete='off'
                autoCapitalize='off'
                autoCorrect='off'
                spellCheck={false}
                enterKeyHint='send'
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setCaret(e.target.selectionStart ?? e.target.value.length);
                  historyIndex.current = null;
                }}
                onKeyDown={onKeyDown}
                onKeyUp={updateCaret}
                onSelect={updateCaret}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
}
