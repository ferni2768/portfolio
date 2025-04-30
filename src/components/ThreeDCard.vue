<template>
  <div class="w-full h-64 relative">
    <div class="w-full h-full p-4">
      <canvas ref="canvas" class="w-full h-full"></canvas>
    </div>
    <div class="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
      {{ title }}
    </div>
  </div>
</template>

<script>
import { onMounted, ref, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'

export default {
  name: 'ThreeDCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    scrollY: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const canvas = ref(null)
    let scene, camera, renderer, cube, animationId
    let mouseOffsetX = 0, mouseOffsetY = 0
    const offsetFactor = 0.075
    let resizeObserver = null

    // Smooth scroll animation variables
    let targetScrollRotationX = 0
    let targetScrollRotationY = 0
    let currentScrollRotationX = 0
    let currentScrollRotationY = 0
    const scrollEaseFactor = 0.05
    let cardRect = null

    const initThree = () => {
      scene = new THREE.Scene()

      const width = canvas.value.clientWidth
      const height = canvas.value.clientHeight

      camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000)
      camera.position.z = 5

      renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: true })
      renderer.setSize(width, height, false)

      // Create the cube geometry
      const geometry = new THREE.BoxGeometry(5, 5, 1)
      const material = new THREE.MeshStandardMaterial({ color: 0x0077ff, roughness: 0.5 })
      cube = new THREE.Mesh(geometry, material)
      scene.add(cube)

      // Lighting
      const light = new THREE.DirectionalLight(0xffffff, 1)
      light.position.set(5, 5, 5)
      scene.add(light)

      // Force a render to ensure proper initial state
      renderer.render(scene, camera)
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // Apply smooth easing for scroll-based rotation
      currentScrollRotationX += (targetScrollRotationX - currentScrollRotationX) * scrollEaseFactor
      currentScrollRotationY += (targetScrollRotationY - currentScrollRotationY) * scrollEaseFactor

      // Compute an effective target based on the camera's position plus offsets from mouse and scroll
      const effectiveTarget = camera.position.clone().add(
        new THREE.Vector3(
          mouseOffsetX * offsetFactor + currentScrollRotationY,
          -mouseOffsetY * offsetFactor + currentScrollRotationX,
          0
        )
      )

      const targetMatrix = new THREE.Matrix4().lookAt(effectiveTarget, cube.position, cube.up)
      const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(targetMatrix)

      // Smoothly interpolate from the cube's current rotation to the target rotation
      cube.quaternion.slerp(targetQuaternion, 0.05)

      renderer.render(scene, camera)
    }

    const onWindowResize = () => {
      if (canvas.value && camera && renderer) {
        const width = canvas.value.clientWidth
        const height = canvas.value.clientHeight
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
      }
      updateCardRect()
    }

    const updateCardRect = () => {
      if (canvas.value && canvas.value.parentNode) {
        cardRect = canvas.value.parentNode.getBoundingClientRect()
        calculateScrollRotation(props.scrollY)
      }
    }

    const calculateScrollRotation = (scrollY) => {
      if (!cardRect) return

      // Calculate card's position relative to viewport center
      const viewportCenter = window.innerHeight / 2
      const cardCenter = cardRect.top + cardRect.height / 2
      const distanceFromCenter = (cardCenter - viewportCenter) / viewportCenter

      // Update target rotation based on scroll position and card position
      targetScrollRotationX = distanceFromCenter * 0.5

      // Add oscillation effect based on scroll position
      const oscillation = Math.sin(scrollY * 0.002) * 0.2
      targetScrollRotationY = oscillation
    }

    // Global mouse move listener that calculates the offset relative to this card's container
    const onGlobalMouseMove = (event) => {
      if (!canvas.value || !canvas.value.parentNode) return

      const rect = canvas.value.parentNode.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      // Calculate normalized offset: range [-1, 1] relative to container center
      mouseOffsetX = (event.clientX - centerX) / (rect.width / 2)
      mouseOffsetY = (event.clientY - centerY) / (rect.height / 2)
    }

    // Watch for scroll position changes to update card rotation
    watch(() => props.scrollY, (newScrollY) => {
      calculateScrollRotation(newScrollY)
    })

    onMounted(() => {
      setTimeout(() => {
        initThree()
        animate()
        updateCardRect()

        // Only set up the ResizeObserver after Three.js is initialized
        resizeObserver = new ResizeObserver(() => {
          onWindowResize()
        })

        if (canvas.value && canvas.value.parentNode) {
          resizeObserver.observe(canvas.value.parentNode)
        }
      }, 50)

      window.addEventListener('resize', onWindowResize)
      window.addEventListener('mousemove', onGlobalMouseMove)
      window.addEventListener('scroll', updateCardRect)
    })

    onBeforeUnmount(() => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onWindowResize)
      window.removeEventListener('mousemove', onGlobalMouseMove)
      window.removeEventListener('scroll', updateCardRect)

      if (resizeObserver) {
        resizeObserver.disconnect()
      }

      if (renderer) {
        renderer.dispose()
      }
    })

    return {
      canvas
    }
  }
}
</script>