1. Create a new Github repo and mark it public
2. Always Github is the backup for you
3. Add [agents.md](http://agents.md) and add the repo details there and instructions to always upload to github after every session end the user say u in a chat
4. Use caveman skill at ultra mode on , unlazy 
5. Always open a local server if a server fails for this project
6. Make sure to properly do the code - clean
7. use vercel frontend guidelines skill to code
8. Always show first in browser edit and once confirmed update the standalone html file 
9. All input fields, labels and dropdowns MUST come from the Radius UI Design System folder: `/Users/radius/Desktop/Design OS/Radius UI Design System`
   - Input: `.rds-input` (32px, 12px x-pad, 14px, 8px radius, neutral-200 border, shadow-xs, hover neutral-300)
   - Field/Label: `.rds-field` (6px gap) + `.rds-label` (14px medium, foreground); hint `.rds-field__hint` (13px muted)
   - Dropdown trigger: `.rds-select` geometry; menu: `.rds-menu` (4px pad, 10px radius, border + shadow-md), items `.rds-menu__item` (32px, 13px, 6px radius, hover neutral-100)
   - Source files: `components/components.css`, `components/forms/{Input,Select,Field,Label}.jsx`, `components/navigation/DropdownMenu.jsx`
   - Do not use shadcn or ad-hoc styles for these controls. Focus ring + primary CTA = `#5A5FF2`

## Design Studio home template rail — locked direction

- Use the user's Canva Home screenshot as a layout reference: a compact horizontal row of colorful format banners with concise titles and visible template artwork.
- Keep the existing listing-package and website hero cards at their current size, scale, spacing, and position. The template rail must fit inside the existing 920px workflow area, stay one row with horizontal scrolling on narrow screens, and never widen or vertically stack the surrounding home UI.
- Reuse Radius UI Design System components, styles, tokens, and supported icon/badge variants. Use Mona Sans through the system's `--font-sans`. Do not invent colors or fonts. Follow the Radius design exploration and component reuse policy below for necessary shared variants.
- Use existing in-app template artwork in shallow landscape crops. Each format banner must open its matching template selection flow.
- After edits, inspect the rendered page at the current scale and check the rail against the supplied Canva reference. If browser access blocks visual inspection, report that plainly.


## Repo
- GitHub (public): https://github.com/krishmjradiusagent/design-studio
- Branch: `main`
- Tracked: `Mel Copilot (standalone).html`, `AGENTS.md`, `.gitignore`. `Backups/` is local-only (gitignored).
- Session end rule: when the user says "u" in chat (or ends a session), commit all tracked changes and `git push origin main`. Commit message: short conventional (`feat:` / `fix:` / `docs:`).

## Default model routing and effort

Use this workflow across projects and sessions unless I explicitly request a different model or effort level. This replaces the earlier blanket Terra high preference.

| Task | Model | Reasoning effort |
| --- | --- | --- |
| UI/UX direction, reference interpretation, design decisions | Astra (`gpt-6-astra`) | `low` (my “light” preference) |
| Routine implementation from an agreed specification | GPT-5.6 Sol (`gpt-5.6-sol`) | `medium` |
| Complex implementation, integration, or difficult debugging | GPT-6 Sol (`gpt-6-sol`) | `high` |
| Short, unambiguous edits with a narrow scope | Luna (`gpt-6-luna`) | `low` |

- Delegate to these subagents when the host supports model and effort selection. These instructions authorize task-relevant delegation; no repeated delegation permission is needed.
- Astra produces a short implementation handoff: agreed layout and behavior, exact Radius components and tokens, relevant files, and acceptance conditions. It should not implement the design unless I request it.
- The implementation agent follows the approved handoff, preserves surrounding UI, and does not independently redesign. Skip a new design handoff for an already specified mechanical edit.
- Keep handoffs small and focused. Do not fork the full chat when a concise brief and exact file paths suffice. Avoid unnecessary parallel agents, duplicate reviews, or repeated checks.
- The main agent coordinates, reviews the resulting changes, and verifies relevant functionality. I provide final visual approval. If I explicitly take over visual verification, do not spend tokens on an additional visual audit; report visual approval as pending until my feedback arrives.
- Check the models and effort values actually available in the current session. Never claim that a model was used unless it was selected successfully. If unavailable, state the limitation and intended available fallback before proceeding; do not silently substitute. Terra is not a default fallback.
- These are routing preferences, not a guarantee that the host can switch models. In a host without subagents or model selection, state that limitation and provide a short handoff for manual model switching.
- Keep responses concise. Follow the Radius UI Design System and applicable project instructions. A routing rule never overrides permissions or an explicit instruction from me.

## Radius design exploration and component reuse

Explore layouts, compositions, hierarchy, and interactions freely within the requested scope. Keep the Radius visual language consistent across projects: use the existing font families, font sizes, weights, line heights, spacing scale, colors, semantic foreground/background pairs, radii, icons, and other tokens from `/Users/radius/Desktop/Design OS/Radius UI Design System`.

1. Read the system's `SKILL.md`, relevant documentation, actual component source, and token files before designing or coding. Search the shared system before creating anything.
2. Reuse an existing component and its supported variants when they satisfy the requirement. Otherwise compose existing components. Do not duplicate a component because rewriting is quicker or because a different name seems convenient.
3. Create a new component or supported variant only when the requirement cannot reasonably be met with existing components or composition. Briefly state the gap and why reuse does not work. This policy authorizes that addition without another permission request; ask only if it requires a new visual token, changes established shared behavior, or materially expands the requested scope.
4. Build any necessary new component at the shared design-system source first, using existing Radius tokens and conventions. Document its purpose, supported variants, states, accessibility behavior, and usage example; expose it through the system's applicable exports or entry points. Consume that shared implementation in the product. For standalone prototypes, embed or copy the canonical source rather than maintain a separate implementation.
5. Keep reusable structure and behavior in the component; pass page-specific text, artwork, data, and actions as parameters. Reuse the result in later projects instead of making another near-duplicate. Add generalizable variants to the existing component rather than creating parallel components.
6. Do not silently override component typography, spacing, geometry, colors, or theme behavior in page CSS. Product layouts may arrange components using Radius tokens. A genuinely required reusable appearance change belongs in a documented shared variant.
7. Preserve surrounding UI and existing consumers. Check relevant functionality and accessibility. Follow my visual-review preference; never claim visual correctness from source or logic checks alone. Report shared components added or reused and any pending visual approval.

This policy replaces earlier blanket prohibitions on creating components and earlier requirements to ask permission merely because a component is missing. It does not authorize new fonts, colors, spacing scales, or other visual tokens without approval.
