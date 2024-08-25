<template>
    <div class="error-page">
      <h1>Oops!</h1>
      <p>Sorry, something went wrong.</p>
      <p><router-link to="/">Go to Home</router-link></p>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ErrorPage'
  }
  </script>
  
  <style scoped>
  .error-page {
    text-align: center;
    padding: 20px;
  }
  .error-page h1 {
    font-size: 2em;
    color: #ff0000;
  }
  .error-page p {
    font-size: 1.2em;
  }
  </style>
  