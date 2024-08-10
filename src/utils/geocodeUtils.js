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
    let stateOrProvince = '';
    let country = '';

    console.log('address components:', addressComponents)

    if (addressComponents) {
        addressComponents.forEach(component => {
            const types = component.types;
        
            if (!city && (types.includes('locality') || types.includes('postal_town') || types.includes('administrative_area_level_2'))) {
                city = component.long_name;
            } else if (!stateOrProvince && types.includes('administrative_area_level_1')) {
                stateOrProvince = component.long_name;
            } else if (!country && types.includes('country')) {
                country = component.long_name;
            }
        });        

        placeName = city 
            ? `${city}, ${stateOrProvince}, ${country}` 
            : stateOrProvince 
            ? `${stateOrProvince}, ${country}` 
            : country;
    } else {
        console.error('Address components are undefined or empty');
    }

    return placeName;
}

