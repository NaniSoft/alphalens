// Typography/DisplayTitle ride the site's client boundary (components/prism-client.tsx).
import { DisplayTitle, Paragraph, Text } from '@/components/prism-client';

export default function HomePage() {
  return (
    <section className="placeholder-hero">
      <Text className="placeholder-kicker" type="secondary">
        NaniSoft · scaffold placeholder
      </Text>
      <DisplayTitle>AlphaLens</DisplayTitle>
      <Paragraph className="placeholder-lede">Quantitative trading research for the Indian market.</Paragraph>
      <Text type="secondary">
        Placeholder deploy — the real landing, docs, and blog land with this site&rsquo;s build ticket.
      </Text>
    </section>
  );
}
