# Anom Artsy Design Specification

## Reference Analysis
The provided screenshot shows a **neon cyberpunk aesthetic** with:
- **Dark navy/black background** (#0a0e27 or similar)
- **Bright magenta/pink accent color** (#ff00ff or #ff1493)
- **Cyan/teal secondary accents** (#00ffff or similar)
- **Bold, high-contrast typography** with glowing effects
- **Geometric, angular layouts** with asymmetric positioning
- **Neon border highlights** and glowing text effects
- **Modular card-based sections** with bordered containers
- **Sharp, modern sans-serif typography** (appears to be a geometric font)

## Chosen Design Approach: Neon Cyberpunk

### Design Movement
**Cyberpunk Neon** — A futuristic aesthetic inspired by 80s/90s synthwave, combining high-contrast neon colors with dark backgrounds, geometric forms, and glowing typography. This style evokes digital rebellion, creative energy, and a sense of cutting-edge innovation.

### Core Principles
1. **High Contrast & Glow** — Bright neon colors (#ff00ff, #00ffff) against deep dark backgrounds create visual pop and energy
2. **Geometric Precision** — Sharp angles, clean lines, and modular layouts reflect digital/tech aesthetics
3. **Asymmetric Balance** — Avoid centered layouts; use offset positioning for visual interest and dynamism
4. **Glowing Typography** — Text shadows and color intensity create depth and emphasis

### Color Philosophy
- **Primary Background**: Deep navy/charcoal (#0a0e27, #1a1f3a)
- **Primary Accent**: Vibrant magenta (#ff00ff, #ff1493) — represents creative energy and rebellion
- **Secondary Accent**: Cyan/teal (#00ffff, #00d9ff) — represents technology and innovation
- **Tertiary**: Purple/violet accents for depth
- **Text**: White/light gray for maximum contrast
- **Borders**: Neon colors with subtle glow effects

### Layout Paradigm
- **Hero Section**: Large asymmetric layout with text on left, signup form on right
- **Feature Cards**: Grid-based but with offset/staggered positioning
- **Sections**: Full-width blocks with distinct background colors and neon borders
- **Navigation**: Minimal top bar with neon accents

### Signature Elements
1. **Neon Borders** — Glowing rectangular borders around cards and sections
2. **Glow Text Effects** — Text-shadow creating neon glow on headings
3. **Geometric Dividers** — Angular shapes and lines separating sections

### Interaction Philosophy
- **Hover States**: Buttons glow brighter, borders intensify
- **Smooth Transitions**: 200-300ms ease-out for color/glow changes
- **Click Feedback**: Subtle scale and glow intensification on button press

### Animation
- **Button Hover**: Glow intensifies, background color shifts
- **Text Entrance**: Fade-in with subtle glow animation (200ms)
- **Card Hover**: Border glow increases, subtle scale (1.02x)
- **Transitions**: All 200-250ms cubic-bezier(0.23, 1, 0.32, 1)

### Typography System
- **Display Font**: Bold, geometric sans-serif (e.g., "Space Mono", "Courier Prime", or similar monospace for tech feel)
- **Heading Font**: Bold sans-serif with letter-spacing for impact
- **Body Font**: Clean sans-serif (e.g., "Inter", "Roboto") for readability
- **Hierarchy**: Large display text (3-4rem) for main headings, 1.5-2rem for subheadings, 1rem for body

### Brand Essence
**One-line positioning**: A neon-lit community where artists amplify their identity and create social good through creative collaboration.

**Personality adjectives**: Bold, Innovative, Rebellious

### Brand Voice
- **Headlines**: Direct, energetic, empowering ("Identity, Amplified", "Join Anom Artsy")
- **CTAs**: Action-oriented and urgent ("Explore the Universe", "Sign Up with Google")
- **Microcopy**: Supportive and inclusive ("Join the Anom Artsy community")
- **Example lines**: 
  - "Identity, Amplified" (main tagline)
  - "Social Good Meets Creative Power" (subheading)

### Wordmark & Logo
- **Logo Concept**: A stylized "A" with neon glow, possibly with geometric elements or circuit-like patterns
- **Style**: Bold, angular, tech-forward
- **Color**: Magenta with cyan outline/glow effect

### Signature Brand Color
**Magenta (#ff00ff)** — Unmistakably Anom Artsy's ownable neon accent, used for primary CTAs, highlights, and brand identity.

---

## Design Tokens (CSS Variables)

```css
/* Colors */
--bg-dark: #0a0e27
--bg-darker: #050812
--bg-card: #1a1f3a
--neon-magenta: #ff00ff
--neon-cyan: #00ffff
--neon-purple: #9d00ff
--text-primary: #ffffff
--text-secondary: #b0b8d4
--border-color: #ff00ff

/* Typography */
--font-display: 'Space Mono', monospace
--font-heading: 'Inter', sans-serif
--font-body: 'Inter', sans-serif

/* Spacing */
--spacing-xs: 0.5rem
--spacing-sm: 1rem
--spacing-md: 1.5rem
--spacing-lg: 2rem
--spacing-xl: 3rem

/* Effects */
--glow-magenta: 0 0 20px rgba(255, 0, 255, 0.6)
--glow-cyan: 0 0 20px rgba(0, 255, 255, 0.6)
```

---

## Section Breakdown

### 1. Header/Navigation
- Minimal top bar with logo and nav links
- Neon border bottom
- Right-aligned CTA button

### 2. Hero Section
- Left: Large heading "Identity, Amplified" with subheading and description
- Right: Signup form with neon borders
- Dark background with subtle gradient

### 3. Social Good Section
- Centered heading with neon accent
- Description text
- CTA button

### 4. Features Grid
- 6 feature cards in 2x3 or 3x2 grid
- Each card has neon border and icon
- Hover effect: border glow intensifies

### 5. CTA Section
- Large centered heading
- CTA button

### 6. Footer
- Minimal footer with links

---

## Implementation Notes
- Use Tailwind CSS with custom color variables for neon colors
- Add CSS for glow effects using text-shadow and box-shadow
- Implement hover animations with transition utilities
- Ensure high contrast for accessibility
- Use monospace font for tech feel where appropriate
