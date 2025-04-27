<template>
  <div>
    <!-- Projects Section -->
    <section ref="projectsSection" class="min-h-screen sticky top-0 transition-all duration-500 bg-white"
      :style="{ opacity: projectsOpacity }">
      <div class="container mx-auto px-4 py-10">
        <h1 class="text-4xl font-bold text-center mb-10">Portfolio</h1>
        <!-- Projects Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ThreeDCard title="Project 1" />
          <ThreeDCard title="Project 2" />
          <ThreeDCard title="Portfolio" />
        </div>
      </div>
    </section>
    <!-- About Me Section -->
    <section class="min-h-screen bg-gray-50">
      <AboutSection />
    </section>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ThreeDCard from './components/ThreeDCard.vue'
import AboutSection from './components/AboutSection.vue'

export default {
  name: 'App',
  components: {
    ThreeDCard,
    AboutSection,
  },
  setup() {
    const projectsOpacity = ref(1)
    const projectsSection = ref(null)

    const handleScroll = () => {
      // Adjust opacity based on scroll position with full fade-out after 1 viewport height
      const fadeStart = 0
      const fadeUntil = window.innerHeight
      const scrolled = window.scrollY
      let opacity = 1 - (scrolled - fadeStart) / (fadeUntil - fadeStart)
      if (opacity < 0) opacity = 0
      projectsOpacity.value = opacity
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    return {
      projectsOpacity,
      projectsSection,
    }
  },
}
</script>