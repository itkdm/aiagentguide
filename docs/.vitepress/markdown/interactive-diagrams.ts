import type MarkdownIt from 'markdown-it'

function renderComponent(name: string, content: string) {
  const serialized = JSON.stringify(content)
  return `<${name} :code='${serialized}' />`
}

export function useInteractiveDiagramMarkdown(md: MarkdownIt) {
  const fallbackFence =
    md.renderer.rules.fence ??
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const info = token.info.trim().split(/\s+/u)[0]

    if (info === 'mermaid') {
      return renderComponent('MermaidDiagram', token.content)
    }

    if (info === 'mindmap' || info === 'markmap') {
      return renderComponent('MindmapDiagram', token.content)
    }

    return fallbackFence(tokens, idx, options, env, self)
  }
}
