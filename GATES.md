# Gates: Design Studio home preview

OWNS: GATES.md, Backups/home-scaling-preview.html, Backups/home-studio-patch.js

Scope: Preserve hero geometry and build the approved Radius card compositions in a review preview. Shared component sources are DesignStudioCard.js, design-studio-cards.css, and DesignStudioCard.md in the Radius UI Design System.

- [x] G1: Compare published and local hero dimensions.
  EVIDENCE: Browser DOM measurements: both hero cards 431 by 425.5 CSS pixels, 14px gap, top 174.875px. Screenshots inspected before changes.
- [x] G2: Preserve all standalone source preceding the home patch.
  EVIDENCE: The approved full preview was copied into the standalone; the only path rewrite was ../assets/template-previews/ to assets/template-previews/. The unrelated dist/index.html remains unchanged.
- [x] G3: All five banner controls reach matching template format.
  EVIDENCE: Browser clicks confirmed Post, Emailer, Flyers, Story, Reel selected; each returned home through Design studio.
- [x] G4: Render all requested sections in the preview.
  EVIDENCE: Current browser accessibility tree includes Create with templates, Continue designing, Templates for you, Browse template categories, Frequently used.
- [ ] G5: User visually approves preview before standalone update.
  EVIDENCE: User authorized applying the preview for session close and requested no visual audit. Final visual approval remains pending.

- [ ] G6: Preview thumbnails preserve complete source artwork and proportional scaling.
  EVIDENCE: GPT-6 Sol high requested subagent replaced HTML clones with five supplied PNGs. Original/copy/embedded-byte checks and JS syntax passed. Main source review confirmed approved headings and pre-patch standalone source preserved. User visual verification remains pending; no visual correctness claim.

- [x] G7: Preserve the package-flow rollback and make standalone-relative artwork resolve.
  EVIDENCE: The home and printer patches parse as JavaScript; all bundled JSON parses. No package-flow runtime markers are present. All five fallback PNGs exist under assets/template-previews/.
