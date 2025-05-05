<template>
  <div class="relative overflow-hidden">
    <!-- Projects Section -->
    <div class="min-h-screen relative top-0 w-full h-screen z-20 flex justify-center">
      <section ref="projectsSection"
        class="fixed min-h-screen w-full z-20 bg-white flex justify-center will-change-transform"
        :style="{ transform: `translateY(${projectsTranslate}px)` }">
        <div class="container mx-auto px-4 py-10">
          <h1 class="text-4xl font-bold text-center mb-10">Portfolio</h1>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ThreeDCard title="Project 1" />
            <ThreeDCard title="Project 2" />
            <ThreeDCard ref="thirdCard" title="Portfolio" />
          </div>
        </div>
      </section>
    </div>

    <!-- Transition Stripes -->
    <div class="vertical-stripes-container fixed top-0 left-0 w-full h-screen pointer-events-none z-30">
      <div v-for="i in (windowWidth >= 768 ? 9 : 5)" :key="i"
        class="vertical-stripe transition-none will-change-transform bg-black absolute" :style="{
          left: `${(i - 1) * (100 / (windowWidth >= 768 ? 9 : 5))}%`,
          width: `calc(${100 / (windowWidth >= 768 ? 9 : 5)}% + 3px)`,
          height: '2000vh',
          bottom: '-1900vh',
          transform: `translateY(${stripesPosition[i - 1]}px)`
        }">
      </div>
    </div>

    <!-- About Me Section -->
    <section ref="aboutSection" class="z-40 fixed w-full min-h-[75vh] will-change-transform pb-10 px-10" :style="{
      top: '0',
      transform: `translateY(${aboutTranslate}px)`
    }">
      <AboutSection />
    </section>

    <!-- Dynamic spacer to allow proper scrolling -->
    <div :style="{ height: `${totalScrollHeight}px` }"></div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
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
    const aboutSection = ref(null)
    const windowWidth = ref(window.innerWidth)
    const windowHeight = ref(window.innerHeight)
    const thirdCard = ref(null)

    // Calculate initial positions
    const isSingleRow = windowWidth.value >= 768
    const multiplier = isSingleRow ? 1 : 3
    const STRIPE_OFFSET = (100 * multiplier) + 200
    const DIST = STRIPE_OFFSET
    const stripeStart = Math.max(windowHeight.value, DIST)

    // Initialize with starting positions
    const projectsTranslate = ref(0)
    const aboutTranslate = ref(stripeStart)
    const stripesPosition = ref(new Array(9).fill(stripeStart))
    const currentScrollY = ref(0)
    const smoothedScrollY = ref(0)

    // Target values for smooth animations
    const targetProjectsTranslate = ref(0)
    const targetAboutTranslate = ref(stripeStart)
    const targetStripesPosition = ref(new Array(9).fill(stripeStart))

    // Track section heights
    const projectsSectionHeight = ref(0)
    const aboutSectionHeight = ref(0)

    let animationFrameId = null
    const easeOutFactor = 0.05
    const stripeSpeedFactors = [2.1, 1.8, 2.3, 1.9, 1.6, 2.25, 2.1, 1.7, 2.2]
    const mobileStripeSpeedFactors = [2.1, 1.8, 2.3, 1.9, 1.6]

    // Compute the total scroll height needed
    const totalScrollHeight = computed(() => {
      const isSingleRow = windowWidth.value >= 768
      const multiplier = isSingleRow ? 1 : 3

      // 1) Compute stripeStart
      const cardEl = thirdCard.value?.$el
      const cardHeight = cardEl?.getBoundingClientRect().height || 0
      const STRIPE_OFFSET = (100 * multiplier) + 200
      const DIST = (cardHeight * multiplier) + STRIPE_OFFSET
      const stripeStart = Math.max(windowHeight.value, DIST)

      // 2) Compute the height of the About section
      const transitionPoint = stripeStart - windowHeight.value
      const aboutHeight = aboutSectionHeight.value

      // 3) Calculate the total scroll height
      const scrollToAlignInPhase1 = stripeStart + aboutHeight - windowHeight.value
      const scrollToAlignInPhase2 = transitionPoint + (aboutHeight / 0.9)

      if (scrollToAlignInPhase1 <= transitionPoint) {
        return scrollToAlignInPhase1
      } else {
        return scrollToAlignInPhase2
      }
    })

    const handleScroll = () => {
      const scrolled = window.scrollY
      currentScrollY.value = scrolled

      // Calculate stripe parameters
      const cardEl = thirdCard.value?.$el
      const cardRect = cardEl?.getBoundingClientRect() || { height: 0 }
      const windowHeight = window.innerHeight
      const isSingleRow = window.innerWidth >= 768
      const multiplier = isSingleRow ? 1 : 3
      const STRIPE_OFFSET = (100 * multiplier) + 200
      const DIST = (cardRect.height * multiplier) + STRIPE_OFFSET
      const stripeStart = Math.max(windowHeight, DIST)
      const transitionPoint = stripeStart - windowHeight

      if (scrolled <= 0) {
        // Initial position - at the top of the screen
        targetProjectsTranslate.value = 0
      } else {
        targetProjectsTranslate.value = -(scrolled * 0.9)
      }

      // Calculate About section translation
      if (scrolled <= 0) {
        // Initial position - align with stripes
        targetAboutTranslate.value = stripeStart
      } else if (scrolled <= transitionPoint) {
        // Phase 1: Move with stripes at the same rate
        targetAboutTranslate.value = stripeStart - scrolled
      } else {
        // Phase 2: After transition point, move at a different rate
        const delta = scrolled - transitionPoint
        targetAboutTranslate.value = windowHeight - (delta * 0.9)
      }

      // Update stripe positions
      const stripeCount = windowWidth.value >= 768 ? 9 : 5
      for (let i = 0; i < stripeCount; i++) {
        if (scrolled <= transitionPoint) {
          // Phase 1: Move with the scroll
          targetStripesPosition.value[i] = stripeStart - scrolled
        } else {
          // Phase 2: After transition point, move at a different rate
          const scrollBeyondThreshold = scrolled - transitionPoint
          const speedFactor = windowWidth.value >= 768
            ? stripeSpeedFactors[i]
            : mobileStripeSpeedFactors[i]
          targetStripesPosition.value[i] = windowHeight - (scrollBeyondThreshold * speedFactor)
        }
      }
    }

    // Smooth scrolling animation
    const animateScroll = () => {
      smoothedScrollY.value += (currentScrollY.value - smoothedScrollY.value) * easeOutFactor

      projectsTranslate.value += (targetProjectsTranslate.value - projectsTranslate.value) * easeOutFactor
      aboutTranslate.value += (targetAboutTranslate.value - aboutTranslate.value) * easeOutFactor

      const stripeCount = windowWidth.value >= 768 ? 9 : 5
      for (let i = 0; i < stripeCount; i++) {
        stripesPosition.value[i] +=
          (targetStripesPosition.value[i] - stripesPosition.value[i]) * easeOutFactor
      }

      animationFrameId = requestAnimationFrame(animateScroll)
    }

    // Update section heights on resize
    const updateSectionHeights = () => {
      if (projectsSection.value) {
        projectsSectionHeight.value = projectsSection.value.offsetHeight
      }

      if (aboutSection.value) {
        aboutSectionHeight.value = aboutSection.value.offsetHeight
      }
    }

    const onResize = () => {
      windowWidth.value = window.innerWidth
      windowHeight.value = window.innerHeight
      updateSectionHeights()
      handleScroll()
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
      window.addEventListener('resize', onResize)
      window.addEventListener('orientationchange', onResize)

      updateSectionHeights()
      animationFrameId = requestAnimationFrame(animateScroll)
      handleScroll()
    })

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    })

    return {
      projectsTranslate,
      aboutTranslate,
      projectsSection,
      aboutSection,
      stripesPosition,
      thirdCard,
      totalScrollHeight,
      smoothedScrollY,
      windowWidth
    }
  },
}
</script>