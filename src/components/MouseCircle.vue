<template>
  <div
    class="mouse-circle overflow-hidden"
    :class="{ animating: animating }"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: darkenColor(color, 20),
      transform: `translate(-50%, calc(-50% + ${translateY}%)) scale(${scale})`,
      left: `${position.x}px`,
      top: `${position.y}px`
    }"
    @click="handleClick"
  >
    <div
      class="circle-text text-center"
      :style="{
        fontSize: `${fontSize}px` 
      }"
    >
      {{ text }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'MouseCircle',
  props: {
    position: {
      type: Object,
      required: true,
      validator: (value) => {
        return 'x' in value && 'y' in value;
      }
    },
    text: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#000000'
    },
    size: {
      type: Number,
      default: 85
    },
    fontSize: {
      type: Number,
      default: 13
    },
    scale: {
      type: Number,
      default: 1
    },
    animating: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    },
    translateY: {
      type: Number,
      default: 0,
      validator: (value) => {
        return value >= -200 && value <= 200;
      }
    }
  },
  emits: ['animation-start', 'animation-complete', 'circle-click'],
  setup(props, { emit }) {
    // Helper function to darken a color
    const darkenColor = (color, amount) => {
      color = color.replace('#', '');
      
      // Parse the color components
      let r = parseInt(color.substring(0, 2), 16);
      let g = parseInt(color.substring(2, 4), 16);
      let b = parseInt(color.substring(4, 6), 16);
      
      // Darken each component
      r = Math.max(0, r - amount);
      g = Math.max(0, g - amount);
      b = Math.max(0, b - amount);
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const handleClick = () => {
      emit('circle-click');
    }

    return {
      handleClick,
      darkenColor
    }
  }
}
</script>

<style scoped>
.mouse-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: transform 0.15s ease-out, width 0.15s ease-out, height 0.15s ease-out, background-color 0.15s ease-out;
}

.mouse-circle.animating {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), width 0.15s ease-out, height 0.15s ease-out, background-color 0.15s ease-out;
}

.circle-text {
  font-weight: 600;
  text-align: center;
  max-width: 80px;
  line-height: 1.2;
  transition: opacity 0.15s ease-out;
  opacity: 1;
  color: #ffffff;
}

.animating .circle-text {
  opacity: 0;
  transition: opacity 0.1s ease-out;
}
</style>
