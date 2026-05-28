/**
 * Workaround for OpenNext Windows path separator bug.
 * OpenNext checks `file.includes(".next/server/chunks/")` but on Windows
 * tracedFiles use backslashes, so no chunks get added to requireChunk switch.
 * This script manually patches the switch after the OpenNext build.
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const serverFnDir = join(root, '.open-next', 'server-functions', 'default', '.next', 'server')

function patchRuntime(runtimePath, chunksDir, chunkPrefix) {
  const chunkFiles = readdirSync(chunksDir)
    .filter(f => f.endsWith('.js') && !f.startsWith('[turbopack]_runtime') && !f.endsWith('.map'))

  const cases = chunkFiles.map(f => {
    const chunkPath = `${chunkPrefix}${f}`
    const requirePath = join(chunksDir, f).replace(/\\/g, '/')
    return `      case "${chunkPath}": return require("${requirePath}");`
  }).join('\n')

  const newRequireChunk = `
  function requireChunk(chunkPath) {
    switch(chunkPath) {
${cases}
      default:
        throw new Error(\`Not found \${chunkPath}\`);
    }
  }
`

  let content = readFileSync(runtimePath, 'utf-8')
  // Replace the existing requireChunk function (appended by OpenNext)
  content = content.replace(
    /\s*function requireChunk\(chunkPath\)\s*\{[\s\S]*?\}/,
    newRequireChunk
  )
  writeFileSync(runtimePath, content, 'utf-8')
  console.log(`✅ Patched ${runtimePath} with ${chunkFiles.length} chunk cases`)
}

// Patch SSR runtime
patchRuntime(
  join(serverFnDir, 'chunks', 'ssr', '[turbopack]_runtime.js'),
  join(serverFnDir, 'chunks', 'ssr'),
  'server/chunks/ssr/'
)

// Patch non-SSR runtime
patchRuntime(
  join(serverFnDir, 'chunks', '[turbopack]_runtime.js'),
  join(serverFnDir, 'chunks'),
  'server/chunks/'
)

console.log('✅ Turbopack runtime patched for Windows compatibility')
