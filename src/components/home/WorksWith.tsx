import { Section } from '~/components/home/Section';
import { BoxTable } from '~/components/tui/BoxTable';
import { Text } from '~/components/tui/Text';
import { home } from '~/content/home';

const content = home.worksWith;

export function WorksWith() {
  const toolWidth = Math.max(...content.rows.map((row) => row.tool.length), content.columns[0].length) + 2;
  return (
    <Section id={content.id} label={content.label} title={content.title} lede={content.lede}>
      <BoxTable
        label={content.title}
        className='works'
        columns={[
          { header: content.columns[0], width: `${toolWidth}ch`, className: 'works-tool' },
          { header: content.columns[1], width: 'minmax(0, 1fr)' }
        ]}
        rows={content.rows.map((row) => [
          <strong key='tool'>{row.tool}</strong>,
          <Text key='does'>{row.does}</Text>
        ])}
      />
    </Section>
  );
}
