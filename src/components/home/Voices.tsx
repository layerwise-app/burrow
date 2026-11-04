import { Section } from '~/components/home/Section';
import { Box } from '~/components/tui/Box';
import { Text } from '~/components/tui/Text';
import { home } from '~/content/home';

const content = home.voices;

export function Voices() {
  return (
    <Section id={content.id} label={content.label} title={content.title} lede={content.lede}>
      <Box title='~/voices' aside={<span className='t-dim'>{content.quotes.length} files</span>} bodyClassName='voices-body'>
        <ul className='voices'>
          {content.quotes.map((quote) => (
            <li key={quote.file} className='voice'>
              <p className='voice-cmd' aria-hidden='true'>
                <span className='tone-hl'>$</span> cat voices/{quote.file}
              </p>
              <figure>
                <blockquote className='voice-text'>
                  <p>
                    <Text>{quote.text}</Text>
                  </p>
                </blockquote>
                <figcaption className='voice-by'>
                  <span className='t-dim' aria-hidden='true'>
                    --{' '}
                  </span>
                  <span className='voice-name'>{quote.name}</span>
                  <br />
                  <span className='voice-team t-dim'>{quote.team}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Box>
    </Section>
  );
}
