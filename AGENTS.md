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


## Repo
- GitHub (public): https://github.com/krishmjradiusagent/design-studio
- Branch: `main`
- Tracked: `Mel Copilot (standalone).html`, `AGENTS.md`, `.gitignore`. `Backups/` is local-only (gitignored).
- Session end rule: when the user says "u" in chat (or ends a session), commit all tracked changes and `git push origin main`. Commit message: short conventional (`feat:` / `fix:` / `docs:`).
