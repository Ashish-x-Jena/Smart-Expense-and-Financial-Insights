---
name: Smart Expense & Financial Insights
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777e'
  outline-variant: '#c5c6cd'
  surface-tint: '#515f78'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#0d1c32'
  on-primary-container: '#76849f'
  inverse-primary: '#b9c7e4'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2a1700'
  on-tertiary-container: '#b87500'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b9c7e4'
  on-primary-fixed: '#0d1c32'
  on-primary-fixed-variant: '#39475f'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  metric-currency:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Manrope
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

### Narrative & Philosophy
This design system expresses quiet financial authority, analytical precision, and approachable clarity under the guiding principle: "Smarter expenditure creates smarter wealth." The visual language reconciles data-dense financial telemetry with stress-free executive control. Rather than overwhelming users with raw spreadsheets, the system frames personal cash flows as an empowering, intelligent narrative.

### Visual Style: Architectural FinTech Modernism
The aesthetic balances deep midnight tones with high-clarity alpine whites, producing an editorial, high-trust dashboard feel. 
- **Surface Depth:** Crisp, layered surface planes with micro-borders define visual containment.
- **Micro-Accents:** Strategic, high-signal emerald, amber, and coral indicators guide attention directly to fiscal variances without visual noise.
- **Sensory Balance:** Precision micro-interactions, crisp tabular numerals, and soft card architecture transform mundane budget reconciliation into an elevated, habitual financial review.

## Colors

### Hierarchy & Functional Assignment
- **Primary Navy (`#0A192F`):** Used for commanding display typography, primary action buttons, focused tab bar containers, and high-impact hero balance surfaces.
- **Secondary Teal & Emerald (`#0D9488` / `#10B981`):** Applied exclusively to positive financial delta indicators, savings goal advancements, income credits, and automated reconciliation success badges.
- **Tertiary Amber (`#F59E0B`):** Reserved for budget thresholds nearing limits (e.g., 80%-99% velocity), pending bank synchronizations, and predictive cash flow alerts.
- **Expense Rose / Coral (`#F43F5E`):** Distinctive, high-clarity signal for budget overruns, recurring subscriptions due, and net negative cash flow streams.
- **Canvas & Ice-Slate Neutrals (`#F8FAFC`, `#F1F5F9`, `#E2E8F0`):** Provide an anti-glare, pristine structural base for card modularity and data legibility across varying ambient lighting environments.

### WCAG 2.1 AA Compliance Rules
- White text (`#FFFFFF`) on Primary Navy (`#0A192F`) exceeds a 15:1 contrast ratio.
- All functional badges (Teal, Amber, Rose) must pair with darkened label counterparts (`#0F766E`, `#B45309`, `#BE123C`) when placed against tinted light surfaces to guarantee a minimum contrast ratio of 4.5:1.

## Typography

### Structural Pairings & Data Display
- **Space Grotesk (Headlines, Balances, Metrics):** Brings technical competence, modern geometric character, and structural authority to numeric data points and section headers.
- **Manrope (Body, Metadata, Input Fields):** Delivers neutral legibility, excellent rendering across mobile densities, and open apertures for instant scanning of merchant names and ledger entries.

### Numerical Typography Rules
- All numeric ledger amounts, currency totals, percentages, and timestamps must render with OpenType tabular figures (`font-variant-numeric: tabular-nums`) to prevent optical alignment shifts across streaming balance counters and transaction logs.

## Layout & Spacing

### Mobile-First Fluid Grid Philosophy
The application adheres to an adaptive mobile-first column framework optimized for single-thumb ergonomics and rapid data processing:
- **Mobile (<768px):** 4-column fluid layout with `margin: 1rem` (16px) and `gutter: 1rem` (16px). All critical action items, insights, and quick-add actions anchor to the bottom 40% of the viewport.
- **Tablet (768px - 1023px):** 8-column layout with `margin: 1.5rem` (24px). Insight modules split into side-by-side metric comparison clusters.
- **Desktop (>=1024px):** 12-column layout capped at an inner application container of `1280px` max-width with `margin: 2.5rem` (40px) and `gutter: 1.5rem` (24px). Left navigation rail is fixed; center telemetry and ledger panels flow responsively.

### Spacing Cadence
Component internal spacing strictly follows an 8pt system, using `space-xs` (4px) and `space-sm` (8px) for badge padding and metric subtext offsets, `space-md` (16px) for interior card padding, and `space-lg` (24px) for section separation.

## Elevation & Depth

### Atmospheric Tonal Layering
This design system avoids heavy drop shadows, instead creating visual depth through surface luminescence, low-contrast ghost borders, and crisp tonal offsets:

- **Base Layer (Level 0):** Background canvas rendered in `#F8FAFC` (Ice Gray).
- **Surface Level 1 (Cards, Ledger Items):** Flat `#FFFFFF` surface bounded by a crisp 1px outline of `rgba(100, 116, 139, 0.12)` (`#64748B` at 12% opacity).
- **Surface Level 2 (Floating Action Bars, Metric Flyouts):** Pure `#FFFFFF` resting on an ambient micro-shadow: `0 8px 24px -4px rgba(10, 25, 47, 0.06), 0 2px 6px -1px rgba(10, 25, 47, 0.04)`.
- **Level 3 (Modal Sheets & Transaction Parsers):** Tinted backdrop blur (`backdrop-filter: blur(12px)` over `rgba(10, 25, 47, 0.40)`) accompanied by an elevated bottom sheet bounded by a 1px top border of `rgba(255, 255, 255, 0.20)`.
- **Hero Accent Containers:** Deep Navy (`#0A192F`) cards utilize a subtle linear gradient fill toward `#112240` (135-degree angle) with an interior border overlay of `rgba(255, 255, 255, 0.08)`.

## Shapes

### Geometry & Radius Rules
The shape language relies on structured, friendly, and ergonomic curvature:
- **Cards & Primary Modules:** Configured with `rounded-2xl` (1rem / 16px to 1.5rem / 24px on hero containers) to soften high-density metrics and produce approachable content groupings.
- **Controls & Form Inputs:** Set to `rounded-lg` (0.5rem / 8px to 0.75rem / 12px) to communicate actionable intent without competing with cards.
- **Source Badges & Metric Pills:** Full circular pill rounding (`rounded-full` / 9999px) for provenance markers, transaction categorization tags, and currency delta indicators.

## Components

### 1. Buttons
- **Primary Action:** Solid Primary Navy (`#0A192F`) fill, `#FFFFFF` Space Grotesk text, height 48px on mobile for touch accessibility. Hover/Active state shifts to `#1E293B`.
- **Secondary Action:** Outlined style with a 1px `#CBD5E1` border, `#0A192F` typography, transparent background; active states trigger a 100% tint shift to `#F1F5F9`.
- **Destructive Action:** Ghost fill with `#F43F5E` text and an active background of `rgba(244, 63, 94, 0.08)`.

### 2. Transaction Origin & Status Pills
- **SMS Auto-Parsed:** Pale Slate fill (`#F1F5F9`), `#475569` text, paired with a subtle lightning bolt micro-icon.
- **Manual Entry:** Soft Teal tint (`rgba(13, 148, 136, 0.10)`), `#0F766E` text.
- **CSV Imported:** Neutral Ice tint (`#E2E8F0`), `#334155` text.
- **Dimensioning:** Padding `2px 8px`, typography `label-xs` uppercase, 9999px pill radius.

### 3. Metric Badges & Cash Flow Indicators
- **Positive Delta / Savings Target:** Pale Emerald container (`#ECFDF5`), bold Emerald numeral (`#059669`), prefixed with `+` or an upward trend arrow.
- **Budget Warning:** Soft Amber container (`#FEF3C7`), bold Amber numeral (`#D97706`).
- **Overrun / High Expense:** Soft Rose container (`#FFE4E6`), bold Coral numeral (`#E11D48`), prefixed with `-`.

### 4. Cards & Financial Modules
- **Hero Balance Card:** Deep Navy (`#0A192F`) container, white tabular numerals (`display-lg-mobile`), secondary balance figures in `#94A3B8`. Contains direct inline quick-action triggers (Transfer, Add Expense, Split).
- **Insight Card:** `#FFFFFF` canvas, `rounded-2xl` corners, 1px `#E2E8F0` border. Houses a Space Grotesk section headline, dynamic metric progress bars (with segmented warning bars), and conversational context (e.g., *"Dining spend is 14% higher than last Tuesday"*).

### 5. Input Fields
- Height 48px, background `#F8FAFC`, border 1px `#CBD5E1`, internal padding `0 16px`.
- Active focus state introduces a 1px border highlight of `#0D9488` alongside an outer glow ring of `0 0 0 3px rgba(13, 148, 136, 0.15)`. Labels sit top-aligned in `label-md` weight.

### 6. Lists & Ledger Rows
- Interactive height minimum 64px for one-tap mobile target compliance.
- Structure: Left-aligned categorical icon (circular `#F1F5F9` tile), merchant name (`title-md`) stacked over timestamp and source pill; right-aligned tabular transaction amount and remaining budget balance. Dividers use hairline `rgba(226, 232, 240, 0.60)`.