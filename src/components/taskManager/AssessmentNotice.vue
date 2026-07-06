<script setup lang="ts">
import {
  closeDesignOnlyNotice,
  noticeFeature,
  noticeOpen,
} from '../../utils/designOnlyNotice';

function onOverlayClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    closeDesignOnlyNotice();
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="noticeOpen"
      class="assessment-notice__overlay"
      role="presentation"
      @click="onOverlayClick"
    >
      <div
        class="assessment-notice"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assessment-notice-title"
      >
        <button
          type="button"
          class="assessment-notice__close"
          aria-label="Close"
          @click="closeDesignOnlyNotice"
        >
          ×
        </button>

        <h2
          id="assessment-notice-title"
          class="assessment-notice__title"
        >
          Design reference only
        </h2>

        <p class="assessment-notice__message">
          <strong>{{ noticeFeature }}</strong> is not implemented in this
          take-home project. The UI is included to match the design reference.
        </p>

        <p class="assessment-notice__footer">
          Thank you for your time — Mohammad Rayyan.
          <a href="mailto:mrayyan63151@gmail.com">mrayyan63151@gmail.com</a>
          if you liked the project.
        </p>

        <button
          type="button"
          class="assessment-notice__btn"
          @click="closeDesignOnlyNotice"
        >
          Got it
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.assessment-notice__overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
}

.assessment-notice {
  position: relative;
  width: min(100%, 420px);
  padding: 24px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
}

.assessment-notice__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.assessment-notice__close:hover {
  background: #f3f4f6;
  color: #111827;
}

.assessment-notice__title {
  margin: 0 32px 12px 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.assessment-notice__message {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.55;
  color: #4b5563;
}

.assessment-notice__footer {
  margin: 0 0 20px;
  font-size: 13px;
  line-height: 1.55;
  color: #6b7280;
}

.assessment-notice__footer a {
  color: #4f46e5;
  text-decoration: none;
}

.assessment-notice__footer a:hover {
  text-decoration: underline;
}

.assessment-notice__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #7c3aed;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.assessment-notice__btn:hover {
  background: #6d28d9;
}
</style>
