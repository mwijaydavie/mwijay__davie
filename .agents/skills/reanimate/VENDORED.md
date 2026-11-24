# Vendored: reanimate

- Upstream: https://github.com/NiazMorshed2007/reanimate
- Upstream commit studied and copied: 3f7a55a2986a84ca2173e86ee9127eefe31d046d (2026)
- License: MIT — see ./LICENSE (Copyright (c) 2026 Niaz Morshed). Keep it.
- What it is: a Claude Code Agent Skill that reverse-engineers motion from a live site /
  screen recording / mp4 / gif / Lottie, rebuilds it in your stack, then verifies the copy
  frame-by-frame against the reference (pixel + timing + easing + WebGL channels).
- Why vendored here: Altraware / Noellyne animations (HTML/Remotion/CSS motion layer) can be
  built against a measured reference instead of "looks about right". See
  research/reanimate-study.md.
- Requirements: Bun ≥ 1.1, macOS or Linux; first run installs Playwright Chromium + ffmpeg
  (~250 MB) — run scripts/setup.sh once. Not tested on Windows.
- Rules of use (honesty + brand): clone motion only, never third-party assets; assets stay
  ours (Altraware/Noellyne). Claims in reports must show numbers (timing error, mismatch).
- Update path: re-copy from upstream main when it moves; note the new commit here.
