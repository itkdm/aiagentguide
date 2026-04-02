import { build } from 'vitepress'

try {
  await build('docs')
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
