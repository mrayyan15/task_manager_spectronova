<script setup lang="ts">
import { computed } from 'vue';
import { getAssigneeAvatarColor } from '../../utils/colors';
import { getAssigneeInitials } from '../../utils/initials';

const props = withDefaults(
  defineProps<{
    assignee: string;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  { size: 'sm' },
);

const label = computed(() => props.assignee.trim() || 'Unassigned');
const initials = computed(() => getAssigneeInitials(props.assignee));
const backgroundColor = computed(() => getAssigneeAvatarColor(props.assignee));
</script>

<template>
  <span
    class="assignee-avatar"
    :class="`assignee-avatar--${size}`"
    :style="{ backgroundColor }"
    :title="label"
    role="img"
    :aria-label="label"
  >
    {{ initials }}
  </span>
</template>
