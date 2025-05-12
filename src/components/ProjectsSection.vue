<template>
    <div class="container mx-auto px-4 py-10">
        <!-- Header Section -->
        <div ref="headerSection" class="mb-5 md:mb-16 relative">
            <h1 class="relative text-4xl font-bold text-center mb-3">
                <div class="inline-block select-none" ref="nameHeading" @mousemove="onNameMouseMove"
                    @mouseenter="onNameMouseEnter" @mouseleave="onNameMouseLeave" @click="handleCircleClick"
                    @touchstart="onNameTouchStart" @touchmove="onNameTouchMove" @touchend="onNameTouchEnd"
                    :style="{ cursor: showNameCircle ? 'pointer' : 'auto' }">Alejandro
                    Fernández Vázquez</div>
            </h1>
            <p class="text-xl text-center text-gray-600 mb-6">Software Developer | Focused on User-Centric App Design
            </p>

            <!-- Contact & Social Links -->
            <div class="flex justify-center space-x-6 mt-4">
                <a href="mailto:a.fer.vazquez9@gmail.com"
                    class="flex items-center text-gray-700 hover:text-indigo-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                </a>
                <a href="https://github.com/ferni2768" target="_blank" rel="noopener noreferrer"
                    class="flex items-center text-gray-700 hover:text-indigo-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                </a>
                <a href="https://www.linkedin.com/in/afernandez3/" target="_blank" rel="noopener noreferrer"
                    class="flex items-center text-gray-700 hover:text-indigo-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="currentColor"
                        viewBox="0 0 24 24">
                        <path
                            d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    LinkedIn
                </a>
            </div>

            <!-- Mouse Circle -->
            <MouseCircle v-if="showNameCircle" :position="nameCirclePosition" color="#3367c0" textColor="#ffffff"
                text="Welcome!" :size="90" :fontSize="15" :scale="nameCircleScale" :animating="isAnimating"
                :translateY="90" ref="mouseCircleRef" @circle-click="handleCircleClick" />
        </div>

        <!-- Projects Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ThreeDCard title="QuickEscape" image="quickescape_logo" tagline="Interactive Trip Timeline Organizer"
                :miniCards="quickEscapeMiniCards" :exposure="0.5" url="https://quickescape.netlify.app/" />
            <ThreeDCard title="Eurovisor" image="eurovisor_logo" tagline="Explore Eurovision Song Contest performances"
                :miniCards="eurovisorMiniCards" :exposure="0.5" url="https://eurovisor.netlify.app/" />
            <ThreeDCard ref="thirdCard" title="Portfolio ✓" image="eurovisor_logo"
                tagline="It's this website! Scroll down to find out more" :miniCards="portfolioMiniCards"
                :exposure="0.5" :isPortfolio="true" />
        </div>
    </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ThreeDCard from './ThreeDCard.vue'
import MouseCircle from './MouseCircle.vue'

export default {
    name: 'ProjectsSection',
    components: {
        ThreeDCard,
        MouseCircle
    },
    setup() {
        const thirdCard = ref(null)
        const headerSection = ref(null)
        const headerHeight = ref(0)
        const nameHeading = ref(null)
        const mouseCircleRef = ref(null)
        let resizeObserver = null

        // Mouse circle state
        const showNameCircle = ref(false)
        const nameCirclePosition = ref({ x: 0, y: 0 })
        const nameCircleScale = ref(1)
        const isAnimating = ref(false)
        const linkedInUrl = "https://www.linkedin.com/in/afernandez3/"

        // Touch interaction flags and timers
        const isUsingTouch = ref(false)
        const isTouchTap = ref(false)
        const touchTapDelay = 250
        const touchTapTimer = ref(null)
        const touchStartTime = ref(0)
        const TOUCH_TAP_THRESHOLD = 300
        const isTouchActive = ref(false)

        // Mouse handlers for name heading
        const onNameMouseMove = (event) => {
            if (nameHeading.value && !isUsingTouch.value) {
                const rect = headerSection.value.getBoundingClientRect()
                nameCirclePosition.value = {
                    x: event.clientX - rect.left + 5,
                    y: event.clientY - rect.top
                }
            }
        }

        const onNameMouseEnter = () => {
            if (!isUsingTouch.value) {
                showNameCircle.value = true;
            }
        }

        const onNameMouseLeave = () => {
            if (!isUsingTouch.value && !isTouchTap.value && !isAnimating.value) {
                showNameCircle.value = false;
            }
        }

        // Touch handlers for name heading
        const onNameTouchStart = (event) => {
            isUsingTouch.value = true;
            isTouchActive.value = true;
            touchStartTime.value = Date.now();

            const touch = event.touches[0];
            const rect = headerSection.value.getBoundingClientRect();

            nameCirclePosition.value = {
                x: touch.clientX - rect.left + 5,
                y: touch.clientY - rect.top
            };
        }

        const onNameTouchMove = (event) => {
            if (!isTouchActive.value) return;

            const touch = event.touches[0];
            const rect = headerSection.value.getBoundingClientRect();

            nameCirclePosition.value = {
                x: touch.clientX - rect.left + 5,
                y: touch.clientY - rect.top
            };

            // If we're dragging, cancel any tap processing
            if (isTouchTap.value) {
                isTouchTap.value = false;
                showNameCircle.value = false;
                if (touchTapTimer.value) {
                    clearTimeout(touchTapTimer.value);
                    touchTapTimer.value = null;
                }
            }
        }

        const onNameTouchEnd = () => {
            const touchDuration = Date.now() - touchStartTime.value;

            if (isTouchActive.value && touchDuration < TOUCH_TAP_THRESHOLD) {
                // This was a tap - show the circle immediately
                isTouchTap.value = true;
                showNameCircle.value = true;

                if (touchTapTimer.value) {
                    clearTimeout(touchTapTimer.value);
                }

                touchTapTimer.value = setTimeout(() => {
                    isAnimating.value = true;
                    nameCircleScale.value = 1.2;

                    setTimeout(() => {
                        nameCircleScale.value = 0;

                        setTimeout(() => {
                            window.open(linkedInUrl, '_blank');
                            isAnimating.value = false;
                            nameCircleScale.value = 1;
                            isTouchTap.value = false;

                            // Hide circle after animation
                            showNameCircle.value = false;
                            setTimeout(() => {
                                isUsingTouch.value = false;
                            }, 100);
                        }, 300);
                    }, 150);
                }, touchTapDelay);
            } else {
                showNameCircle.value = false;
            }

            isTouchActive.value = false;
        }

        // Handle click on the circle - for mouse clicks only
        const handleCircleClick = () => {
            if (!isUsingTouch.value && showNameCircle.value && !isAnimating.value) {
                isAnimating.value = true;
                nameCircleScale.value = 1.2;

                setTimeout(() => {
                    nameCircleScale.value = 0;

                    setTimeout(() => {
                        window.open(linkedInUrl, '_blank');
                        isAnimating.value = false;
                        nameCircleScale.value = 1;
                    }, 300);
                }, 150);
            }
        }

        // Mini cards configuration for QuickEscape
        const quickEscapeMiniCards = [
            {
                position: [28.2, 16, -4],
                rotation: [-10, 10, 2],
                size: 13,
                image: 'reactLogo',
                textureScaler: 1.1,
                materialColor: 0x5c6780,
                exposure: 0.5,
                name: 'React',
                url: 'https://reactjs.org'
            },
            {
                position: [42.1, 16, -1],
                rotation: [-10, 5, 0],
                size: 13,
                image: 'jsLogo',
                textureScaler: 1.3,
                materialColor: 0xffaa16,
                exposure: 0.9,
                name: 'JavaScript',
                url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
            },
            {
                position: [55.9, 16, -1],
                rotation: [-10, -5, 0],
                size: 13,
                image: 'muiLogo',
                textureScaler: 1.25,
                materialColor: 0x47a6ff,
                exposure: 0.7,
                name: 'Material UI',
                url: 'https://mui.com/material-ui/getting-started/'
            },
            {
                position: [69.9, 16, -4],
                rotation: [-10, -10, 0],
                size: 13,
                image: 'springLogo',
                textureScaler: 1.1,
                materialColor: 0xd42c2c,
                exposure: 1,
                name: 'React Spring',
                url: 'https://react-spring.dev'
            }
        ]

        // Mini cards configuration for Eurovisor
        const eurovisorMiniCards = [
            {
                position: [28.2, 16, -4],
                rotation: [-10, 10, 2],
                size: 13,
                image: 'nextLogo',
                textureScaler: 0.8,
                materialColor: 0x000000,
                exposure: 1,
                name: 'Next.js',
                url: 'https://nextjs.org/docs'
            },
            {
                position: [42.1, 16, -1],
                rotation: [-10, 5, 0],
                size: 13,
                image: 'tsLogo',
                textureScaler: 1.3,
                materialColor: 0x1f86db,
                exposure: 0.8,
                name: 'TypeScript',
                url: 'https://www.typescriptlang.org'
            },
            {
                position: [55.9, 16, -1],
                rotation: [-10, -5, 0],
                size: 13,
                image: 'tailwindLogo',
                textureScaler: 1.3,
                materialColor: 0x47a6ff,
                exposure: 0.7,
                name: 'Tailwind CSS',
                url: 'https://tailwindcss.com'
            },
            {
                position: [69.9, 16, -4],
                rotation: [-10, -10, 0],
                size: 13,
                image: 'eurovisionapiLogo',
                textureScaler: 1.1,
                materialColor: 0x5730e6,
                exposure: 0.7,
                name: 'Eurovision API',
                url: 'https://eurovisionapi.runasp.net/'
            }
        ]

        // Mini cards configuration for Portfolio
        const portfolioMiniCards = [
            {
                position: [28, 16, -4],
                rotation: [-10, 10, 2],
                size: 13,
                image: 'vueLogo',
                textureScaler: 1.3,
                materialColor: 0x58a35d,
                exposure: 0.7,
                name: 'Vue.js',
                url: 'https://vuejs.org/guide/introduction.html'
            },
            {
                position: [42, 16, -1],
                rotation: [-10, 5, 0],
                size: 13,
                image: 'jsLogo',
                textureScaler: 1.3,
                materialColor: 0xffaa16,
                exposure: 0.9,
                name: 'JavaScript',
                url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
            },
            {
                position: [55.9, 16, -1],
                rotation: [-10, -5, 0],
                size: 13,
                image: 'tailwindLogo',
                textureScaler: 1.3,
                materialColor: 0x47a6ff,
                exposure: 0.7,
                name: 'Tailwind CSS',
                url: 'https://tailwindcss.com'
            },
            {
                position: [70, 16, -4],
                rotation: [-10, -10, 0],
                size: 13,
                image: 'threeLogo',
                textureScaler: 1.3,
                materialColor: 0x000000,
                exposure: 1,
                name: 'Three.js',
                url: 'https://threejs.org'
            }
        ]

        const updateHeaderHeight = () => {
            if (headerSection.value) {
                headerHeight.value = headerSection.value.offsetHeight
            }
        }

        onMounted(() => {
            updateHeaderHeight()

            resizeObserver = new ResizeObserver(updateHeaderHeight)
            if (headerSection.value) {
                resizeObserver.observe(headerSection.value)
            }
            window.addEventListener('resize', updateHeaderHeight)
        })

        onBeforeUnmount(() => {
            if (resizeObserver) {
                resizeObserver.disconnect()
            }
            window.removeEventListener('resize', updateHeaderHeight)

            if (touchTapTimer.value) {
                clearTimeout(touchTapTimer.value);
            }
        })

        return {
            thirdCard,
            headerSection,
            headerHeight,
            nameHeading,
            mouseCircleRef,
            quickEscapeMiniCards,
            eurovisorMiniCards,
            portfolioMiniCards,
            showNameCircle,
            nameCirclePosition,
            nameCircleScale,
            onNameMouseMove,
            onNameMouseEnter,
            onNameMouseLeave,
            onNameTouchStart,
            onNameTouchMove,
            onNameTouchEnd,
            handleCircleClick,
            isAnimating
        }
    }
}
</script>

<style scoped>
.select-none {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
</style>