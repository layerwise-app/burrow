// Privacy and Terms copy. Short and plain, for a fictional company; replace it
// with your own before using this site for a real product.

export type LegalPage = {
  title: string;
  description: string;
  updated: string;
  /** Man-page sections: a heading, then paragraphs or list items. */
  sections: { heading: string; body: string[]; list?: string[] }[];
};

export const privacy: LegalPage = {
  title: 'Privacy',
  description:
    'What this site and the burrow CLI collect, why, and how to have it deleted. Short version: very little.',
  updated: '2026-10-13',
  sections: [
    {
      heading: 'SUMMARY',
      body: [
        'This site keeps what you type into the early-access form and nothing else about you. The burrow CLI sends no telemetry.'
      ]
    },
    {
      heading: 'THE FORM',
      body: ['When you ask for Burrow Cloud early access, we store:'],
      list: [
        'your email address, to tell you when a seat opens',
        'your GitHub username, if you give one, to set up your team',
        'your team size, to plan capacity',
        'the time you signed up'
      ]
    },
    {
      heading: 'RATE LIMITS',
      body: [
        'To stop abuse, the form allows five submissions per hour from one network. We never store your IP address: we keep a salted one-way hash of it for a day, then delete it.'
      ]
    },
    {
      heading: 'COOKIES',
      body: [
        'This site sets no cookies and runs no analytics or advertising scripts. The terminal on the home page runs entirely in your browser; nothing you type there is sent anywhere.'
      ]
    },
    {
      heading: 'THE CLI',
      body: [
        'The burrow CLI does not phone home. It talks to the servers you point it at, and to Burrow Cloud only if you use Burrow Cloud.'
      ]
    },
    {
      heading: 'YOUR DATA',
      body: [
        'We keep sign-ups until Burrow Cloud leaves early access, then delete the ones that never became accounts. To have your entry removed sooner, ask through the form and we will delete it and confirm by email.'
      ]
    },
    {
      heading: 'WHO WE ARE',
      body: [
        'Tunnelworks B.V., Rotterdam, the Netherlands. We are a fictional company; this page belongs to a website template.'
      ]
    }
  ]
};

export const terms: LegalPage = {
  title: 'Terms',
  description:
    'The terms for using this site, the open-source burrow CLI, and the Burrow Cloud early access, in plain language.',
  updated: '2026-10-13',
  sections: [
    {
      heading: 'THE CLI',
      body: [
        'The burrow CLI is open source under the MIT license. The license that ships with it is the whole agreement: use it, change it, ship it, no warranty.'
      ]
    },
    {
      heading: 'EARLY ACCESS',
      body: [
        'Burrow Cloud is in early access. It is free while it is, it may change or break, and we may pause it to fix things. Do not run anything on it you could not rebuild from your own repository.'
      ]
    },
    {
      heading: 'PRICING',
      body: [
        'Team pricing starts when Burrow Cloud opens. Nobody is billed without agreeing to a plan first, and you can leave at any time.'
      ]
    },
    {
      heading: 'FAIR USE',
      body: ['Please do not use Burrow or this site to:'],
      list: [
        'host anything illegal, or anything that attacks other systems',
        'mine cryptocurrency on preview environments',
        'get around rate limits or someone else’s access controls'
      ]
    },
    {
      heading: 'LIABILITY',
      body: [
        'We work hard to keep previews up and data safe, but we cannot promise it. To the extent the law allows, Tunnelworks is not liable for lost data or lost time from using early access.'
      ]
    },
    {
      heading: 'CHANGES',
      body: [
        'If these terms change, we update the date at the top of this page and, for meaningful changes, email everyone on the early-access list first.'
      ]
    },
    {
      heading: 'LAW',
      body: [
        'Dutch law applies. Tunnelworks B.V. is a fictional company in Rotterdam; this page belongs to a website template.'
      ]
    }
  ]
};
