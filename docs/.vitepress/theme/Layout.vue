<script setup>
import { computed } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import HomeParticles from './components/HomeParticles.vue'
import HomeTypewriter from './components/HomeTypewriter.vue'
import Breadcrumb from './components/Breadcrumb.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import AnnouncementBar from './components/AnnouncementBar.vue'
import CommunityGroup from './components/CommunityGroup.vue'
import LastUpdated from './components/LastUpdated.vue'
import ContentLock from './components/ContentLock.vue'
import { useHtmlUrlRedirect } from './composables/useHtmlUrlRedirect'

const { Layout } = DefaultTheme
const { frontmatter } = useData()

useHtmlUrlRedirect()
</script>

<template>
    <Layout>
        <template #layout-top>
            <ReadingProgress />
            <ClientOnly>
                <AnnouncementBar />
            </ClientOnly>
        </template>

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
            <ClientOnly>
                <ContentLock v-if="frontmatter.layout !== 'home' && frontmatter.contentLock === true" />
            </ClientOnly>
        </template>

        <template #doc-footer-before>
            <LastUpdated v-if="frontmatter.layout !== 'home'" />
        </template>

        <template #layout-bottom>
            <CommunityGroup v-if="frontmatter.layout !== 'home'" compact />
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
