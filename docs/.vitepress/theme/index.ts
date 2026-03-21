import DefaultTheme from 'vitepress/theme'
import HomeJourney from './components/HomeJourney.vue'
import ToolAutoPreview from './components/ToolAutoPreview.vue'
import ToolsDirectory from './components/ToolsDirectory.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeJourney', HomeJourney)
    app.component('ToolAutoPreview', ToolAutoPreview)
    app.component('ToolsDirectory', ToolsDirectory)
  }
}
