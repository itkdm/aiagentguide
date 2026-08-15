<script setup>
import { computed } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import HomeParticles from './components/HomeParticles.vue'
import HomeTypewriter from './components/HomeTypewriter.vue'
import AIOpenMenu from './components/AIOpenMenu.vue'
import { useHtmlUrlRedirect } from './composables/useHtmlUrlRedirect'

const { Layout } = DefaultTheme
const { frontmatter } = useData()

useHtmlUrlRedirect()

const shouldShowAIOpenMenu = computed(() => {
    if (frontmatter.value.layout === 'home') {
        return false
    }

    const pageClass = frontmatter.value.pageClass
    if (typeof pageClass !== 'string') {
        return true
    }

    const pageClasses = pageClass.split(/\s+/)
    return !pageClasses.includes('tools-directory') && !pageClasses.includes('tool-detail-page')
})
</script>

<template>
    <Layout>
        <template #home-hero-before>
            <ClientOnly>
                <div v-if="frontmatter.layout === 'home'" class="home-hero-background-wrapper">
                    <HomeParticles />
                </div>
            </ClientOnly>
        </template>

        <template #home-hero-info-before>
            <ClientOnly>
                <HomeTypewriter v-if="frontmatter.layout === 'home'" />
            </ClientOnly>
        </template>

        <template #doc-before>
            <ClientOnly>
                <AIOpenMenu v-if="shouldShowAIOpenMenu" />
            </ClientOnly>
        </template>
    </Layout>
</template>

<style scoped>
.home-hero-background-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
}
</style>
