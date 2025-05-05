<template>
    <div class="container mx-auto px-4 py-10">
        <h1 class="text-4xl font-bold text-center mb-10">Portfolio</h1>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ThreeDCard title="Project 1" />
            <ThreeDCard title="Project 2" />
            <ThreeDCard ref="thirdCard" title="Portfolio" />
        </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import ThreeDCard from './ThreeDCard.vue'

export default {
    name: 'ProjectsSection',
    components: {
        ThreeDCard,
    },
    setup() {
        const thirdCard = ref(null)

        return {
            thirdCard
        }
    }
}
</script>