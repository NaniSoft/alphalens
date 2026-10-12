import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { JsonLd } from '@/components/json-ld';
import { SiteChrome } from '@/components/SiteChrome';
import { Landing } from '@/components/Landing';

const SITE_URL = 'https://alphalens.nanisoft.com';

const DESCRIPTION =
  'AlphaLens captures the full NSE option chain every market minute and conforms it into one ' +
  'research-ready feed. A live data layer, an approved contract and a designed research ' +
  'pipeline, labelled honestly.';

/**
 * The landing's own metadata.
 *
 * The document set named the site, and the home page shipped none of its own, so the
 * one address every other route's canonical is measured against was the one route
 * carrying no canonical claim at all.
 */
export const metadata: Metadata = {
  title: { absolute: 'AlphaLens: quantitative trading research for the Indian market' },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'AlphaLens',
    locale: 'en',
    title: 'AlphaLens: quantitative trading research for the Indian market',
    description: DESCRIPTION,
  },
};

/**
 * Structured data for the landing.
 *
 * A WebSite node relating this address to the family, and a SoftwareApplication node
 * naming what the product is. There is no rating and no offer on either: the page
 * itself says the research pipeline is designed and not built, and structured data
 * that claimed more than the page would be the one claim a reader cannot check
 * against the page.
 */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'AlphaLens',
      url: SITE_URL,
      description: DESCRIPTION,
      inLanguage: 'en',
      publisher: { '@id': 'https://nanisoft.com/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#application`,
      name: 'AlphaLens',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
      description: DESCRIPTION,
      producer: { '@type': 'Organization', name: 'NaniSoft', url: 'https://nanisoft.com' },
    },
  ],
};

export default function HomePage(): ReactElement {
  return (
    <SiteChrome>
      <JsonLd data={JSON_LD} />
      <Landing />
    </SiteChrome>
  );
}
