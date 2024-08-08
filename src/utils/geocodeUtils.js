export function fetchPlaceNameFromCoordinates(lat, lng, callback) {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results.length > 0) {
            const placeName = getPlaceNameFromGeocodeResult(results[0]);
            callback(placeName);
        } else {
            console.error('Geocoder failed due to:', status);
            callback(null);
        }
    });
}

function getPlaceNameFromGeocodeResult(result) {
    let placeName = '';
    const addressComponents = result.address_components;
    let city = '';
    let country = '';

    if (addressComponents) {
        addressComponents.forEach(component => {
            if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
                city = component.long_name;
            } else if (component.types.includes('country')) {
                country = component.long_name;
            }
        });

        placeName = city ? `${city}, ${country}` : country;
    } else {
        console.error('Address components are undefined or empty');
    }

    return placeName;
}
