<template>
  <div class="container mx-auto py-10 space-y-10">
    <div class="flex flex-col md:flex-row items-center">
      <div class="md:w-1/2 p-4">
        <h2 class="text-2xl font-bold mb-4">About Me</h2>
        <p>Some default text about me. I am a developer passionate about 3D and web technologies.</p>
      </div>
      <div class="md:w-1/2 p-4 border-2 border-dashed border-gray-300 h-40 flex items-center justify-center">
        <!-- Placeholder for picture -->
        <span class="text-gray-400">Picture Placeholder</span>
      </div>
    </div>
    <div class="flex flex-col md:flex-row items-center">
      <div
        class="md:w-1/2 p-4 border-2 border-dashed border-gray-300 h-40 flex items-center justify-center order-2 md:order-1">
        <!-- Placeholder for picture -->
        <span class="text-gray-400">Picture Placeholder</span>
      </div>
      <div class="md:w-1/2 p-4 order-1 md:order-2">
        <h2 class="text-2xl font-bold mb-4">More About Me</h2>
        <p>Additional text goes here.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutSection',
}
</script>