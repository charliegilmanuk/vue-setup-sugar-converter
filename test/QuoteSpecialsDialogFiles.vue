<template>
  <q-list class="scroll-y" separator style="max-height: 50vh">
    <template v-if="loading">
      <q-item v-for="i in 5" :key="i">
        <q-item-section>
          <q-item-label>
            <q-skeleton style="min-width: 150px; width: 20%" type="text" />
          </q-item-label>
          <q-item-label caption>
            <q-skeleton style="min-width: 250px; width: 45%" type="text" />
          </q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-skeleton type="QCheckbox" />
        </q-item-section>
      </q-item>
    </template>
    <template v-else>
      <q-item
        v-for="file in radsFiles"
        :key="file.id"
        v-ripple="!file.special"
        :tag="!file.special ? 'label' : undefined"
      >
        <q-item-section>
          <q-item-label>{{ file.name_basic }}</q-item-label>
          <q-breadcrumbs active-color="grey" gutter="xs">
            <q-breadcrumbs-el
              v-for="(el, l) in file.path_short.split('/')"
              :key="`${file.id}-crumb-${l}`"
              :label="el"
              disable
            />
          </q-breadcrumbs>
        </q-item-section>
        <template v-if="file.special">
          <q-item-section side>
            <q-item-label caption>
              {{ file.special.barRef }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              :label="file.special.spMb"
              color="primary"
              @click="openSpecial(file.special)"
            />
          </q-item-section>
        </template>
        <q-item-section v-else side top>
          <q-checkbox
            :model-value="file.selected"
            @update:model-value="toggleFile(file)"
          />
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script>
import SpecialDialog from 'pages/specials/SpecialDialog';
import { useQuasar } from 'quasar';
import { toRefs } from 'vue';

export default {
  name: 'QuoteSpecialsDialogFiles',

  props: {
    radsFiles: {
      type: Array,
      default: () => [],
    },
    loading: Boolean,
  },

  emits: ['update:rads-files'],

  setup(props, { emit }) {
    const $q = useQuasar();
    const { radsFiles } = toRefs(props);

    const toggleFile = file => {
      let files = radsFiles.value;
      const i = files.findIndex(allFile => allFile.id === file.id);
      if (i > -1) {
        files[i].selected = !files[i].selected;
        emit('update:rads-files', files);
      }
    };

    const openSpecial = special => {
      $q.dialog({
        component: SpecialDialog,
        componentProps: {
          id: special.id,
          modelValue: true,
        },
      });
    };

    return { toggleFile, openSpecial };
  },
};
</script>
