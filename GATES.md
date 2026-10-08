# Gates: MEL Copilot GPT Site publication

OWNS: .openai/**, dist/**, GATES.md

Scope: Publish the standalone MEL Copilot HTML as a new ChatGPT Site without modifying the standalone source.

- [x] G1: packaged Site HTML matches the standalone source byte-for-byte
  CHECK: shasum -a 256 "Mel Copilot (standalone).html" dist/index.html
  EXPECT: 52d1ec6227d9157477e33eaf2c4cfb0840ae5a823acc0cb77aa37b8f285d359f
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/radius/Desktop/Architect/Radius/Design studio; path=6166d1a0b07c/41 entries; output=52d1ec6227d9157477e33eaf2c4cfb0840ae5a823acc0cb77aa37b8f285d359f  Mel Copilot (standalone).html | 52d1ec6227d9157477e33eaf2c4cfb0840ae5a823acc0cb77aa37b8f285d359f  dist/index.html

- [x] G2: Sites manifest points to the created project and serves dist
  CHECK: node -e "const fs=require('fs');const cfg=JSON.parse(fs.readFileSync('.openai/hosting.json','utf8'));if(cfg.project_id!=='appgprj_6ac73b2b5b2c8191b37d6319e1df677c')process.exit(1);if(!cfg.static||cfg.static.directory!=='dist')process.exit(1);console.log('hosting config verified')"
  EXPECT: hosting config verified
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/radius/Desktop/Architect/Radius/Design studio; path=6166d1a0b07c/41 entries; output=hosting config verified

- [x] G3: required static dependency folders are packaged with the Site
  CHECK: test -f dist/mel/50-flyer-studio.js && test -f dist/mel/55-ms-sidebar.css && test -f dist/assets/mel-icon.svg && test -f dist/assets/tpl/package-collage.jpg && test -f dist/website-builder.js && echo site assets verified
  EXPECT: site assets verified
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/radius/Desktop/Architect/Radius/Design studio; path=6166d1a0b07c/41 entries; output=site assets verified

- [ ] G4: production deployment reports succeeded
  EVIDENCE: pending
