import { ref } from 'vue';

export const noticeOpen = ref(false);
export const noticeFeature = ref('');

export function openDesignOnlyNotice(feature: string): void {
  noticeFeature.value = feature;
  noticeOpen.value = true;
}

export function closeDesignOnlyNotice(): void {
  noticeOpen.value = false;
}
