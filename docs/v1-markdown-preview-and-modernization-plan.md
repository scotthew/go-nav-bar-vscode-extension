# Go Nav Bar v1.0.0 — Markdown Preview + Modernization Plan

## Goal

Update the Go Nav Bar VS Code extension to v1.0.0: add a Markdown Preview button, modernize all dependencies and configuration to current standards, and ensure marketplace publishability — without removing any existing commands or interfering with other extensions' editor title bar icons.

## Architecture

The extension is a thin wrapper: each command delegates to a built-in VS Code command via `commands.executeCommand()`. The new Markdown Preview command follows this exact same pattern, delegating to `markdown.showPreview`. All 7 existing commands remain untouched.

### Coexistence with Other Extensions

**This extension is purely additive.** VS Code's `editor/title` contribution model merges menu items from all extensions — no extension can remove or override another's contributions. Each extension contributes items to the same menu, and VS Code renders them all.

How it works:
- Each extension contributes to `editor/title` with `"group": "navigation"` independently
- VS Code merges all contributions and renders them in the title bar
- No extension can hide, remove, or override another extension's contributions
- The `when` clause only controls visibility of *this extension's own* buttons

Extensions that will continue to display alongside Go Nav Bar:
- **Claude Code** — contributes its own `editor/title` actions, unaffected
- **Split Editor** — VS Code built-in action, unaffected
- **Enhanced Markdown Preview** — contributes its own preview button, unaffected
- **Any other extension** — same principle, all additive

The only scenario where buttons could be hidden is if the editor title bar runs out of horizontal space (VS Code collapses overflow into a `...` menu). This is a VS Code UI limitation, not something this extension controls.

## Verification

```bash
# Build successfully
pnpm run compile

# Package for marketplace
npx @vscode/vsce package --no-dependencies

# Manual: install the .vsix, open a .md file, confirm the preview icon appears
# Manual: confirm all 8 Go Nav Bar buttons work and can be toggled via settings
# Manual: confirm other extensions' buttons (Claude Code, Split Editor, etc.) still visible
```

## Tasks

### Phase 1: Add Markdown Preview Command

#### Task 1: Register command in extension.ts
Files: `src/extension.ts`
Depends on: none

Add the new command registration following the existing pattern:

```typescript
const markdownPreview = commands.registerCommand('GoNavBar.markdownPreview', () => {
    void commands.executeCommand('markdown.showPreview');
});
```

Add `markdownPreview` to the `context.subscriptions.push(...)` call.

Note: `markdown.showPreview` is provided by VS Code's built-in Markdown extension (bundled since VS Code 1.11). If a user has disabled the built-in Markdown extension, the command is a silent no-op — same behavior as other delegating commands in this extension.

Acceptance criteria:
- [ ] New command registered as `GoNavBar.markdownPreview`
- [ ] Delegates to `markdown.showPreview`
- [ ] Added to subscriptions for proper disposal

#### Task 2: Add command, menu, config, and keybinding to package.json
Files: `package.json`
Depends on: none

**Add configuration property** (inside `contributes.configuration[0].properties`):
```json
"GoNavBar.markdownPreview": {
    "title": "Markdown Preview",
    "type": "boolean",
    "default": true,
    "description": "show icon for 'Markdown: Open Preview'"
}
```

**Add command definition** (use VS Code's built-in codicon — see Notes section for rationale):
```json
{
    "command": "GoNavBar.markdownPreview",
    "category": "ShortcutMenuBar",
    "title": "Markdown: Open Preview",
    "icon": "$(open-preview)",
    "enablement": "resourceLangId == markdown"
}
```

**Add menu entry** (only visible for markdown files):
```json
{
    "when": "config.GoNavBar.markdownPreview && resourceLangId == markdown",
    "command": "GoNavBar.markdownPreview",
    "group": "navigation"
}
```

**Add keybinding** (matches VS Code's default markdown preview shortcut):
```json
{
    "command": "GoNavBar.markdownPreview",
    "key": "Ctrl+Shift+V",
    "mac": "Shift+Cmd+V",
    "when": "resourceLangId == markdown"
}
```

Acceptance criteria:
- [ ] Command appears in editor title bar only for `.md` files
- [ ] Button is toggleable via `GoNavBar.markdownPreview` setting
- [ ] Keybinding matches VS Code's built-in markdown preview shortcut
- [ ] No duplicate command execution when pressing Ctrl+Shift+V (keybinding shared with VS Code built-in)
- [ ] Does NOT appear for non-markdown files
- [ ] All 7 existing commands still present and unchanged
- [ ] Other extensions' editor title bar icons (Claude Code, Split Editor, Enhanced Preview) still visible

---

### Phase 2: Modernize Dependencies & Configuration

#### Task 3: Update engine target and devDependencies
Files: `package.json`
Depends on: none

**Update engine:**
```json
"engines": {
    "vscode": "^1.96.0"
}
```

**Update devDependencies** — versions below show the target state. Items marked ✅ are already at or above the target in the current `package.json`:

```json
"devDependencies": {
    "@types/mocha": "^10.0.0",           // ✅ already ^10.0.0
    "@types/node": "^22.0.0",            // currently ^20.0.0 — bump
    "@types/vscode": "^1.96.0",          // currently ^1.85.0 — bump to match engine
    "@typescript-eslint/eslint-plugin": "^8.0.0",  // currently ^7.0.0 — major bump, test lint rules
    "@typescript-eslint/parser": "^8.0.0",         // currently ^7.0.0 — bump with plugin
    "esbuild": "^0.24.0",               // ✅ already ^0.24.0
    "eslint": "^8.57.0",                // ✅ already ^8.57.0
    "mocha": "^11.0.0",                 // ⚠️ MISSING — add (imported in src/test/suite/index.ts)
    "typescript": "^5.7.0",             // ✅ already ^5.7.0
    "@vscode/test-electron": "^2.5.0"   // ✅ already ^2.5.0 (plan originally said ^2.4.0, keep current)
}
```

> **Missing dependency:** `mocha` is imported in `src/test/suite/index.ts:1` but not listed in devDependencies. esbuild silently externalizes it, masking the error. Add `"mocha": "^11.0.0"` to devDependencies. <!-- TODO: verify mocha dependency is present after npm install -->

**Remove obsolete devDependencies** (already done in prior commits — verify none crept back):
- `@types/glob`, `glob`, `ts-loader`, `vscode-test`, `webpack`, `webpack-cli`, `eslint-plugin-sonarjs`

**Remove unused dependency** (already done — verify):
- `@material-ui/icons` — was not imported anywhere

Acceptance criteria:
- [ ] Engine targets VS Code 1.96+
- [ ] `@types/node` bumped to ^22.0.0
- [ ] `@types/vscode` bumped to ^1.96.0
- [ ] `@typescript-eslint/*` bumped to ^8.0.0 (verify lint still passes)
- [ ] `mocha` added to devDependencies
- [ ] No webpack, ts-loader, sonarjs, or unused packages remain
- [ ] `pnpm install` succeeds with no errors

#### Task 4: Clean up scripts and remove webpack config — ✅ ALREADY COMPLETE

> **Status:** webpack.config.js was deleted and scripts were migrated to direct esbuild invocations in commit d422ca8. `pretest` already uses `pnpm run`. No action needed — verify during Task 7.

Current scripts in `package.json` (already correct):
- `compile` / `watch` — direct esbuild invocations with `--sourcemap`
- `vscode:prepublish` — esbuild with `--minify`
- `pretest` — uses `pnpm run compile && pnpm run lint`

#### Task 5: Remove explicit activationEvents and stray config — ✅ ALREADY COMPLETE

> **Status:** Both `activationEvents` and the stray top-level `"menus": {}` were already removed in commit d422ca8. Current `package.json` has neither field. No action needed.

---

### Phase 3: Marketplace Readiness

#### Task 6: Bump version and update metadata
Files: `package.json`, `CHANGELOG.md`, `.vscodeignore`
Depends on: Tasks 1-3 (must complete Phase 1 before documenting the new feature)

**Bump version** to `1.0.0`.

**Add keywords** for the new feature:
```
"markdown", "preview", "markdown preview"
```

**Update CHANGELOG.md:**
```markdown
# Change Log

## [1.0.0] - 2026-04-02

### Added
- Markdown: Open Preview button in editor title bar (visible for .md files)
- Configurable via `GoNavBar.markdownPreview` setting

### Changed
- Updated VS Code engine target to ^1.96.0
- Modernized all dependencies (TypeScript 5.x, ESLint 8.x, esbuild 0.24.x)
- Removed legacy webpack build system in favor of esbuild
- Removed unused @material-ui/icons dependency
- Activation events now auto-generated by VS Code

## [0.9.0] - 2022-04-06

- Updated to use esbuild
- Updated to target VS Code >=1.61
```

**Update .vscodeignore** to exclude docs and vsix files:
```
.vscode/**
.vscode-test/**
out/**
src/**
docs/**
*.vsix
.gitignore
.yarnrc
vsc-extension-quickstart.md
**/tsconfig.json
**/.eslintrc.json
**/*.map
**/*.ts
```

Note: Do NOT exclude `dist/` — `main` field points to `./dist/main.js` which must be in the .vsix.

Acceptance criteria:
- [ ] Version is 1.0.0
- [ ] CHANGELOG reflects all changes
- [ ] `.vscodeignore` excludes `docs/` and `*.vsix` files
- [ ] `npx @vscode/vsce package --no-dependencies` produces a clean .vsix
- [ ] Packaged .vsix contains `dist/main.js` but not `src/` or `docs/`
- [ ] Packaged .vsix is < 100 KB (current bundle is ~1.3 KB + icons)

#### Task 7: Install dependencies and verify build
Files: none (commands only)
Depends on: Tasks 3-6

```bash
# Clean install
rm -rf node_modules
pnpm install

# Verify build
pnpm run compile

# Verify lint
pnpm run lint

# Package
npx @vscode/vsce package --no-dependencies
```

Acceptance criteria:
- [ ] `pnpm install` succeeds with no errors
- [ ] `pnpm run compile` produces `dist/main.js`
- [ ] `pnpm run lint` passes (especially after @typescript-eslint v8 bump)
- [ ] `npx @vscode/vsce package` produces a `.vsix` file without errors
- [ ] `dist/main.js` is < 5 KB minified

---

## Skipped: tsconfig.json

No changes needed — `tsconfig.json` is already modern:
- `module`: `Node16`
- `target`: `ES2022`
- `lib`: `["ES2022"]`
- `skipLibCheck`: `true`
- `strict`: `true`

---

## Existing Commands (preserved, no changes)

All 7 existing commands remain exactly as-is:

1. **Go Back** — `GoNavBar.goBack` (Alt+Left)
2. **Go Forward** — `GoNavBar.goForward` (Alt+Right)
3. **Go Last Edit Location** — `GoNavBar.goLastEditLocation` (Ctrl+K Ctrl+Q)
4. **Go To Bracket** — `GoNavBar.goToBracket` (Ctrl+Shift+\)
5. **Save Without Formatting** — `GoNavBar.saveWithoutFormatting` (Ctrl+K Ctrl+Shift+S)
6. **Balance Outward** — `GoNavBar.balanceOut` (Ctrl+Shift+Up)
7. **Balance Inward** — `GoNavBar.balanceIn` (Ctrl+Shift+Down)

## Notes

- **Icon choice:** The new Markdown Preview button uses VS Code's built-in `$(open-preview)` codicon rather than a custom PNG. This is the modern approach — no asset files to maintain, and it automatically adapts to the user's theme. Existing commands keep their custom PNGs (no visual change). The visual style will differ slightly (codicon vs PNG), but this is common in extensions and avoids the need to source/create custom icon assets.
- **Enablement:** The preview button only appears when editing a markdown file (`resourceLangId == markdown`), so it won't clutter the title bar for other file types.
- **Coexistence:** This extension is purely additive. VS Code's `editor/title` contribution model merges items from all extensions — no extension can remove or override another's buttons. Claude Code, Split Editor, Enhanced Markdown Preview, and all other extensions will continue to display their icons normally. See the Architecture section for details.
- **`markdown.showPreview` stability:** This command is provided by VS Code's built-in Markdown extension (bundled since 1.11, stable API). It's the same command VS Code uses for its own Ctrl+Shift+V keybinding.

---

## References

- VS Code Extension API: [https://code.visualstudio.com/api/references/commands](https://code.visualstudio.com/api/references/commands)
- Marketplace publishing guide: [https://code.visualstudio.com/api/working-with-extensions/publishing-extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- `$(open-preview)` codicon reference: [https://code.visualstudio.com/api/references/icons-in-labels](https://code.visualstudio.com/api/references/icons-in-labels)
- Repository: [https://github.com/scotthew/go-nav-bar-vscode-extension](https://github.com/scotthew/go-nav-bar-vscode-extension)

---

## Implementation Checklist

### Phase 1: Add Markdown Preview Command ✅ IMPLEMENTED
- [x] `src/extension.ts` — register `GoNavBar.markdownPreview` command, add to subscriptions
- [x] `package.json` — add configuration property `GoNavBar.markdownPreview`
- [x] `package.json` — add command definition with `$(open-preview)` icon and `enablement`
- [x] `package.json` — add `editor/title` menu entry with `resourceLangId == markdown` when clause
- [x] `package.json` — add keybinding `Ctrl+Shift+V` / `Shift+Cmd+V`

### Phase 2: Modernize Dependencies ✅ IMPLEMENTED
- [x] `package.json` — bump engine to `^1.96.0`
- [x] `package.json` — bump `@types/node` to `^22.0.0`, `@types/vscode` to `^1.96.0`
- [x] `package.json` — bump `@typescript-eslint/*` to `^8.0.0`
- [x] `package.json` — add `mocha` `^11.0.0` to devDependencies
- [x] `package.json` — remove webpack, ts-loader, glob, sonarjs, @material-ui/icons (done)
- [x] `package.json` — remove activationEvents and stray menus (done)
- [x] `package.json` — migrate scripts to direct esbuild (done)
- [x] Delete `webpack.config.js` (done)
- [x] `.eslintrc.json` — remove `@typescript-eslint/semi` rule (removed in v8)
- [x] `src/test/runTest.ts` — fix unused `err` variable (lint error with v8)
- [x] `src/test/suite/index.ts` — fix `prefer-promise-reject-errors` (lint error with v8)

### Phase 3: Marketplace Readiness ✅ IMPLEMENTED
- [x] `package.json` — bump version to `1.0.0`, add markdown keywords
- [x] `CHANGELOG.md` — write v1.0.0 entry
- [x] `.vscodeignore` — add `*.vsix` and `.yarnrc`
- [x] Run `pnpm install && pnpm run compile && pnpm run lint` — all pass
- [x] Run `npx @vscode/vsce package --no-dependencies` — clean .vsix 44 KB

---

## Test Coverage

**Current state:** Test framework exists (`src/test/suite/index.ts` + `src/test/runTest.ts`) but no test files are present in `src/test/suite/`. The test runner will execute but find zero tests.

<!-- TODO: add minimal extension activation test after v1.0.0 release -->

**If adding tests, minimal coverage for v1.0.0:**
- `src/test/suite/extension.test.ts` — verify extension activates and all 8 commands register
- Framework: Mocha (already configured in `src/test/suite/index.ts`)
- Test runner: `@vscode/test-electron` (integration tests run inside VS Code host)

