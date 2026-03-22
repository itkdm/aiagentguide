import DefaultTheme from 'vitepress/theme'
import HomeJourney from './components/HomeJourney.vue'
import HomeTechStack from './components/HomeTechStack.vue'
import HomeLatest from './components/HomeLatest.vue'
import HomeDemo from './components/HomeDemo.vue'
import ToolAutoPreview from './components/ToolAutoPreview.vue'
import ToolsDirectory from './components/ToolsDirectory.vue'
import './custom.css'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('HomeJourney', HomeJourney)
    app.component('HomeTechStack', HomeTechStack)
    app.component('HomeLatest', HomeLatest)
    app.component('HomeDemo', HomeDemo)
    app.component('ToolAutoPreview', ToolAutoPreview)
    app.component('ToolsDirectory', ToolsDirectory)
  }
}
