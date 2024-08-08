<template>
    <div v-if="mapVisible" class="map-popup">
        <div class="map-container">
            <GoogleMap :center="center" :zoom="zoom" :api-key="apiKey" style="width: 100%; height: 100%;"
                @click="handleMapClick" @load="handleMapLoaded">
                <Marker v-if="markerPosition" :options="{ position: markerPosition }" />
            </GoogleMap>
        </div>
        <button @click="handleClose">Close</button>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { GoogleMap, Marker } from 'vue3-google-map';

export default defineComponent({
    name: 'MapPopup',
    components: {
        GoogleMap,
        Marker,
    },
    props: {
        mapVisible: {
            type: Boolean,
            required: true,
        },
        currentLocation: {
            type: Object,
            required: true,
        },
    },
    emits: ['close', 'location-selected'],
    setup(props, { emit }) {
        const center = ref({
            lat: props.currentLocation.latitude || 0,
            lng: props.currentLocation.longitude || 0,
        });
        const zoom = ref(10);
        const markerPosition = ref(null);
        const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API_KEY;
        // const mapRef = ref(null);

        // Set the initial marker position when the component mounts
        onMounted(() => {
            if (props.currentLocation.latitude && props.currentLocation.longitude) {
                markerPosition.value = {
                    lat: props.currentLocation.latitude,
                    lng: props.currentLocation.longitude,
                };
            }
        });

        // Initialize the Geocoder
        let geocoder;

        const handleMapClick = (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            markerPosition.value = { lat, lng }; // Update marker position
            emit('location-selected', { latitude: lat, longitude: lng }); // Emit location

            // Reverse geocode to get the address or city name
            if (geocoder) {
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK') {
                        if (results[0]) {
                            // Here you can process the results to get the place name or address
                            console.log('Geocoded results:', results);
                        } else {
                            console.log('No results found');
                        }
                    } else {
                        console.error('Geocode was not successful for the following reason:', status);
                    }
                });
            }
        };

        const handleMapLoaded = () => {
            if (window.google && window.google.maps) {
                geocoder = new window.google.maps.Geocoder();
            } else {
                console.error('Google Maps Geocoder service is not available');
            }
        };

        const handleClose = () => {
            emit('close');
        };

        onMounted(() => {
            // Initialize the geocoder when the component is mounted
            handleMapLoaded();
        });

        return {
            center,
            zoom,
            markerPosition,
            handleMapClick,
            handleClose,
            apiKey,
        };
    },
});
</script>

<style scoped>
.map-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.map-container {
    width: 80%;
    height: 80%;
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
}

button {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #ff0000;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
}
</style>