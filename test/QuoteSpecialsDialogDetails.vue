<template>
  <q-form ref="formRef" class="row q-col-gutter-lg">
    <div class="col-12 col-lg">
      <mrp-customer-selector
        :model-value="customer"
        :rules="[v => !!v || 'Customer is required']"
        default-to-sales-office
        filled
        @update:model-value="$emit('update:customer', $event)"
      />
    </div>
    <div class="col-12">
      <q-input
        :model-value="description"
        :rules="[v => !!v || 'Description is required']"
        filled
        label="Description"
        @update:model-value="$emit('update:description', $event)"
      />
    </div>
    <div class="col-12">
      <q-input
        :model-value="reference"
        :rules="[v => !!v || 'Reference is required']"
        filled
        label="Customer reference"
        @update:model-value="$emit('update:reference', $event)"
      />
    </div>
    <div class="col-12 col-lg-6">
      <q-input
        :model-value="barRef"
        filled
        label="Default bar ref (optional)"
        @update:model-value="$emit('update:barRef', $event)"
      />
    </div>
    <div class="col-12 col-lg-6">
      <q-input
        :model-value="internalPo"
        filled
        hint="Should be a number"
        label="Internal PO (optional)"
        @update:model-value="$emit('update:internalPo', $event)"
      />
    </div>
  </q-form>
</template>

<script>
import mrpCustomerSelector from 'components/forms/inputs/mrpCustomerSelector';
import { ref } from 'vue';

export default {
  name: 'QuoteSpecialsDialogDetails',

  components: {
    mrpCustomerSelector,
  },

  props: {
    customer: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    reference: {
      type: String,
      default: null,
    },
    barRef: {
      type: String,
      default: null,
    },
    internalPo: {
      type: String,
      default: null,
    },
  },

  emits: [
    'update:customer',
    'update:description',
    'update:reference',
    'update:barRef',
    'update:internalPo',
  ],

  setup() {
    const formRef = ref(null);
    const validate = () => formRef.value.validate();

    return { formRef, validate };
  },
};
</script>
