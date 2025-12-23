<template>
  <div class="flex items-center justify-center gap-8 py-10">
    <!-- Frontend World -->
    <div class="flex flex-col items-center gap-2">
      <div class="text-xl font-bold text-blue-400">Frontend</div>
      <div class="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg w-40 text-center">
        <div class="text-sm opacity-60">JSON Friendly</div>
        <div class="font-mono text-lg mt-2 text-green-400">"123"</div>
        <div class="text-xs opacity-40">string</div>
      </div>
    </div>

    <!-- Animation Arrow -->
    <div class="flex flex-col gap-2 items-center w-40">
      <div class="text-xs opacity-50">encode</div>
      <div :class="['i-ph-arrow-right-bold text-2xl transition-all duration-500', active === 'right' ? 'text-green-400 scale-125' : 'opacity-20']"></div>
      <div class="px-4 py-2 rounded bg-gray-800 border border-gray-700 font-mono text-xs">
        BFF Boundary
      </div>
      <div :class="['i-ph-arrow-left-bold text-2xl transition-all duration-500', active === 'left' ? 'text-orange-400 scale-125' : 'opacity-20']"></div>
      <div class="text-xs opacity-50">decode</div>
    </div>

    <!-- Backend World -->
    <div class="flex flex-col items-center gap-2">
      <div class="text-xl font-bold text-orange-400">Backend</div>
      <div class="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg w-40 text-center">
        <div class="text-sm opacity-60">Proto Friendly</div>
        <div class="font-mono text-lg mt-2 text-yellow-400">123n</div>
        <div class="text-xs opacity-40">bigint</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const active = ref<'right' | 'left'>('right')

onMounted(() => {
  setInterval(() => {
    active.value = active.value === 'right' ? 'left' : 'right'
  }, 2000)
})
</script>
