/* eslint-disable @typescript-eslint/no-require-imports */
// ─────────────────────────────────────────────────────────────────────────────
// Vitest dep alignment — copy @testing-library/{react,dom,jest-dom} from the
// workspace root into this portal's local node_modules so that those modules'
// internal `require('react')` / `require('react-dom')` resolves to the portal's
// React 19 copy rather than the React 18 copy hoisted at the monorepo root
// (used by other workspaces).
//
// Why this is necessary: npm 9 workspace hoisting parks
// @testing-library/react in the root node_modules, where Node's CJS resolver
// walks up and finds the React 18 react-dom installed for other dashboards.
// That causes a dual-React-instance error (`Cannot read properties of null
// (reading 'useState')`). Nesting the testing-libs under the portal makes
// Node's resolver find the portal's react-dom (19) instead.
//
// Idempotent — re-running is a no-op when copies are present.
// Runs automatically before `npm test` / `npm run test:watch` (pretest hook).
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('node:fs')
const path = require('node:path')

const portalRoot = path.resolve(__dirname, '..')
const portalNodeModules = path.join(portalRoot, 'node_modules')
const rootNodeModules = path.resolve(portalRoot, '..', 'node_modules')

const PACKAGES = [
  '@testing-library/react',
  '@testing-library/dom',
  '@testing-library/jest-dom',
]

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath)
    } else if (entry.isSymbolicLink()) {
      const link = fs.readlinkSync(srcPath)
      fs.symlinkSync(link, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

for (const pkg of PACKAGES) {
  const target = path.join(portalNodeModules, pkg)
  const source = path.join(rootNodeModules, pkg)
  if (!fs.existsSync(source)) {
    console.error(`[prepare-deps] missing source: ${source}`)
    process.exit(1)
  }
  if (fs.existsSync(target)) continue
  fs.mkdirSync(path.dirname(target), { recursive: true })
  copyRecursive(source, target)
  console.log(`[prepare-deps] copied ${pkg} -> kshuri-portal/node_modules`)
}
