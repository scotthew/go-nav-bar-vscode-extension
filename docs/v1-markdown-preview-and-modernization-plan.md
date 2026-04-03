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
yarn run compile

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

**Update devDependencies** to current versions:
```json
"devDependencies": {
    "@types/mocha": "^10.0.0",
    "@types/node": "^22.0.0",
    "@types/vscode": "^1.96.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "esbuild": "^0.24.0",
    "eslint": "^8.57.0",
    "mocha": "^11.0.0",
    "typescript": "^5.7.0",
    "@vscode/test-electron": "^2.4.0"
}
```

**Remove these obsolete devDependencies:**
- `@types/glob` (unused)
- `glob` (unused)
- `ts-loader` (webpack-only)
- `vscode-test` (replaced by `@vscode/test-electron`)
- `webpack` (esbuild is the build tool)
- `webpack-cli` (esbuild is the build tool)
- `eslint-plugin-sonarjs` (in devDependencies but not configured in `.eslintrc.json`)

**Remove unused dependency:**
```json
"dependencies": {}
```
Remove `@material-ui/icons` — it's not imported anywhere in the source code.

Acceptance criteria:
- [ ] Engine targets VS Code 1.96+
- [ ] All devDependencies at current major versions
- [ ] No webpack, ts-loader, sonarjs, or unused packages remain
- [ ] `@material-ui/icons` removed from dependencies
- [ ] `yarn install` succeeds with no errors

#### Task 4: Clean up scripts and remove webpack config
Files: `package.json`, `webpack.config.js`
Depends on: Task 3

**Update scripts** — remove webpack references, keep esbuild:
```json
"scripts": {
    "lint": "eslint src --ext ts",
    "pretest": "yarn run compile && yarn run lint",
    "test": "node ./out/test/runTest.js",
    "test-compile": "tsc -p ./",
    "compile": "npm run esbuild-base -- --sourcemap",
    "watch": "npm run esbuild-base -- --sourcemap --watch",
    "vscode:prepublish": "npm run esbuild-base -- --minify",
    "esbuild-base": "esbuild ./src/extension.ts --bundle --outfile=dist/main.js --external:vscode --format=cjs --platform=node",
    "latest": "yarn upgrade-interactive --latest"
}
```

**Delete** `webpack.config.js` — it's unused since the esbuild migration.

Acceptance criteria:
- [ ] No webpack references in scripts
- [ ] `yarn run compile` and `yarn run watch` both use esbuild
- [ ] `vscode:prepublish` produces minified bundle
- [ ] `webpack.config.js` deleted

#### Task 5: Remove explicit activationEvents and stray config
Files: `package.json`
Depends on: Task 2

Since VS Code 1.74+, activation events are auto-generated from `contributes.commands`. Remove the entire `activationEvents` array (lines 52-59) — VS Code will infer them.

Also remove the stray empty `"menus": {}` at the top level (line 261, outside `contributes`) which does nothing.

Acceptance criteria:
- [ ] `activationEvents` array removed from package.json
- [ ] Stray top-level `"menus": {}` removed
- [ ] Extension still activates correctly on command invocation

---

### Phase 3: Marketplace Readiness

#### Task 6: Bump version and update metadata
Files: `package.json`, `CHANGELOG.md`, `.vscodeignore`
Depends on: Tasks 1-5

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
yarn install

# Verify build
yarn run compile

# Verify lint
yarn run lint

# Package
npx @vscode/vsce package --no-dependencies
```

Acceptance criteria:
- [ ] `yarn install` succeeds with no errors
- [ ] `yarn run compile` produces `dist/main.js`
- [ ] `yarn run lint` passes
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
