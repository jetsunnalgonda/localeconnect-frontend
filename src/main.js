// import { createApp } from 'vue';
// import App from './App.vue';
// import router from './router';
// import store from './store';

import './assets/styles.css';

// createApp(App)
//   .use(store)
//   .use(router)
//   .mount('#app');


// import { createApp } from 'vue';
// import App from './App.vue';
// import router from './router';
// import store from './store';
// import VueGoogleMaps from '@fawmi/vue-google-maps';

// import './assets/styles.css';

// const apiKey = 'AIzaSyDB3-FudwYPeU9P2J8tG_YV58fjsEdagwk';

// createApp(App)
//   .use(store)
//   .use(router)
//   .use(VueGoogleMaps, {
//     load: {
//       key: apiKey,
//       libraries: 'places', 
//     },
//   })
//   .mount('#app');

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { GoogleMap } from 'vue3-google-map';

import '@fortawesome/fontawesome-free/css/all.css';

const app = createApp(App);

app.component('GoogleMap', GoogleMap);

app.use(store);
app.use(router);

app.mount('#app');

