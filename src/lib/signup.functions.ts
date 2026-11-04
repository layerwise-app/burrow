import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';
import { siteConfig } from '~/site.config';
import { toSignupInput, type SignupInput, type SignupResult } from '~/lib/signup-rules';
import { processSignup } from '~/server/signup-service';
import { d1SignupStore } from '~/server/signup-store';

/** The early-access form posts here. Validation happens in `processSignup`. */
export const submitSignup = createServerFn({ method: 'POST' })
  // Only coerces the shape to strings; processSignup applies the real rules.
  .validator((data: SignupInput) => toSignupInput(data))
  .handler(async ({ data }): Promise<SignupResult> => {
    const ip =
      getRequestHeader('cf-connecting-ip') ??
      getRequestHeader('x-forwarded-for')?.split(',')[0]?.trim() ??
      null;

    return processSignup(data, {
      store: d1SignupStore,
      ip,
      now: new Date(),
      ownerEmail: siteConfig.ownerEmail,
      sendEmail: async (message) => {
        const { error } = await env.EMAIL.send(message);
        if (error) {
          console.warn(`[signup] owner email: ${error.code} ${error.message}`);
          return { ok: false };
        }
        return { ok: true };
      }
    });
  });
