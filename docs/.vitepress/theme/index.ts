import DefaultTheme from 'vitepress/theme'
import HomeJourney from './components/HomeJourney.vue'
import HomeTechStack from './components/HomeTechStack.vue'
import HomeDemo from './components/HomeDemo.vue'
import ToolAutoPreview from './components/ToolAutoPreview.vue'
import ToolsDirectory from './components/ToolsDirectory.vue'
import AgentLoopVisualizer from './components/AgentLoopVisualizer.vue'
import MermaidDiagram from './components/MermaidDiagram.vue'
import MindmapDiagram from './components/MindmapDiagram.vue'
import ImageCarousel from './components/ImageCarousel.vue'
import SingleImagePreview from './components/SingleImagePreview.vue'
import ContentSwitcher from './components/ContentSwitcher.vue'
import './custom.css'
import './styles/home.css'
import './styles/mermaid-diagram.css'
import './styles/mindmap-diagram.css'
import './styles/ai-open-menu.css'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('HomeJourney', HomeJourney)
    app.component('HomeTechStack', HomeTechStack)
    app.component('HomeDemo', HomeDemo)
    app.component('ToolAutoPreview', ToolAutoPreview)
    app.component('ToolsDirectory', ToolsDirectory)
    app.component('AgentLoopVisualizer', AgentLoopVisualizer)
    app.component('MermaidDiagram', MermaidDiagram)
    app.component('MindmapDiagram', MindmapDiagram)
    app.component('ImageCarousel', ImageCarousel)
    app.component('SingleImagePreview', SingleImagePreview)
    app.component('ContentSwitcher', ContentSwitcher)
  }
}
