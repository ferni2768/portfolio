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
import { onMounted, ref, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

export default {
  name: 'ThreeDCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    maxResolution: {
      type: Number,
      default: 3
    },
    maxRotation: {
      type: Number,
      default: 0.7
    },
    image: {
      type: String,
      default: 'eurovisor_logo'
    }
  },
  setup(props) {
    const canvas = ref(null)
    let scene, camera, renderer, cube, animationId
    let mouseOffsetX = 0, mouseOffsetY = 0
    const offsetFactor = 0.35
    let resizeObserver = null

    // Constants to control the intensities of the lights
    const AMBIENT_LIGHT_INTENSITY = 2
    const DIRECTIONAL_LIGHT_INTENSITY = 1
    const POINT_LIGHT_INTENSITY = 1

    // Get the image texture path
    const resolvedImage = (!props.image.includes('/') && !props.image.endsWith('.jpg'))
      ? require(`@/assets/images/${props.image}.jpg`)
      : props.image

    const initThree = () => {
      scene = new THREE.Scene()

      const width = canvas.value.clientWidth
      const height = canvas.value.clientHeight

      camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000)
      camera.position.z = 5

      renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, props.maxResolution))
      renderer.setSize(width, height, false)

      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      // Create the rounded box geometry
      const geometry = createRoundedBoxGeometry(5, 5, 1.8, 0.9, 10)

      // Load texture
      const textureLoader = new THREE.TextureLoader()
      textureLoader.load(resolvedImage, (texture) => {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(0.31, 0.31)

        // Use MeshStandardMaterial to respond to lighting
        const materials = [
          new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7, metalness: 0.2 }), // Front face
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.2 }), // Back face
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.2 }), // Top face
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.2 }), // Bottom face
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.2 }), // Right face
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.2 })  // Left face
        ]
        cube = new THREE.Mesh(geometry, materials)
        cube.castShadow = true
        cube.receiveShadow = true

        scene.add(cube)

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY)
        scene.add(ambientLight)

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, DIRECTIONAL_LIGHT_INTENSITY)
        directionalLight.position.set(5, 5, 5)
        directionalLight.castShadow = true

        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 1024
        directionalLight.shadow.mapSize.height = 1024
        directionalLight.shadow.camera.near = 0.5
        directionalLight.shadow.camera.far = 50
        directionalLight.shadow.camera.left = -10
        directionalLight.shadow.camera.right = 10
        directionalLight.shadow.camera.top = 10
        directionalLight.shadow.camera.bottom = -10

        scene.add(directionalLight)

        // Point light - emits light in all directions from a point
        const pointLight = new THREE.PointLight(0xffaa00, POINT_LIGHT_INTENSITY, 20)
        pointLight.position.set(-5, 3, -5)
        pointLight.castShadow = true

        // Configure shadow properties
        pointLight.shadow.mapSize.width = 1024
        pointLight.shadow.mapSize.height = 1024

        scene.add(pointLight)
        animate()
      })
    }

    // Function to create rounded box geometry
    function createRoundedBoxGeometry(width, height, depth, radius, smoothness) {
      const shape = new THREE.Shape()
      const eps = 0.00001
      const radius0 = radius - eps
      shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true)
      shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true)
      shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true)
      shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true)
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: depth - radius * 2,
        bevelEnabled: true,
        bevelSegments: smoothness * 2,
        steps: 1,
        bevelSize: radius0,
        bevelThickness: radius,
        curveSegments: smoothness
      })
      geometry.center()
      return geometry
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      if (cube) {
        // Compute target position using only mouse effects
        const offsetX = mouseOffsetX * offsetFactor
        const offsetY = -mouseOffsetY * offsetFactor

        // Measure the tilt-offset magnitude
        const rotationMag = Math.sqrt(offsetX * offsetX + offsetY * offsetY)

        if (rotationMag > props.maxRotation) {
          const identityQuat = new THREE.Quaternion()
          cube.quaternion.slerp(identityQuat, 0.05)
        } else {
          const effectiveTarget = camera.position.clone().add(
            new THREE.Vector3(offsetX, offsetY, 0)
          )
          const targetMatrix = new THREE.Matrix4().lookAt(effectiveTarget, cube.position, cube.up)
          const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(targetMatrix)
          cube.quaternion.slerp(targetQuaternion, 0.05)
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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, props.maxResolution))
        renderer.setSize(width, height, false)
      }
    }

    // Calculate the rotation based on mouse position remains unchanged
    const onGlobalMouseMove = (event) => {
      if (!canvas.value || !canvas.value.parentNode) return

      const rect = canvas.value.parentNode.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      // Calculate normalized offset: range [-1, 1] relative to container center
      mouseOffsetX = (event.clientX - centerX) / (rect.width / 2)
      mouseOffsetY = (event.clientY - centerY) / (rect.height / 2)
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
    })

    onBeforeUnmount(() => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onWindowResize)
      window.removeEventListener('mousemove', onGlobalMouseMove)

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