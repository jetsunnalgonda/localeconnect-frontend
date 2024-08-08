<template>
    <div id="map" style="height: 300px;"></div>
  </template>
  
  <script>
  import L from 'leaflet';
  
  export default {
    props: ['initialLocation'],
    data() {
      return {
        map: null,
        marker: null,
      };
    },
    mounted() {
      this.initMap();
    },
    methods: {
      initMap() {
        this.map = L.map('map').setView(this.initialLocation || [51.505, -0.09], 13);
  
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
  
        this.marker = L.marker(this.initialLocation || [51.505, -0.09]).addTo(this.map);
  
        this.map.on('click', this.onMapClick);
      },
      onMapClick(e) {
        this.marker.setLatLng(e.latlng);
        this.$emit('location-selected', e.latlng);
      },
    },
    watch: {
      initialLocation(newLocation) {
        if (this.map && newLocation) {
          this.map.setView(newLocation);
          this.marker.setLatLng(newLocation);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  #map {
    width: 100%;
    height: 300px;
  }
  </style>
  