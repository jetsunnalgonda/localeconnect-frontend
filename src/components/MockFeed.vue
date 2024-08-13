<template>
  <!-- <div class="mock-feed-container"> -->
    <div v-for="i in count" :key="i" class="mock-card">
      <div class="mock-avatar"></div>
      <div class="mock-info">
        <div class="mock-placeholder big"></div>
        <div class="mock-placeholder medium"></div>
        <div class="mock-placeholder small"></div>
      </div>
    </div>
  <!-- </div> -->
</template>


<script>
export default {
  props: {
    count: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style scoped>
.mock-feed-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  /* padding: 20px; */
}

.mock-card {
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.mock-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.mock-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.mock-placeholder {
  background: #f0f0f0;
  border-radius: 10px;
  margin: 5px 0;
  width: 100%;
  height: 15px;
  position: relative;
  overflow: hidden;
}

.mock-placeholder.big {
  width: 80%;
}

.mock-placeholder.medium {
  width: 60%;
}

.mock-placeholder.small {
  width: 40%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}
</style>