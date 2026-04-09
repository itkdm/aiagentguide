<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import HomeParticles from './components/HomeParticles.vue'
import HomeTypewriter from './components/HomeTypewriter.vue'
import AIOpenMenu from './components/AIOpenMenu.vue'
import HtmlUrlRedirector from './components/HtmlUrlRedirector.vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
</script>

<template>
    <HtmlUrlRedirector />
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
                <AIOpenMenu v-if="frontmatter.layout !== 'home'" />
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
