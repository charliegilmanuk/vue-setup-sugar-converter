<template>
  <q-card-actions>
    <q-separator class="q-mt-none" />
    <q-space />
    <q-btn color="grey" flat @click="$emit('click:cancel')">Cancel</q-btn>
    <q-btn type="submit" color="primary" flat :loading="submitting || loading">
      Save
    </q-btn>
  </q-card-actions>
</template>

<script>
export default {
  name: 'DialogActions',

  props: {
    loading: Boolean,
    submitting: Boolean,
  },

  emits: ['click:cancel'],
};
</script>
