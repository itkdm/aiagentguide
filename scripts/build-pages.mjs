import process from 'node:process'
import { build } from 'vitepress'

try {
  await build('docs')

  console.log('VitePress build completed successfully.')
  console.log(
    'Active Node.js resources after build:',
    process.getActiveResourcesInfo()
  )

  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}