import { Section } from '~/components/home/Section';
import { Box } from '~/components/tui/Box';
import { BoxTable } from '~/components/tui/BoxTable';
import { home } from '~/content/home';
import { prefillTeamSize } from '~/lib/early-access';
import { siteConfig } from '~/site.config';

const content = home.pricing;
type Plan = (typeof content.plans)[number];

function PlanCta({ plan }: { plan: Plan }) {
  if ('cta' in plan && plan.cta === 'primary') {
    return (
      <a className='btn' href={siteConfig.cta.formAnchor}>
        {siteConfig.cta.primary}
      </a>
    );
  }
  if ('cta' in plan && plan.cta === 'enterprise') {
    return (
      <a
        className='btn'
        href={siteConfig.cta.formAnchor}
        onClick={() => prefillTeamSize('51+')}
      >
        {siteConfig.cta.enterprise}
      </a>
    );
  }
  if ('footer' in plan) {
    return (
      <p className='t-small'>
        <a className='link' href={plan.footerHref}>
          {plan.footer}
        </a>
      </p>
    );
  }
  return null;
}

function Price({ plan }: { plan: Plan }) {
  return (
    <p className='plan-price'>
      <span className='plan-amount'>{plan.price}</span>
      <span className='plan-unit t-dim'> {plan.unit}</span>
    </p>
  );
}

function Features({ plan }: { plan: Plan }) {
  return (
    <ul className='plan-features'>
      {plan.features.map((feature) => (
        <li key={feature}>
          <span className='tone-ok' aria-hidden='true'>
            ✓{' '}
          </span>
          {feature}
        </li>
      ))}
    </ul>
  );
}

export function Pricing() {
  return (
    <Section id={content.id} label={content.label} title={content.title} lede={content.lede}>
      <div className='pricing-table'>
        <BoxTable
          label='Plans'
          columns={content.plans.map((plan) => ({
            header: <span className='plan-name'>{plan.name}</span>,
            width: 'minmax(0, 1fr)'
          }))}
          rows={[
            content.plans.map((plan) => <Price key={plan.name} plan={plan} />),
            content.plans.map((plan) => <Features key={plan.name} plan={plan} />),
            content.plans.map((plan) => <PlanCta key={plan.name} plan={plan} />)
          ]}
          rowClassName={(i) => (i === 2 ? 'plan-cta-row' : undefined)}
        />
      </div>
      <ul className='pricing-stack'>
        {content.plans.map((plan) => (
          <li key={plan.name}>
            <Box title={<span className='plan-name'>{plan.name}</span>}>
              <Price plan={plan} />
              <Features plan={plan} />
              <div className='plan-cta'>
                <PlanCta plan={plan} />
              </div>
            </Box>
          </li>
        ))}
      </ul>
      <p className='pricing-note t-small t-dim'>{content.note}</p>
    </Section>
  );
}
