<template>
  <div class="relative overflow-hidden">
    <!-- Projects Section -->
    <section ref="projectsSection" class="min-h-screen relative z-20 bg-white"
      :style="{ transform: `translateY(${projectsTranslate}px)` }">
      <div class="container mx-auto px-4 py-10">
        <h1 class="text-4xl font-bold text-center mb-10">Portfolio</h1>
        <!-- Projects Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ThreeDCard title="Project 1" :scrollY="currentScrollY" />
          <ThreeDCard title="Project 2" :scrollY="currentScrollY" />
          <ThreeDCard title="Portfolio" :scrollY="currentScrollY" />
        </div>
      </div>
    </section>

    <!-- Vertical Stripes -->
    <div class="vertical-stripes-container fixed top-0 left-0 w-full h-screen pointer-events-none z-30">
      <div v-for="i in 9" :key="i" class="vertical-stripe bg-black absolute" :style="{
        left: `${(i - 1) * (100 / 9)}%`,
        width: `calc(${100 / 9}% + 1px)`,
        height: '500vh',
        bottom: '-400vh',
        transform: `translateY(${stripesPosition[i - 1]}px)`
      }">
      </div>
    </div>

    <!-- About Me Section - Position initially below viewport -->
    <section class="min-h-screen z-40 fixed w-full" :style="{
      top: '100vh',
      transform: `translateY(${aboutTranslate}px)`
    }">
      <AboutSection />
    </section>

    <!-- Spacer to allow scrolling -->
    <div class="h-[100vh]"></div>
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
    const projectsSection = ref(null)
    const projectsTranslate = ref(0)
    const aboutTranslate = ref(0)
    const stripesPosition = ref(new Array(9).fill(0))
    const currentScrollY = ref(0)

    // Target values for smooth animations
    const targetProjectsTranslate = ref(0)
    const targetAboutTranslate = ref(0)
    const targetStripesPosition = ref(new Array(9).fill(0))

    // Animation frame ID for cleanup
    let animationFrameId = null

    // Ease out factor (0-1)
    const easeOutFactor = 0.075

    // Easily modifiable array for stripe velocities
    const stripeSpeedFactors = [2.1, 1.8, 2.3, 1.9, 1.6, 2.25, 2.1, 1.7, 2.2]

    const handleScroll = () => {
      const scrolled = window.scrollY
      const windowHeight = window.innerHeight

      // Update currentScrollY for 3D cards
      currentScrollY.value = scrolled

      // Calculate target values but don't apply them immediately
      targetProjectsTranslate.value = scrolled * 0.3
      targetAboutTranslate.value = -(scrolled * 0.9)

      // Update target stripe positions in array
      for (let i = 0; i < 9; i++) {
        targetStripesPosition.value[i] = getStripeTranslateValue(i + 1, scrolled, windowHeight)
      }
    }

    const animateScroll = () => {
      // Animate projects position with ease-out
      projectsTranslate.value += (targetProjectsTranslate.value - projectsTranslate.value) * easeOutFactor

      // Animate about section with ease-out
      aboutTranslate.value += (targetAboutTranslate.value - aboutTranslate.value) * easeOutFactor

      // Animate each stripe with ease-out
      for (let i = 0; i < 9; i++) {
        stripesPosition.value[i] += (targetStripesPosition.value[i] - stripesPosition.value[i]) * easeOutFactor
      }

      animationFrameId = requestAnimationFrame(animateScroll)
    }

    // Calculate individual stripe position
    const getStripeTranslate = (index) => {
      return stripesPosition.value[index - 1]
    }

    // Calculate stripe position with configurable speeds
    const getStripeTranslateValue = (index, scrolled, windowHeight) => {
      const scrollFactor = stripeSpeedFactors[index - 1]

      // Starting position: stripes are off-screen below
      const startPos = windowHeight

      // Calculate position
      return startPos - (scrolled * scrollFactor)
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
      // Start animation loop
      animationFrameId = requestAnimationFrame(animateScroll)

      // Initialize with current scroll position
      handleScroll()
    })

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScroll)
      // Cancel animation frame when component is destroyed
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    })

    return {
      projectsTranslate,
      aboutTranslate,
      projectsSection,
      getStripeTranslate,
      stripesPosition,
      currentScrollY
    }
  },
}
</script>

<style scoped>
.vertical-stripes-container {
  z-index: 30;
}

.vertical-stripe {
  transition: none;
}

.vertical-stripe,
section {
  will-change: transform;
}
</style>