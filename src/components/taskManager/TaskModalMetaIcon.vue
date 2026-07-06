<script setup lang="ts">
import { computed, h } from 'vue';

const props = defineProps<{
  name:
    | 'created-time'
    | 'status'
    | 'priority'
    | 'due-date'
    | 'tags'
    | 'assignees';
}>();

const svgAttrs = {
  class: 'task-modal-meta-icon',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 1.5,
  'stroke-linecap': 'round' as const,
  'stroke-linejoin': 'round' as const,
  'aria-hidden': true as const,
};

const iconNode = computed(() => {
  switch (props.name) {
    case 'created-time':
      return h('svg', svgAttrs, [
        h('circle', { cx: 12, cy: 12, r: 9 }),
        h('path', { d: 'M12 7v4.25l2.75 1.75' }),
        h('path', { d: 'M16.25 16.25h2.5' }),
        h('path', { d: 'M17.25 15.25v2' }),
      ]);
    case 'status':
      return h('svg', svgAttrs, [
        h('path', {
          d: 'M12 3.25v2.25M12 18.5v2.25M3.25 12h2.25M18.5 12h2.25M5.52 5.52l1.59 1.59M16.89 16.89l1.59 1.59M18.48 5.52l-1.59 1.59M7.11 16.89l-1.59 1.59',
        }),
      ]);
    case 'priority':
      return h('svg', svgAttrs, [
        h('circle', { cx: 12, cy: 12, r: 9 }),
        h('path', { d: 'M8.25 12.25 10.75 14.75 15.75 9.25' }),
      ]);
    case 'due-date':
      return h('svg', svgAttrs, [
        h('path', { d: 'M8 3.5v3M16 3.5v3' }),
        h('rect', { x: 4, y: 6, width: 16, height: 15, rx: 2 }),
      ]);
    case 'tags':
      return h('svg', svgAttrs, [
        h('path', {
          d: 'M9.5 4.5H6a1.5 1.5 0 0 0-1.5 1.5v3.25a1.5 1.5 0 0 0 .44 1.06l7.19 7.19a1.5 1.5 0 0 0 2.12 0l4.19-4.19a1.5 1.5 0 0 0 0-2.12l-7.19-7.19A1.5 1.5 0 0 0 9.5 4.5z',
        }),
        h('circle', { cx: 7.25, cy: 8.25, r: 0.75, fill: 'currentColor', stroke: 'none' }),
      ]);
    case 'assignees':
      return h('svg', svgAttrs, [
        h('path', { d: 'M16.5 20.5v-1.75a3.75 3.75 0 0 0-3.75-3.75H6.75a3.75 3.75 0 0 0-3.75 3.75v1.75' }),
        h('circle', { cx: 9.75, cy: 7.75, r: 3.25 }),
        h('path', { d: 'M20.25 20.5v-1.75a3.75 3.75 0 0 0-2.85-3.64' }),
        h('path', { d: 'M15.25 4.14a3.75 3.75 0 0 1 0 7.27' }),
      ]);
    default:
      return h('svg', svgAttrs);
  }
});
</script>

<template>
  <component :is="iconNode" />
</template>

<style scoped>
.task-modal-meta-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #9ca3af;
}
</style>
