<script setup>
defineProps({
  link: String,
  title: String,
})
</script>

<template>
  <a :href="link" target="_blank" border="!0" font="mono" opacity="80">
    <carbon-logo-github mr="1" opacity="60" class="transform translate-y-1px" />
    {{ title }}
  </a>
</template>

