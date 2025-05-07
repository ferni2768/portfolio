<template>
  <div class="container mx-auto pt-10 pb-28 space-y-20">
    <!-- SECTION 1: ABOUT ME -->
    <div class="flex flex-col md:flex-row items-center">
      <div class="md:w-1/2 p-6 order-1">
        <h2 class="text-3xl font-semibold text-white mb-4">About Me</h2>
        <p class="text-gray-200 leading-relaxed">
          I’m a curious, detail-oriented developer who loves building websites that help people. I’m quick to learn,
          communicative, and bring a positive vibe to every team.
        </p>
      </div>
      <div class="md:w-1/2 p-6 order-2 flex items-center justify-center">
        <span class="text-gray-400 italic">Picture 1</span>
      </div>
    </div>

    <!-- SECTION 2: CORE VALUES -->
    <div class="flex flex-col md:flex-row items-center">
      <div class="md:w-1/2 p-6 order-2 md:order-1 flex items-center justify-center">
        <span class="text-gray-400 italic">Picture 2</span>
      </div>
      <div class="md:w-1/2 p-6 order-1 md:order-2">
        <h2 class="text-3xl font-semibold text-white mb-4">What Drives Me</h2>
        <p class="text-gray-200 leading-relaxed">
          I’m driven by solving real-world problems with intuitive, accessible, and beautiful web design. I want tech to
          feel natural—something that simplifies life through thoughtful design.
        </p>
      </div>
    </div>

    <!-- SECTION 3: HOBBIES -->
    <div class="flex flex-col md:flex-row items-center">
      <div class="md:w-1/2 p-6 order-1">
        <h2 class="text-3xl font-semibold text-white mb-4">When I'm Not Coding...</h2>
        <p class="text-gray-200 leading-relaxed">
          You’ll probably find me watching movies or out for a walk—whether in the city or surrounded by nature. It’s
          how I unwind and refuel my creativity.
        </p>
      </div>
      <div class="md:w-1/2 p-6 order-2 flex items-center justify-center">
        <span class="text-gray-400 italic">Picture 3</span>
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
export default {
  name: 'AboutSection',
}
</script>