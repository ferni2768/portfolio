<template>
  <div class="container mx-auto pt-10 pb-28 space-y-8 md:space-y-7">
    <!-- SECTION 1: ABOUT ME -->
    <div class="flex flex-col md:flex-row items-center overflow-hidden">
      <div class="md:w-1/2 p-6 order-1">
        <h2 class="text-3xl font-semibold text-white mb-4">About Me</h2>
        <p class="text-gray-200 leading-relaxed">
          I'm a curious, detail-oriented developer who loves building websites that help people. I'm quick to learn,
          communicative, and bring a positive vibe to every team.
        </p>
      </div>
      <div ref="image1"
        class="image-container md:w-1/2 p-6 order-2 flex items-center justify-center h-64 overflow-hidden"
        :class="{ 'slide-from-right': image1Visible }" @mousemove="onImage1MouseMove" @mouseenter="onImage1MouseEnter"
        @mouseleave="onImage1MouseLeave" :style="{ cursor: showImage1Circle ? 'none' : 'auto' }">
        <img src="@/assets/images/aboutMe/me.webp" alt="About Me" class="object-cover h-full w-full no-drag"
          draggable="false" loading="eager" />
        <MouseCircle v-if="showImage1Circle" :position="image1CirclePosition" color="#000000" textColor="#ffffff"
          text="A little bit about me..." :size="150" :fontSize="20" :scale="1" :animating="false" />
      </div>
    </div>

    <!-- SECTION 2: CORE VALUES -->
    <div class="flex flex-col md:flex-row items-center">
      <div ref="imageGroup"
        class="image-container w-full md:w-1/2 order-2 md:order-1 relative h-[16rem] md:h-[17.5rem] overflow-hidden"
        :class="{ 'images-visible': imagesVisible }">
        <img src="@/assets/images/aboutMe/portfolio_example.webp" alt="Portfolio Example"
          class="cascade-image absolute left-[5%] top-[5%] max-h-[65%] max-w-[80%] z-10 object-contain no-drag"
          draggable="false" loading="eager" />
        <img src="@/assets/images/aboutMe/eurovisor_example.webp" alt="Eurovisor Example"
          class="cascade-image absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 max-h-[65%] max-w-[80%] z-20 object-contain no-drag"
          draggable="false" loading="eager" />
        <img src="@/assets/images/aboutMe/quickescape_example.webp" alt="QuickEscape Example"
          class="cascade-image absolute right-[8%] bottom-[5%] max-h-[65%] max-w-[80%] z-30 object-contain no-drag"
          draggable="false" loading="eager" />
      </div>
      <div class="md:w-1/2 p-6 order-1 md:order-2">
        <h2 class="text-3xl font-semibold text-white mb-4">What Drives Me</h2>
        <p class="text-gray-200 leading-relaxed">
          I'm driven by solving real-world problems with intuitive, accessible, and beautiful web design. I want tech to
          feel natural—something that simplifies life through thoughtful design.
        </p>
      </div>
    </div>

    <!-- SECTION 3: HOBBIES -->
    <div class="flex flex-col md:flex-row items-center overflow-hidden">
      <div class="md:w-1/2 p-6 order-1">
        <h2 class="text-3xl font-semibold text-white mb-4">When I'm Not Coding...</h2>
        <p class="text-gray-200 leading-relaxed">
          You'll probably find me watching movies or out for a walk—whether in the city or surrounded by nature. It's
          how I unwind and refuel my creativity.
        </p>
      </div>
      <div ref="image3"
        class="image-container md:w-1/2 p-6 order-2 flex items-center justify-center h-64 overflow-hidden"
        :class="{ 'slide-from-right': image3Visible }" @mousemove="onImage3MouseMove" @mouseenter="onImage3MouseEnter"
        @mouseleave="onImage3MouseLeave" :style="{ cursor: showImage3Circle ? 'none' : 'auto' }">
        <img src="@/assets/images/aboutMe/walking.webp" alt="Hobbies" class="object-cover h-full w-full no-drag"
          draggable="false" loading="eager" />
        <MouseCircle v-if="showImage3Circle" :position="image3CirclePosition" color="#000000" textColor="#ffffff"
          text="When I'm not coding..." :size="150" :fontSize="20" :scale="1" :animating="false" />
      </div>
    </div>

    <!-- SECTION 4: CALL TO ACTION -->
    <div class="flex flex-col md:flex-row w-full items-center justify-center">
      <div class="p-6 order-1 md:order-2 text-center md:text-left w-full">
        <h2 class="text-3xl font-semibold text-center text-white mb-4">Let’s Connect</h2>
        <div class="justify-center flex items-center">
          <p class="text-gray-200 text-center leading-relaxed mb-4 min-w-[33%] md:max-w-[50%]">
            Want to have a chat? Feel free to reach out—I'm always open to new opportunities and
            happy to answer any questions.
          </p>
        </div>
        <div class="justify-center flex items-center">
          <a href="mailto:a.fer.vazquez9@gmail.com"
            class="px-8 py-3 bg-indigo-600 w-fit flex hover:bg-indigo-500 text-white font-medium rounded-full transition-all duration-300">
            Contact Me
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MouseCircle from './MouseCircle.vue';

export default {
  name: 'AboutSection',
  components: {
    MouseCircle
  },
  data() {
    return {
      image1Visible: false,
      imagesVisible: false,
      image3Visible: false,

      showImage1Circle: false,
      image1CirclePosition: { x: 0, y: 0 },
      showImage3Circle: false,
      image3CirclePosition: { x: 0, y: 0 }
    }
  },
  mounted() {
    // Initialize Intersection Observer for each image
    const options = { root: null, rootMargin: '0px 0px -100px 0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.target === this.$refs.image1 && entry.isIntersecting) {
          this.image1Visible = true; obs.unobserve(entry.target);
        } else if (entry.target === this.$refs.imageGroup && entry.isIntersecting) {
          this.imagesVisible = true; obs.unobserve(entry.target);
        } else if (entry.target === this.$refs.image3 && entry.isIntersecting) {
          this.image3Visible = true; obs.unobserve(entry.target);
        }
      });
    }, options);
    [this.$refs.image1, this.$refs.imageGroup, this.$refs.image3].forEach(el => observer.observe(el));

    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    // Mouse handlers for first image
    onImage1MouseMove(event) {
      if (this.$refs.image1) {
        const rect = this.$refs.image1.getBoundingClientRect();
        this.image1CirclePosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
      }
    },
    onImage1MouseEnter() {
      this.showImage1Circle = true;
    },
    onImage1MouseLeave() {
      this.showImage1Circle = false;
    },

    // Mouse handlers for third image
    onImage3MouseMove(event) {
      if (this.$refs.image3) {
        const rect = this.$refs.image3.getBoundingClientRect();
        this.image3CirclePosition = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
      }
    },
    onImage3MouseEnter() {
      this.showImage3Circle = true;
    },
    onImage3MouseLeave() {
      this.showImage3Circle = false;
    },

    // Handle scroll events to update mouse circle position
    handleScroll() {
      if (this.showImage1Circle && this.$refs.image1) {
        const rect = this.$refs.image1.getBoundingClientRect();
        const lastMouseEvent = window.lastMouseEvent;

        if (lastMouseEvent) {
          this.image1CirclePosition = {
            x: lastMouseEvent.clientX - rect.left,
            y: lastMouseEvent.clientY - rect.top
          };
        }
      }

      if (this.showImage3Circle && this.$refs.image3) {
        const rect = this.$refs.image3.getBoundingClientRect();
        const lastMouseEvent = window.lastMouseEvent;

        if (lastMouseEvent) {
          this.image3CirclePosition = {
            x: lastMouseEvent.clientX - rect.left,
            y: lastMouseEvent.clientY - rect.top
          };
        }
      }
    }
  }
}
</script>

<style scoped>
.image-container {
  visibility: hidden;
}

/* No-drag styling */
.no-drag {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-select: none;
  -webkit-user-select: none;
  contain: content;
}

/* Animation classes for single images */
.slide-from-right {
  visibility: visible;
  animation: slideFromRight 1s cubic-bezier(0.2, 0.65, 0.4, 1) forwards;
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.slide-from-left {
  visibility: visible;
  animation: slideFromLeft 1s cubic-bezier(0.2, 0.65, 0.4, 1) forwards;
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Cascade image group styles */
.images-visible {
  visibility: visible;
}

.cascade-image {
  visibility: hidden;
  opacity: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease, z-index 0.1s;
  pointer-events: auto;
  contain: content;
  will-change: transform, opacity;
  backface-visibility: hidden;
}

.cascade-image-container {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  visibility: hidden;
  transition: transform 0.3s ease, z-index 0.1s ease, box-shadow 0.3s ease;
  max-width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  will-change: transform, opacity;
}

/* Make cascade images visible when parent container is visible */
.images-visible .cascade-image-container {
  visibility: visible;
}

.images-visible .cascade-image {
  visibility: visible;
}

/* Hover effects for cascade images */
.images-visible .cascade-image:hover {
  transform: scale3d(1.05, 1.05, 1);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 40 !important;
}

/* Animation timing for cascade images */
.images-visible .cascade-image:nth-child(1) {
  animation: slideFromLeft 0.75s cubic-bezier(0.2, 0.65, 0.4, 1) forwards;
  will-change: transform, opacity;
}

.images-visible .cascade-image:nth-child(2) {
  animation: slideUp 0.75s cubic-bezier(0.2, 0.65, 0.4, 1) 0.1s forwards;
  will-change: transform, opacity;
}

.images-visible .cascade-image:nth-child(3) {
  animation: slideFromRight 0.75s cubic-bezier(0.2, 0.65, 0.4, 1) 0.2s forwards;
  will-change: transform, opacity;
}

/* Media queries */
@media (min-width: 641px) and (max-width: 1023px) {
  .cascade-image:nth-child(3) {
    right: 5%;
  }
}

/* Animations */
@keyframes slideFromRight {
  0% {
    transform: translate3d(20%, 0, 0);
    opacity: 0;
  }

  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

@keyframes slideFromLeft {
  0% {
    transform: translate3d(-20%, 0, 0);
    opacity: 0;
  }

  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

@keyframes slideUp {
  0% {
    transform: translate3d(-52%, -30%, 0);
    opacity: 0;
  }

  100% {
    transform: translate3d(-52%, -50%, 0);
    opacity: 1;
  }
}
</style>