<template>
  <div class="relative h-100 w-full">

    <!-- Background zones -->
    <div class="absolute inset-0 flex">
      <!-- Frontend Zone -->
      <div class="flex-1 bg-gradient-to-r flex flex-col items-center pt-8">
        <div class="text-2xl font-bold text-blue-400 mb-2">Frontend</div>
        <div class="text-sm text-blue-300/60">JSON Friendly</div>
      </div>
      <!-- Backend Zone -->
      <div class="flex-1 bg-gradient-to-l flex flex-col items-center pt-8">
        <div class="text-2xl font-bold text-orange-400 mb-2">Backend</div>
        <div class="text-sm text-orange-300/60">Proto Friendly</div>
      </div>
    </div>

    <!-- Left half mask - shows Frontend packet only in left zone -->
    <div class="absolute left-0 top-0 w-1/2 h-full overflow-hidden z-5">
      <div 
        class="absolute top-1/2 -translate-y-1/2"
        :style="{ left: packetLeftPx }"
      >
        <!-- Frontend Data Packet (blue) -->
        <div class="p-4 rounded-xl border-2 shadow-2xl w-64 h-64 bg-blue-950 border-blue-500/50 shadow-blue-500/30 flex flex-col">
          <div class="text-xs font-mono mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full animate-pulse bg-blue-400"></div>
            <span class="opacity-60">Data Packet</span>
          </div>
          <div class="flex-1 flex flex-col">
            <div class="mb-3">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs opacity-50">id</span>
                <span class="text-xs opacity-30">·</span>
                <span class="text-xs opacity-40">string</span>
              </div>
              <div class="font-mono text-base pl-2 border-l-2 border-blue-500/50">
                <span class="text-green-400">"123"</span>
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs opacity-50">date</span>
                <span class="text-xs opacity-30">·</span>
                <span class="text-xs opacity-40">DateString</span>
              </div>
              <div class="font-mono text-sm pl-2 border-l-2 border-blue-500/50">
                <span class="text-green-400">"2024-1-15"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right half mask - shows Backend packet only in right zone -->
    <div class="absolute right-0 top-0 w-1/2 h-full overflow-hidden z-5">
      <div 
        class="absolute top-1/2 -translate-y-1/2"
        :style="{ left: packetRightPx }"
      >
        <!-- Backend Data Packet (orange) -->
        <div class="p-4 rounded-xl border-2 shadow-2xl w-64 h-64 bg-orange-950 border-orange-500/50 shadow-orange-500/30 flex flex-col">
          <div class="text-xs font-mono mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
            <div class="w-2 h-2 rounded-full animate-pulse bg-orange-400"></div>
            <span class="opacity-60">Data Packet</span>
          </div>
          <div class="flex-1 flex flex-col justify-center">
            <div class="mb-3">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs opacity-50">id</span>
                <span class="text-xs opacity-30">·</span>
                <span class="text-xs opacity-40">bigint</span>
              </div>
              <div class="font-mono text-base pl-2 border-l-2 border-orange-500/50">
                <span class="text-yellow-400">123n</span>
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs opacity-50">date</span>
                <span class="text-xs opacity-30">·</span>
                <span class="text-xs opacity-40">GoogleDate</span>
              </div>
              <div class="font-mono text-sm pl-2 border-l-2 border-orange-500/50 text-yellow-400 px-12 flex justify-center">
                <div class="ml-12 w-fit text-left">
                  <div>{</div>
                  <div class="pl-4">year: <span class="text-orange-300">2024</span>,</div>
                  <div class="pl-4">month: <span class="text-orange-300">1</span>,</div>
                  <div class="pl-4">day: <span class="text-orange-300">15</span></div>
                  <div>}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BFF Boundary Line (simplified) -->
    <div class="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
      <!-- Upper line -->
      <div class="flex-1 w-px bg-gradient-to-b from-transparent via-cyan-500/60 to-cyan-500/60"></div>
      
      <!-- Boundary Badge with direction -->
      <div class="relative px-4 py-2 bg-gray-900/90 border border-cyan-500/40 rounded-lg font-mono">
        <div class="flex flex-col items-center gap-1">
          <span class="text-[10px] text-cyan-400/80 font-medium tracking-wider uppercase">BFF Boundary</span>
        </div>
      </div>
      
      <!-- Lower line -->
      <div class="flex-1 w-px bg-gradient-to-t from-transparent via-cyan-500/60 to-cyan-500/60"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const progress = ref(0) // 0 = left, 100 = right
const direction = ref(1) // 1 = moving right, -1 = moving left

const packetLeftPx = computed(() => {
  const percent = 50 + progress.value
  return `calc(${percent}% - 128px)`
})

const packetRightPx = computed(() => {
  const percent = -50 + progress.value
  return `calc(${percent}% - 128px)`
})

// Elastic easing function (ease-out-back with overshoot)
function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

let animationFrame: number | null = null
let startTime: number | null = null
let pauseTimeout: ReturnType<typeof setTimeout> | null = null
const duration = 1000 // ms - faster animation

const animate = (timestamp: number) => {
  if (startTime === null) {
    startTime = timestamp
  }
  
  const elapsed = timestamp - startTime
  const t = Math.min(elapsed / duration, 1)
  const eased = easeOutBack(t)
  
  if (direction.value === 1) {
    progress.value = eased * 100
  } else {
    progress.value = (1 - eased) * 100
  }
  
  if (t < 1) {
    animationFrame = requestAnimationFrame(animate)
  } else {
    // Animation complete, pause then reverse
    pauseTimeout = setTimeout(() => {
      direction.value = direction.value === 1 ? -1 : 1
      startTime = null
      animationFrame = requestAnimationFrame(animate)
    }, 2000)
  }
}

onMounted(() => {
  animationFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  if (pauseTimeout) clearTimeout(pauseTimeout)
})
</script>
