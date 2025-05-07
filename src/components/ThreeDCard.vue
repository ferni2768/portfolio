<template>
  <div :style="{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease-in' }"
    class="w-full flex flex-col items-center">
    <div class="w-full h-64 relative">
      <div class="w-full h-full">
        <canvas ref="canvas" class="w-full h-full"></canvas>
      </div>
    </div>
    <div class="text-center text-2xl text-black font-normal">
      {{ title }}
    </div>
  </div>
</template>

<script>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import TOON_TONE from '@/assets/images/textures/threeTone.jpg'

const MAX_RESOLUTION = 3
const MAX_ROTATION = 0.6

export default {
  name: 'ThreeDCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: 'eurovisor_logo'
    },
    textureScale: {
      type: Number,
      default: 1.25,
      validator: value => value > 0 && value <= 1
    },
    materialColor: {
      type: [Number, String],
      default: 0xffffff
    }
  },
  setup(props) {
    const canvas = ref(null)
    const loaded = ref(false)
    let scene, camera, renderer, cube, animationId
    let mouseOffsetX = 0, mouseOffsetY = 0
    let lastMouseX = null, lastMouseY = null
    const offsetFactor = 0.3
    const positionOffsetFactor = 0.175
    let resizeObserver = null
    let initialPosition = new THREE.Vector3(0, 0, 0)

    // Constants to control the intensities of the lights
    const AMBIENT_LIGHT_INTENSITY = 2
    const DIRECTIONAL_LIGHT_INTENSITY = 10

    // Get the image texture path
    const resolvedImage = (!props.image.includes('/') && !props.image.endsWith('.jpg'))
      ? require(`@/assets/images/${props.image}.jpg`)
      : props.image

    const initThree = async () => {
      scene = new THREE.Scene()

      const width = canvas.value.clientWidth
      const height = canvas.value.clientHeight

      camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000)
      camera.position.z = 5

      renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_RESOLUTION))
      renderer.setSize(width, height, false)
      renderer.outputEncoding = THREE.sRGBEncoding
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 0.5

      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      // Create the rounded box geometry
      const geometry = new RoundedBoxGeometry(5, 5, 1.8, 2, 5)

      const textureLoader = new THREE.TextureLoader()
      const toonTexture = await new THREE.TextureLoader().loadAsync(TOON_TONE)
      toonTexture.minFilter = toonTexture.magFilter = THREE.NearestFilter

      // Load the textures
      textureLoader.load(resolvedImage, (texture) => {
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping

        // Create a front face material with centered and scaled texture
        const frontMaterial = new THREE.MeshToonMaterial({
          color: props.materialColor,
          gradientMap: toonTexture
        })

        frontMaterial.map = texture
        const scale = props.textureScale
        const offsetX = (1 - scale) / 2
        const offsetY = (1 - scale) / 2

        // Apply scaling and offset
        texture.repeat.set(scale, scale)
        texture.offset.set(offsetX, offsetY)

        const materials = [
          new THREE.MeshToonMaterial({
            color: props.materialColor,
            gradientMap: toonTexture
          }),
          new THREE.MeshToonMaterial({
            color: props.materialColor,
            gradientMap: toonTexture
          }),
          new THREE.MeshToonMaterial({
            color: props.materialColor,
            gradientMap: toonTexture
          }),
          new THREE.MeshToonMaterial({
            color: props.materialColor,
            gradientMap: toonTexture
          }),
          frontMaterial, // Front face with texture
          new THREE.MeshToonMaterial({
            color: props.materialColor,
            gradientMap: toonTexture
          })
        ]

        cube = new THREE.Mesh(geometry, materials)
        scene.add(cube)
        initialPosition.copy(cube.position)

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY)
        scene.add(ambientLight)

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, DIRECTIONAL_LIGHT_INTENSITY)
        directionalLight.position.set(3, 2, 0.5)
        directionalLight.target = cube
        scene.add(directionalLight.target)

        // Configure shadow properties
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = 1024
        directionalLight.shadow.mapSize.height = 1024
        directionalLight.shadow.camera.near = 0.5
        directionalLight.shadow.camera.far = 50
        directionalLight.shadow.camera.left = -10
        directionalLight.shadow.camera.right = 10
        directionalLight.shadow.camera.top = 10
        directionalLight.shadow.camera.bottom = -10

        scene.add(directionalLight)

        loaded.value = true
        animate()
      })
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      if (cube) {
        // Compute target position using only mouse effects
        const offsetX = mouseOffsetX * offsetFactor
        const offsetY = -mouseOffsetY * offsetFactor

        // Measure the tilt-offset magnitude
        const rotationMag = Math.sqrt(offsetX * offsetX + offsetY * offsetY)

        if (rotationMag > MAX_ROTATION) {
          const identityQuat = new THREE.Quaternion()
          cube.quaternion.slerp(identityQuat, 0.05)

          const targetPosition = initialPosition.clone()
          cube.position.lerp(targetPosition, 0.05)
        } else {
          const effectiveTarget = camera.position.clone().add(
            new THREE.Vector3(offsetX, offsetY, 0)
          )
          const targetMatrix = new THREE.Matrix4().lookAt(effectiveTarget, cube.position, cube.up)
          const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(targetMatrix)
          cube.quaternion.slerp(targetQuaternion, 0.05)

          // Apply position offset based on mouse position
          const translationX = mouseOffsetX * positionOffsetFactor
          const translationY = -mouseOffsetY * positionOffsetFactor
          const targetPosition = initialPosition.clone().add(new THREE.Vector3(translationX, translationY, 0))
          cube.position.lerp(targetPosition, 0.05)
        }

        renderer.render(scene, camera)
      }
    }

    const onWindowResize = () => {
      if (canvas.value && camera && renderer) {
        const width = canvas.value.clientWidth
        const height = canvas.value.clientHeight
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_RESOLUTION))
        renderer.setSize(width, height, false)
      }
    }

    // Calculate the rotation based on mouse position remains unchanged
    const onGlobalMouseMove = (event) => {
      lastMouseX = event.clientX
      lastMouseY = event.clientY
      if (!canvas.value || !canvas.value.parentNode) return

      const rect = canvas.value.parentNode.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      // Calculate normalized offset: range [-1, 1] relative to container center
      mouseOffsetX = (event.clientX - centerX) / (rect.width / 2)
      mouseOffsetY = (event.clientY - centerY) / (rect.height / 2)
    }

    const onWindowScroll = () => {
      // On scroll, update mouse offset using stored coordinates if available
      if (lastMouseX !== null && lastMouseY !== null) {
        onGlobalMouseMove({ clientX: lastMouseX, clientY: lastMouseY })
      }
    }

    onMounted(() => {
      setTimeout(() => {
        initThree()

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
      window.addEventListener('scroll', onWindowScroll)
    })

    onBeforeUnmount(() => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onWindowResize)
      window.removeEventListener('mousemove', onGlobalMouseMove)
      window.removeEventListener('scroll', onWindowScroll)

      if (resizeObserver) {
        resizeObserver.disconnect()
      }

      if (renderer) {
        renderer.dispose()
      }
    })

    return {
      canvas,
      loaded
    }
  }
}
</script>