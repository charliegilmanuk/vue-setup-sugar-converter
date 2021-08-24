<template>
  <div class="flex items-center justify-center shadow-0">
    <q-circular-progress
      indeterminate
      color="accent"
      size="64px"
      class="overflow-hidden shadow-0"
    />
  </div>
</template>

<script>
export default {
  name: 'DialogLoader',
};
</script>

<style lang="scss">
body {
  &.theme--dark {
    background: #000;
  }
}
</style>