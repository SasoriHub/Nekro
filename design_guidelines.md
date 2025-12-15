# NEKORA Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from premium streaming platforms (Netflix, Crunchyroll, Funimation) combined with modern anime aesthetic. Focus on immersive content presentation with dark theme and neon accents as specified.

## Core Design Principles

1. **Content-First Philosophy**: Maximize space for anime/manga content, minimize chrome
2. **Dark Theme Foundation**: Deep backgrounds with high-contrast neon accent elements
3. **Cinematic Experience**: Video player as the hero element with theatrical presentation
4. **Speed & Efficiency**: Instant feedback, minimal loading states, smooth transitions

## Typography System

**Font Families**:
- Primary: Inter (headers, UI elements) - via Google Fonts
- Secondary: Roboto (body text, descriptions) - via Google Fonts
- Japanese Text: Noto Sans JP (anime titles, when needed) - via Google Fonts

**Scale**:
- Hero Headlines: text-5xl to text-6xl, font-bold
- Section Headers: text-3xl to text-4xl, font-semibold
- Card Titles: text-lg to text-xl, font-medium
- Body Text: text-base, font-normal
- UI Labels: text-sm, font-medium

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing: gap-2, p-2 (8px)
- Standard spacing: gap-4, p-4, m-4 (16px)
- Section spacing: py-8, py-12, py-16 (32px, 48px, 64px)
- Large separations: mb-16, mt-16 (64px)

**Grid Systems**:
- Content Cards: grid-cols-2 md:grid-cols-4 lg:grid-cols-6 (poster cards)
- Episode List: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Container max-width: max-w-7xl mx-auto
- Edge padding: px-4 md:px-6 lg:px-8

## Header Component

**Structure** (sticky, backdrop-blur):
- Logo (left): NEKORA wordmark with anime-inspired styling
- Navigation (center): Horizontal menu with items: Аниме, Манга, Манхва, Онгоинги, Топ
- Search Bar (center-right): Expandable intelligent search with autocomplete dropdown
- User Actions (right): Login button or Profile avatar dropdown

**Specifications**:
- Height: h-16 md:h-20
- Padding: px-4 md:px-8
- Navigation items: gap-6, text-sm md:text-base
- Icons: Use Heroicons for search, user profile, menu (mobile)

## Video Player (Key Component)

**Layout**: 16:9 aspect ratio container with custom controls overlay

**Control Bar Elements**:
- Bottom bar with gradient fade-in on hover
- Play/Pause, Previous/Next Episode buttons (left)
- Progress bar (full width) with scrubbing, hover thumbnails
- Time display (current/total)
- Quality selector dropdown (720p, 1080p, Auto)
- Speed control (0.5x to 2x)
- Skip Intro/Outro buttons (appear contextually)
- Volume slider
- Settings gear icon
- PiP toggle
- Fullscreen toggle (right)

**Specifications**:
- Controls: h-14, backdrop-blur-md
- Buttons: w-10 h-10, rounded-lg
- Progress bar: h-1, hover:h-2 transition
- Tooltips on all controls
- Keyboard shortcuts overlay (show on "?" key)

## Content Card Components

**Anime/Manga Poster Cards**:
- Aspect ratio: 2:3 (poster orientation)
- Hover effect: scale-105, overlay with gradient
- Elements stack: Image → Title (text-base, truncate) → Rating badge → Status pill → Episode count
- Padding: p-0 (full bleed image), text content p-2
- Border radius: rounded-lg

**Episode Cards** (horizontal layout):
- Thumbnail: 16:9, rounded-lg
- Info stack: Episode number, title, duration, watch progress bar
- Grid spacing: gap-4
- Hover: Subtle brightness increase

## Page Layouts

### Homepage
1. **Featured Carousel**: Full-width hero with 3-5 featured anime, h-96 md:h-[500px]
   - Auto-rotating every 5s
   - Navigation dots bottom-center
   - Overlay gradient with title, description, Watch Now CTA

2. **Continue Watching**: Horizontal scroll row with progress indicators

3. **Personalized Sections**: "Recommended for You", "Trending Now", "New Releases"
   - Each section: mb-12
   - Section header: text-2xl mb-4
   - Horizontal scroll cards on mobile, grid on desktop

### Anime Detail Page
- **Hero Section**: Backdrop image (blurred) + poster (left) + info panel (right)
  - Info: Title, Rating, Year, Status, Genres (pills), Synopsis
  - CTAs: Watch Now (primary), Add to Favorites (secondary, icon button)
  
- **Episodes Section**: Grid of episode cards with thumbnails
- **Similar Titles**: Card carousel
- **Comments Section**: Threaded comments with user avatars

### Catalog Pages
- **Filter Sidebar** (left, collapsible on mobile): w-64
  - Sections: Genres (checkboxes), Year (range), Type, Status
  - Apply/Reset buttons at bottom
  
- **Results Grid** (right): flex-1
  - Sort dropdown (top-right): Rating, Latest, Popular
  - Card grid as described above
  - Infinite scroll or pagination

## User Profile Components

**Profile Header**:
- Avatar: w-24 h-24, rounded-full, border with neon accent
- Username: text-2xl
- Stats row: Watched, Favorites, Comments (text-center blocks)

**Tabs Navigation**: Favorites, History, Settings
- Border-b with active indicator slide animation

## Search Component

**Expanded State**:
- Dropdown with max-h-96, overflow-y-auto
- Results grouped: Anime, Manga, Manhwa
- Each result: Thumbnail (left) + Title + Quick info
- "View all results" footer link

## Footer Component

**Layout**: 4-column grid on desktop, stacked on mobile
- Column 1: NEKORA logo + tagline
- Column 2: Quick Links (О сайте, Лицензии, DMCA)
- Column 3: Legal (Пользовательское соглашение, Политика конфиденциальности)
- Column 4: Social icons (if applicable)
- Bottom bar: Copyright © NEKORA – Все права защищены

**Specifications**:
- Padding: py-12 px-4
- Column gap: gap-8
- Link styling: text-sm, hover:underline

## Interactive States

- Links: Subtle glow effect on hover
- Buttons: Scale down slightly on active (scale-95)
- Cards: Lift effect (shadow-xl) on hover
- Form inputs: Focus ring with neon accent
- Loading states: Skeleton screens with shimmer animation

## Icons

Use **Heroicons** throughout:
- Search, User, Menu, Play, Pause, Settings, Heart, Star, etc.
- Size: w-5 h-5 for UI, w-6 h-6 for emphasis

## Images

**Hero Images**: Yes, extensive use throughout
- Homepage carousel: 5 rotating featured anime backdrop images (1920x1080 min)
- Detail page backdrops: Blurred anime key visual
- Poster images: High-quality 2:3 ratio (500x750px recommended)
- Episode thumbnails: 16:9 screenshots (640x360px)
- User avatars: Square, various sizes

**Image Treatment**:
- Lazy loading for all content images
- Blur-up placeholder technique
- Backdrop images: blur-sm filter with dark overlay (gradient)

## Animations

**Minimal, Purposeful**:
- Page transitions: Fade in content (200ms)
- Carousel autoplay: Smooth crossfade (500ms)
- Card hovers: Quick scale (150ms ease-out)
- Video controls: Fade in/out (200ms)
- NO scroll-triggered animations, NO parallax

## Accessibility

- Focus indicators: 2px ring with high contrast
- ARIA labels on all icon buttons
- Keyboard navigation for video player
- Semantic HTML throughout
- Alt text for all images
- Form labels always visible

This design creates a premium, content-focused anime streaming experience with theatrical presentation and efficient navigation.