<template>
  <div class="flex flex-col gap-6 mt-20 mx-20">
    <!-- Phase 1 -->
    <div class="relative p-6 border border-blue-500/30 bg-blue-500/5 rounded-xl">
      <div class="absolute -top-3 left-4 px-2 bg-[#121212] text-blue-400 text-sm font-bold">
        Phase 1: Field Transformation (AST Level)
      </div>
      
      <div class="flex items-center justify-between text-sm">
        <div class="item">Raw Zod</div>
        <div class="i-ri-arrow-right-line arrow"></div>
        <div class="item">Detect</div>
        <div class="i-ri-arrow-right-line arrow"></div>
        <div class="item">To Getter</div>
        <div class="i-ri-arrow-right-line arrow"></div>
        <div class="item">Inter. AST</div>
      </div>
    </div>

    <div class="mx-auto -my-4 z-10">
      <div class="i-ri-arrow-down-line text-2xl opacity-50 bg-[#121212] rounded-full p-1 border border-gray-800"></div>
    </div>

    <!-- Phase 2 -->
    <div class="relative p-6 border border-green-500/30 bg-green-500/5 rounded-xl">
      <div class="absolute -top-3 left-4 px-2 bg-[#121212] text-green-400 text-sm font-bold">
        Phase 2: Wrapper Removal (File Level)
      </div>
      
      <div class="flex items-center justify-between text-sm">
        <div class="item">Find Lazy</div>
        <div class="i-ri-arrow-right-line arrow"></div>
        <div class="item">Has Getter?</div>
        <div class="i-ri-arrow-right-line arrow"></div>
        <div class="item">Unwrap</div>
        <div class="i-ri-arrow-right-line arrow"></div>
        <div class="item">Final Schema</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item {
  @apply px-4 py-2 bg-gray-800 rounded border border-gray-700;
}
.arrow {
  @apply opacity-50 text-xl;
}
</style>
