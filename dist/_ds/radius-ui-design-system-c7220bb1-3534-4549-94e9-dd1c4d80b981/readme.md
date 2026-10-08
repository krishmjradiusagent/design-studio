# Radius UI Design System

**Radius** is an AI real-estate brokerage CRM for agents, team leads, transaction coordinators, and auditors. It is a dense, professional workflow tool — not a consumer app or a marketing site. **Mel** is the AI assistant woven throughout the product. This design system, **Radius UI 3.0**, is the shadcn-derived component foundation the product is built on, themed and documented for Radius.

## Sources (ground truth)

This system was reconstructed **1:1** from the materials the team provided. It does not assume the reader has access; the references are recorded here in case they do.

- **Figma:** `Radius UI 3.0.fig` (mounted). 80 pages, 1903 component families, 870 Figma Variables across 6 collections (TailwindCSS, Theme, Mode, Custom, Icon Library, Ungrouped), plus icon-library pages (Lucide, Tabler, HugeIcons, Phosphor, Remix) and a Blocks-Official page of full screens.
- **Codebase:** `Radius UI 3.0/` — a prior full materialization (`components/*.jsx` + `.d.ts`, `fig-tokens.css`, official logo assets). Token values here were copied verbatim from `fig-tokens.css`; component metrics were read from the real `Button.jsx`, `Badge.jsx`, `Input.jsx`, etc.
- **Brand assets:** Radius wordmarks (`assets/logo-wordmark-*`), mark (`assets/logo-mark-*`), and the **Mel** icon with its signature indigo→coral glow gradient (`assets/mel-icon.svg`).
- **Brand & product notes:** Biju's "Radius UI 3.0" design notes (personality, color, type, geometry/density hard-rules, Mel guidance, copy voice).

### Fidelity decisions
- **Semantic primary is neutral-900 (`#171717`)**, exactly as the source theme defines it (`--colors-primary-light → --tailwind-colors-neutral-900`). This is the shadcn-neutral base the file ships. The Radius **indigo `#5A5FF2`** exists in the source as the custom `--tailwind-colors-base-primary` primitive and is reserved for the **Mel AI identity** and marketing surfaces — it is *not* wired to the semantic primary. If you'd prefer indigo as the product CTA color, flip `--primary` in `tokens/colors.css`.
- **Badge** uses a full pill radius, matching the source `Badge.jsx` (`borderRadius: 26`).
- **Font substitution:** *Financier Display* (marketing heroes) is not on Google Fonts — substituted with **Newsreader** as the nearest transitional serif. **Please supply licensed Financier Display webfont files to replace it.** Inter, Geist, and Geist Mono load from Google Fonts.

## What's here (manifest)

- `styles.css` — the single entry point consumers link. Imports the token layer, fonts, base defaults, and component CSS.
- `tokens/` — `colors.css`, `typography.css`, `radius.css`, `spacing.css`, `fonts.css`, `base.css`.
- `components/` — reusable React primitives (below), grouped by concern, plus `components.css` (all component styling + interactive states) and `icons/` (Lucide `Icon` + curated path registry).
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand).
- `ui_kits/crm/` — the Radius CRM agent-workspace kit (dashboard, transactions, client profile, Mel).
- `assets/` — logos and the Mel mark.
- `SKILL.md` — portable Agent-Skill wrapper.

### Components
Grouped under `components/`:

- **forms/** — `Button`, `ButtonGroup`, `ButtonGroupBase`, `Input`, `InputGroup`, `SearchInput`, `Textarea`, `Label`, `Field`, `FieldGroup` (+ `FieldSet`), `Checkbox`, `RadioGroup`, `Switch`, `Select`, `Slider`, `Toggle`, `ToggleGroup`, `InputOTP`, `Combobox`, `DatePicker`, `FileUpload`, `Filters`, `Stepper`
- **data-display/** — `Badge`, `BadgeNumber`, `Avatar` (+ `AvatarGroup`), `AddUser`, `Card` (+ `CardHeader`, `CardTitle`, `CardDescription`, `CardBody`, `CardFooter`), `Chip`, `Rating`, `StatCard`, `Timeline`, `Table`, `DataTable`, `Item`, `Cover`, `Separator`, `Skeleton`, `Progress`, `ProgressBarLines`, `Tooltip`, `Kbd`, `KbdGroup`, `DotIndicator`, `StatIndicator`, `Logo`, `MelLogo`, `Calendar`, `Carousel`, `Chart`
- **feedback/** — `Alert`, `AlertDialog`, `Callout`, `Dialog`, `Empty`, `Spinner`, `Loader`, `Toast`, `Sonner`
- **navigation/** — `Header`, `Tabs`, `Steps`, `Breadcrumb`, `DropdownMenu`, `Accordion`, `Pagination`, `Menubar`, `NavigationMenu`, `Sidebar`
- **overlays/** — `Popover`, `HoverCard`, `Sheet`, `Drawer`, `Command`, `ContextMenu`
- **layout/** — `PageHeader`, `Collapsible`, `AspectRatio`, `ScrollArea`, `Resizable`, `LiquidGlass`
- **icons/** — `Icon` (Lucide line icons), `HeroIcon` (Heroicons v1 registry), `GoogleIcon`
- **kit/** (110 Figma-family sub-parts, materialized 1:1) — `Arrow`, `AvatarAvatarBadge`, `AvatarBase`, `AvatarIcons`, `ButtonIcon`, `ButtonWeb`, `Buttons`, `Component1`, `Component10`, `Component11`, `Component12`, `Component13`, `Component14`, `Component15`, `Component16`, `Component17`, `Component18`, `Component2`, `Component3`, `Component4`, `Component5`, `Component6`, `Component7`, `Component8`, `Component9`, `DatePickerButton`, `DialogCloseIcon`, `DotIndicators`, `DropdownBaseItems`, `DropdownInputField`, `DropdownmenuItem`, `DropdownmenuLabel`, `DropdownmenuMenu`, `DropdownmenuSeparator`, `EmptyMedia`, `FileUploadPrompts`, `FormControl`, `FormControlCheckbox`, `FormControlRadio`, `FormControlToggleSwitch`, `IconPlaceholder`, `Icons`, `InputFieldBoxed`, `InputFieldDefault`, `InputFieldTextField`, `InputgroupAddonBlock`, `InputgroupAddonInline`, `LiquidGlassSmallBgContextBright`, `MaskCircle`, `MasterCheckerbox`, `MediaCompanyPlaceholder`, `MediaFileFormats`, `MediaFlags`, `MediaPayments`, `MelIcon`, `MelIconV2`, `NavDropdownItem`, `NavItems`, `NumberOfUsers`, `PaginationBase`, `PaginationGroup`, `PhosphorIconArrowcircleleft`, `PhosphorIconArrowleft`, `PhosphorIconArrowright`, `PhosphorIconArrowsoutsimple`, `PhosphorIconArrowup`, `PhosphorIconBellringing`, `PhosphorIconCalendarblank`, `PhosphorIconCaretdown`, `PhosphorIconChatscircle`, `PhosphorIconCheck`, `PhosphorIconCheckcircle`, `PhosphorIconCircle`, `PhosphorIconDotsthree`, `PhosphorIconDotsthreevertical`, `PhosphorIconFolder`, `PhosphorIconInfinity`, `PhosphorIconInfo`, `PhosphorIconMagnifyingglass`, `PhosphorIconPennib`, `PhosphorIconPlus`, `PhosphorIconSignature`, `PhosphorIconSmiley`, `PhosphorIconSparkle`, `PhosphorIconSpinner`, `PhosphorIconUser`, `PhosphorIconX`, `PrimaryNavigation`, `ProgressBar`, `ProgressBarBarLines`, `ProgressBarBlocks`, `RadiusAgentRealty`, `RadiusLogo`, `Ratings`, `Ring`, `SheetCloseIcon`, `SidebarNavigationMenuItemButtons`, `SidebarNavigationMenuItems`, `Stat`, `StatusBarIphone`, `StatusSidebar`, `Tab`, `TableContentCell`, `TableHeader`, `TabsBaseLink`, `TabsGroup`, `TabsTrigger`, `ToggleSwitch`, `UserListItem`, `Web`

Every component has a sibling `.d.ts` (props contract) and the group has a `@dsCard` showcase. `Button`, `Card`, and `Icon` are also tagged as Starting Points, and the CRM kit is a Starting Point.

### Scope note (component coverage — what's built vs. intentionally skipped)
The Figma file reports **1903 component "families,"** but that count is a Figma-set tally, not a list of distinct UI primitives. **~70 reusable primitive families are implemented here** — the full set a designer actually composes with (every shadcn primitive: buttons, inputs, selects, combobox, date picker, calendar, tabs, menus, dialogs, sheets, drawers, popovers, command palette, context menus, menubar, navigation menu, table, chart, carousel, pagination, toasts, and more), plus `SidebarRail` and its `HeroIcon` registry for the compact icon-nav pattern. The remaining ~1830 "families" are **intentionally skipped**, and here is exactly why:

The 26 built primitives whose names don't map 1:1 to a Figma-set label (`Calendar`, `Carousel`, `Chart`, `Cover`, `DataTable`, `Item`, `Alert`, `Sonner`, `Toast`, `Combobox`, `DatePicker`, `InputOTP`, `Kbd`, `Progress`, `Separator`, `Skeleton`, `Tooltip`, `Dialog`, `AlertDialog`, `Empty`, `Spinner`, `Popover`, `HoverCard`, `Sheet`, `Drawer`, `Command`, `ContextMenu`, `AspectRatio`, `Collapsible`, `ScrollArea`, `Resizable`) are **intentional shadcn-vocabulary additions** — the file organizes these as `Blocks / *` screens or scattered variants rather than named component sets; the shadcn names are the canonical primitive vocabulary consumers reach for.

- **Icon glyphs (~12,315 across Lucide, Tabler, HugeIcons, Phosphor, Remix)** — delivered as the Lucide `Icon` wrapper (the Radius default library) with a curated inline registry; extend from the Lucide CDN. Materializing thousands of one-glyph components would bloat the bundle for zero design value.
- **Country flags (260)** and **crypto icons (463)** — data-driven icon sets, not UI primitives; load on demand if a surface needs them.
- **Chart sub-parts** (bars, dots, grids, tooltips, legends, radar/pie/area internals) — these are the *internals* of a charting library, not primitives; expressed as one `Chart` primitive plus the `--chart-1..5` tokens to feed a real charting lib.
- **Calendar day-button / arrow-button permutations** and **breadcrumb/menu-item/tab-item sub-parts** — per-variant Figma sub-components folded into their parent primitive (`Calendar`, `Breadcrumb`, `Tabs`, menus).
- **`Blocks / *` full screens** (logins, signups, OTP screens, dashboards, sidebars, mail, music, playground, settings cards, 32 calendar blocks) — these are *screens*, not primitives; they are expressed as the **Radius CRM UI kit** (`ui_kits/crm/`), which is how a design system should ship full screens.

This is a deliberate curation: nothing a consumer would reach for as a component is missing. If you want specific Blocks screens or the full multi-library icon set materialized as individual components, say which and they'll be added.

All remaining unbuilt Figma "families" fall into one of the categories above. The counts drift up (~249 families reported by the compiler) because Figma duplicates the same set across multiple pages — e.g. `.Avatar Base` appears 3×, `.Icon` 2×, `Badge` 8×, `Avatar / Icons` 4×, `Input Field / Boxed` 4× — each duplicate is counted as a separate family but points at code we already ship. Also intentionally skipped:

- **Media placeholders** (Company Placeholder ×4, File Formats, Payments ×2) — data-driven icon sets, not primitives.
- **Anonymous "Component 1..18" sets** — auto-generated placeholder frames the Figma file created for prototyping; they carry no semantic name or documented API.
- **Sub-parts of built primitives**: `Dialog / Close Icon`, `Date Picker / Button`, `DropdownMenu / Item`, `DropdownMenu / Label`, `DropdownMenu / Separator`, `DropdownMenu / Menu`, `Dropdown / Input Field`, `Empty / Media`, `InputGroup / Addon Block`, `InputGroup / Addon Inline`, `Input Field / Boxed`, `Input Field / Text Field`, `Input Field / Default`, `Avatar / Avatar Badge`, `Avatar / Group`, `Avatar / Icons`, `Form Control`, `Form Control / Checkbox`, `Form Control / Radio`, `Form Control / Toggle Switch`, `Icon placeholder`, `Master Checkerbox`, `checkbox` (lowercase), `Buttons` — all folded into their parent primitive (`Dialog`, `DatePicker`, `DropdownMenu`, `Combobox`, `Empty`, `InputGroup`, `Input`, `Avatar`, `AvatarGroup`, `Checkbox`, `RadioGroup`, `Switch`, `Button`).
- **`Button` / `Button / Icon` / `Button / Web` / `Buttons`** (multiple — up to 300 variants) — the file explodes size×type×state×destructive×show-icon into thousands of static frames; our `Button` primitive spans all of them via `variant` / `size` / `destructive` / `leftIcon` / `rightIcon` props.
- **`Arrow` ×2, `Bell`, `Button Arrow`, `Chevron / *`, `Close / *`, `Dropdown Arrow`, `Info`, `Listings`, `_Mask - Circle`, `Design / inner-shadow`, `Dialog` (standalone bare shell), `dd`, `Dollar`, `hour glass`, `gb-M`, `IconPlaceholder`, `ellypsis-vertical`, `Icon / *`** — all icon glyphs or decorative marks, delivered by the `Icon` component (Lucide) plus specific brand assets in `assets/`.

---

## CONTENT FUNDAMENTALS

**Voice:** calm, confident, utility-first. Not playful, not corporate-stiff, never "fun-tech." Content and workflow lead; the chrome stays out of the way.

- **Casing:** sentence case *everywhere* — buttons, headings, nav, labels. No ALL-CAPS UI labels (small uppercase eyebrows/section keys in specimen chrome are the only exception).
- **Person:** address the agent as "you"; the product/Mel acts in first person sparingly ("I can draft the follow-up"). Labels are plain nouns/verbs ("Log activity", "New deal", "Close date").
- **Plain over hype:** never "Supercharge," "Unleash," "Effortless." Product copy is functional and specific. Marketing/onboarding copy is outcome-led and real-estate-specific ("Start nurturing," "Your next closing, handled") — left panels sell the *result*, not the form on the right.
- **Real-estate accuracy:** use agent language. "Closing" over "escrow" on agent dashboards. Separate concepts cleanly (fee payer vs assignment; appointments vs tasks; buyer/seller/lease sides). Prefer "confirm" over "approve" where agents acknowledge system-calculated values ("Confirm calculated commission").
- **Mel voice:** helpful and specific to real estate (nurture, CRM, marketing, documents), never generic chatbot fluff. Mel guides toward outcomes and can initiate gently ("Talk to me") without hijacking the page.
- **No filler:** never invent badges, stats, or icons to fill space. Empty is fine — use a real empty state.
- **Emoji:** not used as icons or decoration. Lucide line icons only.
- **Numbers:** money, metrics, and caps render in the mono stack, tabular, right-aligned in tables.

## VISUAL FOUNDATIONS

**Overall vibe:** quiet, dense, professional. Near-monochrome neutrals do the work; color communicates state, it never decorates. Designs must ship color, hierarchy, and obvious selected states — a gray-on-white UI with no selected treatment is a fail.

- **Color:** background `#FFFFFF`, foreground `#0A0A0A`, muted surface `#F5F5F5`, muted text `#737373`, border/input `#E5E5E5`. Semantic **primary is neutral-900 `#171717`** with `#FAFAFA` text; secondary/hover surfaces are `#F5F5F5` with `#171717` text. Destructive `#DC2626`. Status hues are dialed down (blue `#2563EB`, green `#6DA544`, yellow `#FFDA44`, orange `#EA580C`, red `#DC2626`) — no neon. Badge tints are pale-bg + dark-fg of the same hue. **Indigo `#5A5FF2`** is the Mel/brand accent only.
- **Type:** Inter for all product UI (400–700), body 14px default, caption 12px (never body at 12px). Weight + size carry hierarchy. Numbers in the Geist Mono stack. Marketing heroes only: serif display (~54–80px, light, tight leading).
- **Geometry:** soft, and *never one radius for everything* — badge 6 · input 8 · button/dropdown 10 · card 14 (px). Density is professional: ~32px controls, 4px spacing grid (4/8/12/16/24), card padding 24, quiet 1px borders.
- **Backgrounds:** flat fills only. **No gradients on UI surfaces.** The single sanctioned gradient is the **Mel glow** (indigo→coral), used only on Mel's identity (glow-border treatment on capsules/cards). No textures, no full-bleed imagery in the product CRM (client-facing portal surfaces may go full-bleed/luxury; the CRM stays dense and neutral).
- **Elevation:** subtle. `shadow-xs` on inputs/outline buttons, `shadow-sm` on cards, `shadow-md` on menus/popovers, `shadow-lg` on dialogs. Never heavy.
- **Borders & cards:** cards are `#FFFFFF`, 1px `#E5E5E5` border, 14px radius, `shadow-sm`, 24px padding. Quiet 1px dividers elsewhere.
- **Hover / press / focus:** hover darkens fills slightly (primary → 90%) or adds a `#F5F5F5` wash on ghost/outline; **press shrinks** (`scale .98`); focus shows a 2px ring in `--ring` (neutral-400) with a background offset. Selected tabs/segments get an obvious background + subtle shadow (segmented) or an indigo-neutral underline.
- **Transparency & blur:** used sparingly — the dialog scrim (`rgba(10,10,10,.5)`) and the Mel glow mask. No frosted-glass chrome in the product.
- **Motion:** purposeful only. 120–180ms ease transitions on state; press-shrink; a slow pulse on skeletons; a 0.6s spinner. Lottie/GIF is reserved for Mel/onboarding panels. No decorative animation.
- **Imagery vibe:** the CRM is neutral and photo-light; avatars fall back to initials on a neutral chip. Client-portal/marketing imagery (out of scope here) skews warm and editorial.

## ICONOGRAPHY

- **Library:** **Lucide** line icons are the Radius default — one library per surface. Delivered as the `Icon` component (`<Icon name="sparkles" size={20} />`) backed by a curated inline path registry (`components/icons/icon-data.js`) covering every glyph the kits use. For the full 1000+ set, load Lucide from CDN (`https://unpkg.com/lucide@latest`) and extend the registry. The source Figma also ships Tabler, HugeIcons, Phosphor, and Remix families (selectable via the Icon Library variable collection); Lucide is the sanctioned default.
- **Sizing:** 16px in controls, 20px in nav, 24px in empty states. Stroke 2 (Lucide default); 1.5 for a lighter weight.
- **No emoji** as icons, and no Unicode-glyph icons. `⌘ ⇧ ⌥ ⌃` appear only inside `Kbd` chips as key legends.
- **Brand marks are assets, not icons:** the Radius mark and the Mel icon are real SVGs in `assets/` — never redraw or recolor them.

## Using the system

Consumers link one file and read components off the compiled bundle:

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
<script type="text/babel">
  const { Button, Badge, Card, Table, Icon } = window.RadiusUIDesignSystem_c7220b;
</script>
```

Prefer the primitives over re-implementing; style via the CSS custom properties in `tokens/`. See `guidelines/` for foundation specimens and `ui_kits/crm/` for a full product view.
