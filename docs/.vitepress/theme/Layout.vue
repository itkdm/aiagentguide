<script setup>
import { computed } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import HomeParticles from './components/HomeParticles.vue'
import HomeTypewriter from './components/HomeTypewriter.vue'
import Breadcrumb from './components/Breadcrumb.vue'
import { useHtmlUrlRedirect } from './composables/useHtmlUrlRedirect'

const { Layout } = DefaultTheme
const { frontmatter } = useData()

useHtmlUrlRedirect()
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
            <Breadcrumb />
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
