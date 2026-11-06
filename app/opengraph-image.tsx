import { ImageResponse } from 'next/og';

/**
 * The share card.
 *
 * **Generated once, at build.** Under `output: 'export'` a metadata route has to be
 * told it is static, and the image is painted from constants with no request to be
 * dynamic with. Without a card, every link to this site shared into a chat client
 * renders as bare text.
 *
 * **The card is the site's own default mode.** AlphaLens opens dark, on the gold
 * pack, so the card is the dark gold theme's own values written out as literals: an
 * image is painted once into a bitmap, there is no cascade and no `data-pack`, and
 * a token read here would resolve to the neutral base and contradict the page it
 * previews. The chips are the family's product packs, and the spectrum bar stands
 * for Prism, whose mark owns no single hue.
 */
export const alt = 'AlphaLens: quantitative trading research for the Indian market'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export const dynamic = 'force-static'

const GROUND = '#1a1815'
const INK = '#f0ebec'
const MUTED = '#d0c8ca'
const HAIRLINE = '#47403f'
const GOLD = '#edc47d'
const CYAN = '#7fdaf0'
const MINT = '#9ddcad'
const SKY = '#9bd1ff'

const SPECTRUM =
  'linear-gradient(90deg, #ec88a0 0%, #bc97e7 25%, #73bf88 50%, #6cb2eb 75%, #e4965e 100%)'

/**
 * The mark, as the card draws it: the lens bending the whole market to one
 * point, painted in the card's own literals and embedded as a data URI, because
 * the renderer paints a bitmap and cannot resolve cascade classes.
 */
const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="150" height="150" fill="none">
  <g stroke-width="2.5" stroke-linecap="round" fill="none">
    <path d="M4 12 L17.5 12" stroke="#f0ebec"/>
    <path d="M4 20 L17.5 20" stroke="#f0ebec"/>
    <path d="M17.5 12 L28 16" stroke="#edc47d"/>
    <path d="M17.5 20 L28 16" stroke="#edc47d"/>
  </g>
  <circle cx="17.5" cy="16" r="6.5" fill="none" stroke="#edc47d" stroke-width="2.5"/>
  <circle cx="28" cy="16" r="1.9" fill="#ffeac7"/>
</svg>`
const MARK_URI = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString('base64')}`

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: GROUND,
          color: INK,
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', fontSize: 26, letterSpacing: 2, color: GOLD }}>
              NANISOFT · QUANT RESEARCH
            </div>
            <img src={MARK_URI} width={140} height={140} style={{ opacity: 0.9 }} />
          </div>
          <div style={{ display: 'flex', fontSize: 110, fontWeight: 600, letterSpacing: -3, lineHeight: 1 }}>
            AlphaLens
          </div>
          <div style={{ display: 'flex', fontSize: 36, color: MUTED, lineHeight: 1.35, maxWidth: 920 }}>
            See the whole market, minute by minute. Intelligence, simulation, and research.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `2px solid ${HAIRLINE}`,
            paddingTop: 32,
          }}
        >
          <div style={{ display: 'flex', fontSize: 26, color: MUTED }}>alphalens.nanisoft.com</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[SKY, CYAN, MINT, GOLD].map((colour) => (
                <div
                  key={colour}
                  style={{ display: 'flex', width: 30, height: 30, borderRadius: 15, background: colour }}
                />
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                width: 54,
                height: 30,
                borderRadius: 15,
                background: SPECTRUM,
              }}
            />
          </div>
        </div>
      </div>
    ),
    size,
  )
}
