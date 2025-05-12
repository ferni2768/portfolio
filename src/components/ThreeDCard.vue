<template>
  <div :style="{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease-in' }"
    class="w-full flex flex-col items-center">
    <div class="w-full h-64 relative" ref="cardContainer" @mousemove="onCardMouseMove" @mouseout="onCardMouseOut"
      @touchstart="onTouchStart" @touchend="onCardMouseOut" @click="handleCardClick"
      :style="{ cursor: getCursorStyle() }">
      <div class="w-full h-full">
        <canvas ref="canvas" class="w-full h-full"></canvas>
      </div>
      <MouseCircle v-if="showCircle" :position="circlePosition" :color="circleColor" :text="circleText"
        :scale="circleScale" :animating="isAnimating" :size="circleSize" :fontSize="circleFontSize"
        :translateY="circleTranslateY" @circle-click="handleCardClick" ref="mouseCircleRef" />
    </div>
    <div class="text-center text-2xl text-black font-normal">
      {{ displayTitle }}
    </div>
    <div class="text-center text-lg text-neutral-400 font-light mt-1">
      {{ tagline }}
    </div>
  </div>
</template>

<script>
import { onMounted, ref, onBeforeUnmount, computed } from 'vue'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import TOON_TONE from '@/assets/images/textures/threeTone.jpg'
import MouseCircle from '@/components/MouseCircle.vue'

const MAX_RESOLUTION = 3
const MAX_ROTATION = 0.6

const MAIN_CARD_CIRCLE_SIZE = 110
const MINI_CARD_CIRCLE_SIZE = 65
const MAIN_CARD_FONT_SIZE = 16
const MINI_CARD_FONT_SIZE = 10
const PORTFOLIO_CARD_COLOR = "#8c8c8c"
const NON_PORTFOLIO_CARD_COLOR = "#303030"
const CHECK_MARK = " ✓"

const visitedSites = new Set();

export default {
  name: 'ThreeDCard',
  components: {
    MouseCircle
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    tagline: {
      type: String,
      default: 'This is the tagline of the project'
    },
    image: {
      type: String,
      default: 'eurovisor_logo'
    },
    textureScale: {
      type: Number,
      default: 1.25,
      validator: value => value > 0 && value <= 5
    },
    materialColor: {
      type: [Number, String],
      default: 0xffffff
    },
    exposure: {
      type: Number,
      default: 0.5
    },
    url: {
      type: String,
      default: ''
    },
    miniCards: {
      type: Array,
      default: () => [],
      validator: value => {
        return value.every(card => {
          return 'position' in card && Array.isArray(card.position) && card.position.length === 3 &&
            'size' in card && 'image' in card && 'textureScaler' in card && 'materialColor' in card &&
            (!('rotation' in card) || (Array.isArray(card.rotation) && card.rotation.length === 3)) &&
            (!('exposure' in card) || typeof card.exposure === 'number') &&
            (!('name' in card) || typeof card.name === 'string') &&
            (!('url' in card) || typeof card.url === 'string');
        });
      }
    },
    isPortfolio: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const canvas = ref(null)
    const loaded = ref(false)
    const cardContainer = ref(null)
    const showCircle = ref(false)
    const circlePosition = ref({ x: 0, y: 0 })
    const hoveredMiniCard = ref(null)
    const circleColor = ref('#000000')
    const isAnimating = ref(false)
    const circleScale = ref(1)
    const mouseCircleRef = ref(null)
    const circleTranslateY = ref(0)
    const circleSize = ref(MAIN_CARD_CIRCLE_SIZE)
    const circleFontSize = ref(MAIN_CARD_FONT_SIZE)
    const isHoveringMiniCard = ref(false)
    const hasVisited = ref(false)

    // Touch interaction timer
    const touchTimer = ref(null)
    const isMobileInteraction = ref(false)
    const touchTimeoutDuration = 1000
    const isUsingTouch = ref(false)

    // Add smoothing for touch reset animation
    const isResettingTouch = ref(false)
    const touchResetStartTime = ref(0)
    const touchResetDuration = 500
    const isTouchActive = ref(false)

    // Add flags for touch tap handling
    const isTouchTap = ref(false)
    const touchTapDelay = 250
    const touchTapTimer = ref(null)
    const touchStartTime = ref(0)
    const TOUCH_TAP_THRESHOLD = 300

    // For visibility optimization
    const isInViewport = ref(false)
    const renderFrequency = ref(1)
    const frameCounter = ref(0)
    const observer = ref(null)
    const isInitialized = ref(false)

    // Mark site as visited
    const markSiteAsVisited = (url) => {
      if (!url) return
      visitedSites.add(url)
      hasVisited.value = true
    }

    const checkIfVisited = () => {
      if (props.url) {
        hasVisited.value = visitedSites.has(props.url)
      }
      if (props.isPortfolio && props.url) {
        markSiteAsVisited(props.url)
      }
    }

    // Display title with check mark if visited
    const displayTitle = computed(() => {
      return hasVisited.value ? `${props.title}${CHECK_MARK}` : props.title
    })

    const circleText = computed(() => {
      if (hoveredMiniCard.value) {
        return hoveredMiniCard.value.name;
      }

      if (props.isPortfolio) {
        return "You are here!";
      }

      if (props.title === 'QuickEscape') {
        return 'Go to' + '\n' + 'QE';
      }

      return `Go to ${props.title}`;
    });

    let scene, camera, renderer, cube, animationId
    let mouseOffsetX = 0, mouseOffsetY = 0
    let lastMouseX = null, lastMouseY = null
    const offsetFactor = 0.3
    const positionOffsetFactor = 0.175
    let resizeObserver = null
    let initialPosition = new THREE.Vector3(0, 0, 0)
    let miniCubes = []
    let activeUrl = null

    // Constants to control the intensities of the lights
    const AMBIENT_LIGHT_INTENSITY = 2
    const DIRECTIONAL_LIGHT_INTENSITY = 10

    // Get the image texture path
    const resolvedImage = (!props.image.includes('/') && !props.image.endsWith('.jpg'))
      ? require(`@/assets/images/${props.image}.jpg`)
      : props.image

    // Setup the Intersection Observer
    const setupIntersectionObserver = () => {
      observer.value = new IntersectionObserver(
        (entries) => {
          const isVisible = entries[0].isIntersecting;
          isInViewport.value = isVisible;
          renderFrequency.value = isVisible ? 1 : 5;

          if (isVisible && !isInitialized.value) {
            initThree();
            isInitialized.value = true;
          }
        },
        {
          root: null,
          rootMargin: '200px',
          threshold: 0.01
        }
      );

      if (cardContainer.value) {
        observer.value.observe(cardContainer.value);
      }
    };

    // Create mini card textures and materials
    const createMiniCardTextureMaterial = async (imagePath, textureScaleValue, colorValue, toonTexture, exposure = 0.5) => {
      return new Promise((resolve) => {
        const textureLoader = new THREE.TextureLoader()
        textureLoader.load(imagePath, (texture) => {
          texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
          texture.colorSpace = THREE.SRGBColorSpace

          const adjustColorForExposure = (color, exp) => {
            const hexColor = typeof color === 'number' ? color : parseInt(color.replace('#', ''), 16)
            const r = ((hexColor >> 16) & 255) * exp
            const g = ((hexColor >> 8) & 255) * exp
            const b = (hexColor & 255) * exp
            return (r << 16) | (g << 8) | b
          }

          // Calculate brightness multiplier based on exposure
          const brightnessMultiplier = Math.max(0.2, exposure);

          const material = new THREE.MeshToonMaterial({
            color: new THREE.Color(brightnessMultiplier, brightnessMultiplier, brightnessMultiplier),
            gradientMap: toonTexture
          })
          material.map = texture

          const scale = textureScaleValue
          const offsetX = (1 - scale) / 2
          const offsetY = (1 - scale) / 2

          // Apply scaling and offset
          texture.repeat.set(scale, scale)
          texture.offset.set(offsetX, offsetY)

          const adjustedColor = adjustColorForExposure(colorValue, brightnessMultiplier)
          const backgroundMaterial = new THREE.MeshToonMaterial({
            color: adjustedColor,
            gradientMap: toonTexture
          })

          resolve({
            frontMaterial: material,
            backgroundMaterial: backgroundMaterial
          })
        })
      })
    }

    // Create mini cubes
    const createMiniCubes = async (toonTexture) => {
      if (props.miniCards.length === 0) return

      for (const miniCard of props.miniCards) {
        const resolvedMiniImage = (!miniCard.image.includes('/') && !miniCard.image.endsWith('.jpg'))
          ? require(`@/assets/images/mini/${miniCard.image}.jpg`)
          : miniCard.image

        // Calculate position relative to the parent card
        const xPos = (miniCard.position[0] / 100) * 5 - 2.5
        const yPos = (miniCard.position[1] / 100) * 5 - 2.5
        const zPos = 1.5 - (miniCard.position[2] / 100) * 3

        const miniSize = Math.max((miniCard.size / 100) * 5, 0.2)
        const geometry = new RoundedBoxGeometry(miniSize, miniSize, miniSize * 0.6, 2, 5)

        try {
          const miniCardExposure = 'exposure' in miniCard
            ? Math.min(Math.max(miniCard.exposure, 0), 1)
            : props.exposure;

          const { frontMaterial, backgroundMaterial } = await createMiniCardTextureMaterial(
            resolvedMiniImage,
            Math.min(Math.max(miniCard.textureScaler, 0.1), 10),
            miniCard.materialColor,
            toonTexture,
            miniCardExposure
          )

          // Create the materials for the mini cube
          const materials = [
            backgroundMaterial,
            backgroundMaterial,
            backgroundMaterial,
            backgroundMaterial,
            frontMaterial, // Front face
            backgroundMaterial
          ]

          const miniCube = new THREE.Mesh(geometry, materials)
          miniCube.position.set(xPos, yPos, zPos)

          // Apply rotation
          if (miniCard.rotation && Array.isArray(miniCard.rotation) && miniCard.rotation.length === 3) {
            miniCube.rotation.set(
              THREE.MathUtils.degToRad(miniCard.rotation[0]),
              THREE.MathUtils.degToRad(miniCard.rotation[1]),
              THREE.MathUtils.degToRad(miniCard.rotation[2])
            );
          }

          cube.add(miniCube)
          miniCubes.push(miniCube)
        } catch (error) {
          console.error(`Error creating mini card for ${props.title}:`, error)
        }
      }
    }

    const initThree = async () => {
      if (isInitialized.value) return;

      scene = new THREE.Scene()

      const width = canvas.value.clientWidth
      const height = canvas.value.clientHeight

      camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000)
      camera.position.z = 5

      renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_RESOLUTION))
      renderer.setSize(width, height, false)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = props.exposure

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

        // Apply the texture
        frontMaterial.map = texture
        const scale = props.textureScale
        const offsetX = (1 - scale) / 2
        const offsetY = (1 - scale) / 2

        // Apply scaling and offset
        texture.repeat.set(scale, scale)
        texture.offset.set(offsetX, offsetY)

        // Use renderer's exposure settings
        frontMaterial.toneMappingExposure = props.exposure

        const materials = [
          new THREE.MeshToonMaterial({
            color: props.materialColor,
            gradientMap: toonTexture,
            toneMappingExposure: props.exposure
          }),
          new THREE.MeshToonMaterial({
            color: props.materialColor,
            gradientMap: toonTexture,
            toneMappingExposure: props.exposure
          }),
          new THREE.MeshToonMaterial({
            color: props.materialColor,
            gradientMap: toonTexture,
            toneMappingExposure: props.exposure
          }),
          new THREE.MeshToonMaterial({
            color: props.materialColor,
            gradientMap: toonTexture,
            toneMappingExposure: props.exposure
          }),
          frontMaterial, // Front face with texture
          new THREE.MeshToonMaterial({
            color: props.materialColor,
            gradientMap: toonTexture,
            toneMappingExposure: props.exposure
          })
        ]

        cube = new THREE.Mesh(geometry, materials)
        scene.add(cube)
        initialPosition.copy(cube.position)

        // Create mini cubes
        createMiniCubes(toonTexture).then(() => {
          const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY)
          scene.add(ambientLight)

          // Directional light
          const directionalLight = new THREE.DirectionalLight(0xffffff, DIRECTIONAL_LIGHT_INTENSITY)
          directionalLight.position.set(3, 2, 0.5)
          directionalLight.target = cube
          scene.add(directionalLight.target)
          scene.add(directionalLight)

          // Point light
          const pointLight = new THREE.PointLight(0xffffff, 1)
          pointLight.position.set(0, 0, 3)
          scene.add(pointLight)

          loaded.value = true
          animate()
        }).catch(error => {
          console.error(`Error creating mini cards for ${props.title}:`, error)
          loaded.value = true
          animate()
        })
      })
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // Only update and render based on frequency
      frameCounter.value = (frameCounter.value + 1) % renderFrequency.value
      if (frameCounter.value !== 0 && !isInViewport.value) {
        return
      }

      if (cube) {
        // Handle smooth reset animation if needed
        if (isResettingTouch.value) {
          const elapsedTime = Date.now() - touchResetStartTime.value
          const progress = Math.min(elapsedTime / touchResetDuration, 1)
          const easedProgress = 1 - Math.pow(1 - progress, 3)

          mouseOffsetX *= (1 - easedProgress * 0.1)
          mouseOffsetY *= (1 - easedProgress * 0.1)

          if (progress >= 1) {
            mouseOffsetX = 0
            mouseOffsetY = 0
            isResettingTouch.value = false
          }
        }

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
      if (isUsingTouch.value) return

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
      if (isUsingTouch.value) return

      // On scroll, update mouse offset using stored coordinates if available
      if (lastMouseX !== null && lastMouseY !== null) {
        onGlobalMouseMove({ clientX: lastMouseX, clientY: lastMouseY })
      }
    }

    // Helper function to determine cursor style
    const getCursorStyle = () => {
      if (!showCircle.value) return 'auto';
      if (isHoveringMiniCard.value) return 'pointer';
      return 'none';
    }

    const onCardMouseMove = (event) => {
      if (!isInViewport.value) return;

      // Update circle position relative to the card container
      const rect = cardContainer.value.getBoundingClientRect()
      circlePosition.value = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }

      // Check if mouse is over any object in the scene
      if (scene && camera && renderer && cube) {
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Create raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

        // Reset values
        hoveredMiniCard.value = null;
        activeUrl = null;
        circleTranslateY.value = 0;
        circleSize.value = MAIN_CARD_CIRCLE_SIZE;
        circleFontSize.value = MAIN_CARD_FONT_SIZE;
        isHoveringMiniCard.value = false;
        showCircle.value = false;

        const miniCubeIntersects = raycaster.intersectObjects(miniCubes);

        if (miniCubeIntersects.length === 0 && miniCubes.length > 0) {
          const ERROR_MARGIN = 3;
          const errorMarginX = (ERROR_MARGIN / rect.width) * 2;

          // Check left margin
          const raycasterLeft = new THREE.Raycaster();
          raycasterLeft.setFromCamera(new THREE.Vector2(mouseX - errorMarginX, mouseY), camera);
          const leftIntersects = raycasterLeft.intersectObjects(miniCubes);

          // Check right margin
          const raycasterRight = new THREE.Raycaster();
          raycasterRight.setFromCamera(new THREE.Vector2(mouseX + errorMarginX, mouseY), camera);
          const rightIntersects = raycasterRight.intersectObjects(miniCubes);

          if (leftIntersects.length > 0) {
            const miniCubeIndex = miniCubes.indexOf(leftIntersects[0].object);
            handleMiniCardHover(miniCubeIndex);
          } else if (rightIntersects.length > 0) {
            const miniCubeIndex = miniCubes.indexOf(rightIntersects[0].object);
            handleMiniCardHover(miniCubeIndex);
          } else {
            const mainCardIntersects = raycaster.intersectObject(cube);
            if (mainCardIntersects.length > 0) {
              showCircle.value = true;

              if (props.isPortfolio) {
                circleColor.value = PORTFOLIO_CARD_COLOR;
              } else {
                circleColor.value = NON_PORTFOLIO_CARD_COLOR;
              }

              activeUrl = props.url || null;
            }
          }
        } else if (miniCubeIntersects.length > 0) {
          const miniCubeIndex = miniCubes.indexOf(miniCubeIntersects[0].object);
          handleMiniCardHover(miniCubeIndex);
        } else {
          const mainCardIntersects = raycaster.intersectObject(cube);
          if (mainCardIntersects.length > 0) {
            showCircle.value = true;

            if (props.isPortfolio) {
              circleColor.value = PORTFOLIO_CARD_COLOR;
            } else {
              circleColor.value = NON_PORTFOLIO_CARD_COLOR;
            }

            activeUrl = props.url || null;
          }
        }
      }
    }

    // Helper function to handle mini card hover state
    const handleMiniCardHover = (miniCubeIndex) => {
      if (miniCubeIndex !== -1 && props.miniCards[miniCubeIndex]) {
        hoveredMiniCard.value = props.miniCards[miniCubeIndex];
        showCircle.value = true;
        circleTranslateY.value = -95;
        circleSize.value = MINI_CARD_CIRCLE_SIZE;
        circleFontSize.value = MINI_CARD_FONT_SIZE;
        isHoveringMiniCard.value = true;

        // Use the material color from the mini card directly
        const cardColor = props.miniCards[miniCubeIndex].materialColor;
        const color = typeof cardColor === 'number'
          ? `#${cardColor.toString(16).padStart(6, '0')}`
          : cardColor;

        circleColor.value = color;
        activeUrl = props.miniCards[miniCubeIndex].url || null;
      }
    }

    // Handle card click to open URLs
    const handleCardClick = () => {
      const urlToOpen = activeUrl;

      if (!showCircle.value || !urlToOpen) return;

      // If it's a touch event
      if (isUsingTouch.value) {
        if (!isTouchTap.value) {
          isTouchTap.value = true;
          showCircle.value = true;

          // Clear any existing timer
          if (touchTapTimer.value) {
            clearTimeout(touchTapTimer.value);
          }

          // Hold the circle still for the delay period
          touchTapTimer.value = setTimeout(() => {
            isAnimating.value = true;
            circleScale.value = 1.2;

            setTimeout(() => {
              circleScale.value = 0;

              setTimeout(() => {
                window.open(urlToOpen, '_blank');

                if (urlToOpen === props.url) {
                  setTimeout(() => {
                    markSiteAsVisited(urlToOpen);
                  }, 100);
                }

                isAnimating.value = false;
                circleScale.value = 1;
                isTouchTap.value = false;
                showCircle.value = false;
              }, 300);
            }, 150);
          }, touchTapDelay);
        }
      }
      // If it's a mouse click
      else if (!isAnimating.value) {
        isAnimating.value = true;
        circleScale.value = 1.2;

        setTimeout(() => {
          circleScale.value = 0;

          setTimeout(() => {
            window.open(urlToOpen, '_blank');

            if (urlToOpen === props.url) {
              setTimeout(() => {
                markSiteAsVisited(urlToOpen);
              }, 100);
            }

            isAnimating.value = false;
            circleScale.value = 1;
          }, 300);
        }, 150);
      }
    }

    // Handle global touch start event
    const onGlobalTouchStart = (event) => {
      if (!isInViewport.value || !cardContainer.value) return;

      const touch = event.touches[0];
      const rect = cardContainer.value.getBoundingClientRect();

      touchStartTime.value = Date.now();

      // Check if touch is within or near the card's container
      if (isTouchNearElement(touch, rect, 50)) {
        isTouchActive.value = true;
        handleTouchInteraction(touch, rect);
      }
    }

    // Handle global touch move event
    const onGlobalTouchMove = (event) => {
      if (!isTouchActive.value || !isInViewport.value || !cardContainer.value) return;

      const touch = event.touches[0];
      const rect = cardContainer.value.getBoundingClientRect();
      handleTouchInteraction(touch, rect);

      // If we're dragging, cancel any tap processing
      if (isTouchTap.value) {
        isTouchTap.value = false;
        if (touchTapTimer.value) {
          clearTimeout(touchTapTimer.value);
          touchTapTimer.value = null;
        }
      }
    }

    // Handle global touch end event
    const onGlobalTouchEnd = () => {
      const touchDuration = Date.now() - touchStartTime.value;

      if (isTouchActive.value) {
        if (touchDuration < TOUCH_TAP_THRESHOLD) {
          // This was a tap - process it
          if (showCircle.value) {
            handleCardClick();
          }
        }

        isTouchActive.value = false;
        startTouchReset();
      }
    }

    // Check if touch is within or near an element
    const isTouchNearElement = (touch, rect, margin = 0) => {
      return touch.clientX >= (rect.left - margin) &&
        touch.clientX <= (rect.right + margin) &&
        touch.clientY >= (rect.top - margin) &&
        touch.clientY <= (rect.bottom + margin);
    }

    // Common touch interaction handling
    const handleTouchInteraction = (touch, rect) => {
      isResettingTouch.value = false;
      isUsingTouch.value = true;
      isMobileInteraction.value = true;

      if (touchTimer.value) {
        clearTimeout(touchTimer.value);
      }

      // Simulate a mouse event at the touch position
      const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };

      // Update global mouse position but don't let it be changed by scroll
      lastMouseX = touch.clientX;
      lastMouseY = touch.clientY;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseOffsetX = (touch.clientX - centerX) / (rect.width / 2);
      mouseOffsetY = (touch.clientY - centerY) / (rect.height / 2);

      const previousShowCircle = showCircle.value;
      showCircle.value = false;

      onCardMouseMove(simulatedEvent);

      if (isTouchTap.value || isAnimating.value) {
        showCircle.value = previousShowCircle;
      } else {
        showCircle.value = false;
      }

      touchTimer.value = setTimeout(() => {
        startTouchReset();
      }, touchTimeoutDuration);
    }

    // Simplify local touch handler to delegate to global handler
    const onTouchStart = (event) => {
      if (!isInViewport.value) return;
      const touch = event.touches[0];
      const rect = cardContainer.value.getBoundingClientRect();
      isTouchActive.value = true;
      handleTouchInteraction(touch, rect);
    }

    // Start the smooth reset process instead of immediately setting to zero
    const startTouchReset = () => {
      isResettingTouch.value = true;
      touchResetStartTime.value = Date.now();

      if (touchTimer.value) {
        clearTimeout(touchTimer.value);
        touchTimer.value = null;
      }

      setTimeout(() => {
        if (isResettingTouch.value) {
          isResettingTouch.value = false;
          mouseOffsetX = 0;
          mouseOffsetY = 0;
          isMobileInteraction.value = false;

          if (!isTouchTap.value && !isAnimating.value) {
            isUsingTouch.value = false;
          }
        }

        // Only hide circle if we're not in a tap animation
        if (!isTouchTap.value && !isAnimating.value) {
          showCircle.value = false;
        }
      }, touchResetDuration + 100);
    }

    // Update existing mouse out function to handle touch events
    const onCardMouseOut = () => {
      if (isUsingTouch.value && (isTouchTap.value || isAnimating.value)) {
        return;
      }

      if (!isMobileInteraction.value) {
        showCircle.value = false;
      }
    }

    onMounted(() => {
      setTimeout(() => {
        setupIntersectionObserver();

        // Only initialize Three.js if in viewport
        if (isInViewport.value) {
          initThree();
          isInitialized.value = true;
        }

        window.addEventListener('resize', onWindowResize)
        window.addEventListener('mousemove', onGlobalMouseMove)
        window.addEventListener('scroll', onWindowScroll)
        window.addEventListener('touchstart', onGlobalTouchStart)
        window.addEventListener('touchmove', onGlobalTouchMove)
        window.addEventListener('touchend', onGlobalTouchEnd)

        checkIfVisited()
      }, 50)
    })

    onBeforeUnmount(() => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onWindowResize)
      window.removeEventListener('mousemove', onGlobalMouseMove)
      window.removeEventListener('scroll', onWindowScroll)
      window.removeEventListener('touchstart', onGlobalTouchStart)
      window.removeEventListener('touchmove', onGlobalTouchMove)
      window.removeEventListener('touchend', onGlobalTouchEnd)

      if (observer.value) {
        observer.value.disconnect();
      }

      if (resizeObserver) {
        resizeObserver.disconnect()
      }

      if (renderer) {
        renderer.dispose()
      }

      if (touchTimer.value) {
        clearTimeout(touchTimer.value);
      }

      if (touchTapTimer.value) {
        clearTimeout(touchTapTimer.value);
      }
    })

    return {
      canvas,
      loaded,
      cardContainer,
      showCircle,
      circlePosition,
      circleColor,
      hoveredMiniCard,
      onCardMouseMove,
      onCardMouseOut,
      onTouchStart,
      handleCardClick,
      circleText,
      isAnimating,
      circleScale,
      mouseCircleRef,
      circleTranslateY,
      circleSize,
      circleFontSize,
      getCursorStyle,
      displayTitle
    }
  }
}
</script>