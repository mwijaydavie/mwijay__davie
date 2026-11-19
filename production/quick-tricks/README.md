# Quick Tricks cards

`restore-tab.html` is original artwork for the desktop Chrome shortcut, not a captured browser. The offline renderer embeds the repo's Altraware mark and two locally pinned fonts. It tests canvas fit and both chords before taking a 1080×1350 screenshot.

```sh
npm --prefix production/website-era ci
CHROME_PATH=/absolute/path/to/chromium node production/quick-tricks/render.mjs
```

Exports to `out/quick-tricks` by default (`QUICK_TRICKS_OUT` overrides it). See the [shooting brief and source](../../content/pilots/16-restore-tab.md) for a future real Chrome screen capture.
