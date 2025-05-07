<template>
    <canvas ref="canvas" class="fixed block top-0 left-0 w-full h-screen pointer-events-none z-20" :style="{
        transform: `rotate(180deg) translateY(calc(${(-translateY / 1.3)}px + 35% - (${(titleHeight)}px + 40px)))`,
        opacity: dynamicOpacity
    }">
    </canvas>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import * as THREE from 'three'
import { createNoise4D } from 'simplex-noise'
import TOON_TONE from '@/assets/images/textures/threeTone.jpg'

export default {
    name: 'TheeDBackgroundWaves',
    props: {
        translateY: {
            type: Number,
            default: 0
        },
        titleHeight: {
            type: Number,
            default: 0
        },
    },
    setup(props) {
        const canvas = ref(null)
        const sceneObjects = {
            renderer: null,
            scene: null,
            camera: null,
            plane: null
        }
        let animationFrameId = null
        const noise4D = createNoise4D()

        const dynamicOpacity = computed(() => {
            return Math.max(0, 0.5 - (-props.translateY / 600))
        })

        // Constants for wave generation
        const WIDTH_SEGMENTS = 10
        const HEIGHT_SEGMENTS = 10
        const NOISE_SCALE = 10
        const HEIGHT_SCALE = 12
        const LIGHT_COLORS = [
            0xffffff,
            0x000000,
            0xffffff,
            0x000000
        ]

        // Maximum resolution constraints
        const MAX_WIDTH = 3840
        const MAX_HEIGHT = 2160

        // Setup renderer and camera
        const setupRenderingSystem = () => {
            sceneObjects.renderer = new THREE.WebGLRenderer({
                canvas: canvas.value,
                antialias: true,
                alpha: true
            })
            sceneObjects.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            const { width, height } = getConstrainedSize(window.innerWidth, window.innerHeight)
            sceneObjects.renderer.setSize(width, height, false)

            // Camera
            sceneObjects.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
            sceneObjects.camera.position.set(0, 30, 60)

            sceneObjects.scene = new THREE.Scene()
        }

        // Helper function to constrain dimensions while keeping aspect ratio
        const getConstrainedSize = (width, height) => {
            let finalWidth = width
            let finalHeight = height

            if (width > MAX_WIDTH) {
                finalWidth = MAX_WIDTH
                finalHeight = (height * MAX_WIDTH) / width
            }

            if (finalHeight > MAX_HEIGHT) {
                finalHeight = MAX_HEIGHT
                finalWidth = (finalWidth * MAX_HEIGHT) / finalHeight
            }

            return { width: Math.floor(finalWidth), height: Math.floor(finalHeight) }
        }

        // Create lighting system
        const setupLights = () => {
            const distance = 200
            LIGHT_COLORS.forEach((color, idx) => {
                const light = new THREE.PointLight(color, 2.5, distance)
                light.intensity = 5000
                const angle = (idx / LIGHT_COLORS.length) * Math.PI * 2
                light.position.set(Math.cos(angle) * 50, 30, Math.sin(angle) * 50)
                sceneObjects.scene.add(light)
            })

            // Add an ambient light to provide base illumination
            const ambientLight = new THREE.AmbientLight(0x111111, 2)
            sceneObjects.scene.add(ambientLight)
        }

        // Generate wave surface
        const generateWaveSurface = async () => {
            try {
                // Load texture
                const tex = await new Promise((resolve, reject) => {
                    new THREE.TextureLoader().load(
                        TOON_TONE,
                        texture => {
                            texture.minFilter = THREE.NearestFilter;
                            texture.magFilter = THREE.NearestFilter;
                            resolve(texture);
                        },
                        undefined,
                        reject
                    );
                });

                // Create mesh
                const waveMesh = (() => {
                    const geometry = new THREE.PlaneGeometry(200, 200, WIDTH_SEGMENTS, HEIGHT_SEGMENTS);
                    const material = new THREE.MeshToonMaterial({
                        color: 0xffffff,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.6,
                        gradientMap: tex,
                        flatShading: true
                    });

                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.rotation.x = -Math.PI / 2;
                    return mesh;
                })();

                sceneObjects.plane = waveMesh;
                sceneObjects.scene.add(waveMesh);
                return true;
            } catch (err) {
                console.error("Error initializing scene:", err);
                return false;
            }
        }

        // Display adaptation handler
        const adaptToDisplay = () => {
            if (!sceneObjects.camera || !sceneObjects.renderer) return;

            const aspectRatio = window.innerWidth / window.innerHeight;
            sceneObjects.camera.aspect = aspectRatio;
            sceneObjects.camera.updateProjectionMatrix();

            // Apply constrained size for better performance
            const { width, height } = getConstrainedSize(window.innerWidth, window.innerHeight)
            sceneObjects.renderer.setSize(width, height, false);
        }

        // Unified scene updater
        const updateScene = time => {
            const updateGeometry = () => {
                const vertices = sceneObjects.plane.geometry.attributes.position;
                const data = vertices.array;

                for (let idx = 0; idx < data.length; idx += 3) {
                    data[idx + 2] = noise4D(
                        data[idx] / NOISE_SCALE,
                        data[idx + 1] / NOISE_SCALE,
                        time,
                        0
                    ) * HEIGHT_SCALE;
                }

                vertices.needsUpdate = true;
                sceneObjects.plane.geometry.computeVertexNormals();
            };

            // Rotate lights with vectorized approach
            const updateLights = () => {
                const yAxis = new THREE.Vector3(0, 1, 0);
                const rotationAngle = 0.002;

                sceneObjects.scene.children
                    .filter(obj => obj instanceof THREE.PointLight)
                    .forEach(light => light.position.applyAxisAngle(yAxis, rotationAngle));
            };

            updateGeometry();
            updateLights();
        };

        const renderLoop = () => {
            animationFrameId = requestAnimationFrame(renderLoop);

            if (sceneObjects.plane?.geometry) {
                const timeFactor = performance.now() * 0.00003;
                updateScene(timeFactor);
                sceneObjects.renderer.render(sceneObjects.scene, sceneObjects.camera);
            }
        }

        const onResize = () => {
            adaptToDisplay()
        }

        // Initialize the scene
        const initScene = async () => {
            setupRenderingSystem()
            setupLights()

            const success = await generateWaveSurface()
            if (success) {
                window.addEventListener('resize', onResize)
                renderLoop()
            }
        }

        onMounted(() => {
            initScene().catch(error => {
                console.error("Failed to initialize scene:", error)
            })
        })

        onBeforeUnmount(() => {
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener('resize', onResize)

            // Clean up resources
            if (sceneObjects.renderer) sceneObjects.renderer.dispose()
            if (sceneObjects.plane) {
                sceneObjects.plane.geometry.dispose()
                sceneObjects.plane.material.dispose()
            }
        })

        return { canvas, dynamicOpacity }
    }
}
</script>