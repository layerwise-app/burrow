import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import type * as React from 'react';
import { Section } from '~/components/home/Section';
import { Box } from '~/components/tui/Box';
import { fillText, Markup } from '~/components/tui/Text';
import { home } from '~/content/home';
import { onPrefillTeamSize } from '~/lib/early-access';
import { submitSignup } from '~/lib/signup.functions';
import { validateSignup, type FieldErrors, type SignupInput } from '~/lib/signup-rules';
import { clsx as cn } from 'clsx';
import { siteConfig } from '~/site.config';

const content = home.earlyAccess;
const fields = content.fields;

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'done'; result: 'ok' | 'duplicate'; email: string }
  | { kind: 'rate_limited'; minutes: number }
  | { kind: 'failed' }
  | { kind: 'invalid' };

const EMPTY: SignupInput = { email: '', githubUsername: '', teamSize: '', website: '' };

export function EarlyAccess() {
  const [values, setValues] = useState<SignupInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const doneRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(
    () =>
      onPrefillTeamSize((teamSize) => {
        setValues((v) => ({ ...v, teamSize }));
        setErrors((e) => ({ ...e, teamSize: undefined }));
      }),
    []
  );

  useEffect(() => {
    if (status.kind === 'done') doneRef.current?.focus();
  }, [status.kind]);

  const set = (key: keyof SignupInput) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [key]: event.target.value };
    setValues(next);
    if (touched[key] || errors[key as keyof FieldErrors]) {
      const check = validateSignup(next);
      setErrors((prev) => ({
        ...prev,
        [key]: check.ok ? undefined : check.errors[key as keyof FieldErrors]
      }));
    }
    if (status.kind === 'failed' || status.kind === 'invalid') setStatus({ kind: 'idle' });
  };

  const blur = (key: 'email' | 'githubUsername') => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    if (!values[key]) return;
    const check = validateSignup(values);
    setErrors((prev) => ({ ...prev, [key]: check.ok ? undefined : check.errors[key] }));
  };

  const focusFirstError = (errs: FieldErrors) => {
    const order: (keyof FieldErrors)[] = ['email', 'githubUsername', 'teamSize'];
    const first = order.find((key) => errs[key]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLInputElement>(
      first === 'teamSize' ? 'input[name="teamSize"]' : `#ea-${first}`
    );
    el?.focus();
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status.kind === 'sending') return;
    const check = validateSignup(values);
    if (!check.ok) {
      setErrors(check.errors);
      setTouched({ email: true, githubUsername: true, teamSize: true });
      setStatus({ kind: 'invalid' });
      focusFirstError(check.errors);
      return;
    }
    setErrors({});
    setStatus({ kind: 'sending' });
    try {
      const result = await submitSignup({ data: values });
      if (result.status === 'ok' || result.status === 'duplicate') {
        setStatus({ kind: 'done', result: result.status, email: result.email });
      } else if (result.status === 'rate_limited') {
        setStatus({ kind: 'rate_limited', minutes: result.retryAfterMinutes });
      } else {
        setErrors(result.errors);
        setStatus({ kind: 'invalid' });
        focusFirstError(result.errors);
      }
    } catch {
      setStatus({ kind: 'failed' });
    }
  };

  const describe = (key: keyof FieldErrors, hint?: string) =>
    [errors[key] ? `ea-${key}-error` : null, hint].filter(Boolean).join(' ') || undefined;

  return (
    <Section id={content.id} label={content.label} title={content.title} lede={content.lede}>
      <div className='ea'>
        <Box
          title='burrow cloud --early-access'
          className='ea-box'
          bodyClassName='ea-body'
        >
          {status.kind === 'done' ? (
            <div className='ea-done' role='status'>
              <h3 ref={doneRef} tabIndex={-1} className='ea-done-title'>
                <span className='tone-ok' aria-hidden='true'>
                  ✓{' '}
                </span>
                {status.result === 'ok' ? content.messages.success.title : content.messages.duplicate.title}
              </h3>
              <p>
                {fillText(
                  status.result === 'ok' ? content.messages.success.body : content.messages.duplicate.body,
                  { email: status.email }
                )}
              </p>
              <p className='t-small'>
                <a className='link' href='#install'>
                  ↑ the install command
                </a>
                <span className='t-dim'> · </span>
                <Link className='link' to='/changelog'>
                  changelog
                </Link>
              </p>
            </div>
          ) : (
            <form ref={formRef} className='ea-form' onSubmit={onSubmit} noValidate>
              <div className={cn('ea-field', errors.email && 'has-error')}>
                <label htmlFor='ea-email' className='ea-label'>
                  {fields.email.label}
                </label>
                <span className='ea-input'>
                  <span className='ea-bracket' aria-hidden='true'>
                    [
                  </span>
                  <input
                    id='ea-email'
                    name='email'
                    type='email'
                    inputMode='email'
                    autoComplete='email'
                    required
                    placeholder={fields.email.placeholder}
                    value={values.email}
                    onChange={set('email')}
                    onBlur={blur('email')}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={describe('email')}
                  />
                  <span className='ea-bracket' aria-hidden='true'>
                    ]
                  </span>
                </span>
                {errors.email ? (
                  <p id='ea-email-error' className='ea-error'>
                    <span aria-hidden='true'>! </span>
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className={cn('ea-field', errors.githubUsername && 'has-error')}>
                <label htmlFor='ea-githubUsername' className='ea-label'>
                  {fields.github.label} <span className='t-dim'>({fields.github.hint})</span>
                </label>
                <span className='ea-input'>
                  <span className='ea-bracket' aria-hidden='true'>
                    [
                  </span>
                  <span className='ea-at' aria-hidden='true'>
                    @
                  </span>
                  <input
                    id='ea-githubUsername'
                    name='githubUsername'
                    type='text'
                    autoComplete='username'
                    autoCapitalize='off'
                    autoCorrect='off'
                    spellCheck={false}
                    maxLength={40}
                    placeholder={fields.github.placeholder}
                    value={values.githubUsername}
                    onChange={set('githubUsername')}
                    onBlur={blur('githubUsername')}
                    aria-invalid={errors.githubUsername ? true : undefined}
                    aria-describedby={describe('githubUsername')}
                  />
                  <span className='ea-bracket' aria-hidden='true'>
                    ]
                  </span>
                </span>
                {errors.githubUsername ? (
                  <p id='ea-githubUsername-error' className='ea-error'>
                    <span aria-hidden='true'>! </span>
                    {errors.githubUsername}
                  </p>
                ) : null}
              </div>

              <fieldset
                className={cn('ea-field ea-sizes', errors.teamSize && 'has-error')}
                role='radiogroup'
                aria-describedby={describe('teamSize')}
                aria-invalid={errors.teamSize ? true : undefined}
              >
                <legend className='ea-label'>{fields.teamSize.label}</legend>
                <div className='ea-options'>
                  {fields.teamSize.options.map((option) => (
                    <label key={option.value} className='ea-option'>
                      <input
                        type='radio'
                        name='teamSize'
                        value={option.value}
                        checked={values.teamSize === option.value}
                        onChange={set('teamSize')}
                      />
                      <span className='ea-radio' aria-hidden='true'>
                        {values.teamSize === option.value ? '(•)' : '( )'}
                      </span>
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.teamSize ? (
                  <p id='ea-teamSize-error' className='ea-error'>
                    <span aria-hidden='true'>! </span>
                    {errors.teamSize}
                  </p>
                ) : null}
              </fieldset>

              {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
              <div className='honeypot' aria-hidden='true'>
                <label htmlFor='ea-website'>Website</label>
                <input
                  id='ea-website'
                  name='website'
                  type='text'
                  tabIndex={-1}
                  autoComplete='off'
                  value={values.website}
                  onChange={set('website')}
                />
              </div>

              <div className='ea-submit'>
                <button className='btn' type='submit' disabled={status.kind === 'sending'}>
                  {status.kind === 'sending' ? content.sending : siteConfig.cta.submit}
                </button>
                <p className='t-note t-dim'>
                  {content.privacy.text}{' '}
                  <Link className='link' to='/privacy'>
                    {content.privacy.link}
                  </Link>
                </p>
              </div>

              <div className='ea-status' role='status' aria-live='polite'>
                {status.kind === 'rate_limited' ? (
                  <p className='tone-warn'>
                    <span aria-hidden='true'>! </span>
                    {fillText(content.messages.rateLimited, { minutes: String(status.minutes) })}
                  </p>
                ) : null}
                {status.kind === 'failed' ? (
                  <p className='tone-warn'>
                    <span aria-hidden='true'>! </span>
                    {content.messages.failed}
                  </p>
                ) : null}
                {status.kind === 'invalid' ? (
                  <p className='tone-warn'>
                    <span aria-hidden='true'>! </span>
                    {content.messages.invalid}
                  </p>
                ) : null}
              </div>
            </form>
          )}
        </Box>
        <CloudStatus status={status} />
      </div>
    </Section>
  );
}

/** `burrow cloud status`: what happens after signing up. Its first row follows the form. */
function CloudStatus({ status }: { status: Status }) {
  const copy = content.status;
  const done = status.kind === 'done' ? status : null;
  return (
    <Box
      title={copy.title}
      className='ea-status-box'
      bodyClassName='ea-status-body'
    >
      <p className='ea-status-cmd'>
        <span className='tone-hl' aria-hidden='true'>
          ${' '}
        </span>
        {copy.command}
      </p>
      <p>
        <Markup text={copy.heading} />
      </p>
      <dl className='ea-status-list'>
        <div>
          <dt>{copy.you.label}</dt>
          <dd>
            {done ? (
              <>
                <Markup text={done.result === 'ok' ? copy.you.ok : copy.you.duplicate} />{' '}
                <b className='ea-status-email'>{done.email}</b>
              </>
            ) : (
              <Markup text={copy.you.waiting} />
            )}
          </dd>
        </div>
        {copy.rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>
              <Markup text={row.value} />
            </dd>
          </div>
        ))}
      </dl>
      <p>
        <Markup text={copy.footer} />
      </p>
      <p className='ea-status-prompt' aria-hidden='true'>
        <span className='tone-hl'>$</span> <span className='term-cursor is-idle'> </span>
      </p>
    </Box>
  );
}
