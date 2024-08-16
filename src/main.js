import './assets/styles.css';

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { GoogleMap } from 'vue3-google-map'
import '@fortawesome/fontawesome-free/css/all.css'
import AsyncComputed from 'vue-async-computed'
import { createNotivue } from 'notivue'
import './assets/notivue/notifications.css' // Only needed if using built-in notifications
import './assets/notivue/animations.css' // Only needed if using built-in animations

const app = createApp(App)
const notivue = createNotivue({
    position: 'top-right',
    limit: 4,
    enqueue: true,
    avoidDuplicates: true,
    notifications: {
        global: {
            duration: 5000
        }
    }
})

app.component('GoogleMap', GoogleMap)
app.use(store)
app.use(router)
app.use(AsyncComputed)

app.directive('click-outside', {
    beforeMount(el, binding) {
        el.clickOutsideEvent = function (event) {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
    }
});

app.use(notivue)

// Place it at THE END of the app.use() chain, just right before app.mount()
export const push = createNotivue(app)

app.mount('#app')

