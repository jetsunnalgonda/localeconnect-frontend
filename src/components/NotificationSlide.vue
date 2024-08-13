<template>
    <transition name="slide">
      <div class="notification-slide">
        <p>{{ notification.summary }}</p>
        <button @click="closeSlide">Close</button>
      </div>
    </transition>
  </template>
  
  <script>
  export default {
    props: {
      notification: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        show: true,
      };
    },
    methods: {
      closeSlide() {
        this.show = false;
      },
      autoClose() {
        setTimeout(() => {
          this.show = false;
        }, 5000); // Automatically close after 5 seconds
      },
    },
    mounted() {
      this.autoClose();
    },
  };
  </script>
  
  <style scoped>
  .notification-slide {
    position: fixed;
    right: 10%;
    top: 20px;
    background-color: #333;
    color: #fff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease-in-out;
    z-index: 10000;
  }
  
  .notification-slide p {
    margin: 0;
  }
  
  .notification-slide button {
    background: none;
    border: none;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;
  }
  
  .slide-enter-active,
  .slide-leave-active {
    transition: right 0.5s;
  }
  
  .slide-enter-from,
  .slide-leave-to {
    right: -100%;
  }
  
  .slide-enter-to {
    right: 20px;
  }
  </style>
  