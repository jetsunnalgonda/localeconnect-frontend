<template>
    <div v-if="active" :class="['loading-overlay', { 'full-page': isFullPage }]">
      <div class="loading-content">
        <div class="loader" :style="{ borderColor: color }"></div>
        <slot>Loading...</slot>
      </div>
      <div v-if="canCancel" class="cancel-button" @click="handleCancel">Cancel</div>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, watch } from 'vue';
  
  export default defineComponent({
    name: 'LoadingOverlay',
    props: {
      modelValue: {
        type: Boolean,
        default: false
      },
      canCancel: {
        type: Boolean,
        default: false
      },
      isFullPage: {
        type: Boolean,
        default: true
      },
      color: {
        type: String,
        default: '#007bff'
      },
      loader: {
        type: String,
        default: 'spinner'
      },
    },
    setup(props, { emit }) {
      const active = ref(props.modelValue);
  
      watch(() => props.modelValue, (newValue) => {
        active.value = newValue;
      });
  
      function handleCancel() {
        emit('update:modelValue', false);
        if (props.onCancel) {
          props.onCancel();
        }
      }
  
      return {
        active,
        handleCancel
      };
    }
  });
  </script>
  
  <style scoped>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  }
  .full-page {
    width: 100vw;
    height: 100vh;
  }
  .loading-content {
    text-align: center;
  }
  .loader {
    border: 5px solid rgba(0, 0, 0, 0.1);
    border-top: 5px solid var(--loader-color);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .cancel-button {
    margin-top: 20px;
    cursor: pointer;
    color: white;
  }
  </style>
  