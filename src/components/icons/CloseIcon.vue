<template>
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      class="close-icon"
      @click="handleClick"
    >
      <path
        fill="currentColor"
        d="M6 18L18 6M6 6l12 12"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </template>
  
  <!-- <script setup>
  import { defineComponent, markRaw } from 'vue';
  
  const CloseIcon = defineComponent({
    setup(props, { emit }) {
      const handleClick = () => {
        emit('click');
      };
  
      return {
        handleClick
      };
    }
  });
  
  export default markRaw(CloseIcon);
  </script> -->
  
  <style scoped>
  .close-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
  </style>
  