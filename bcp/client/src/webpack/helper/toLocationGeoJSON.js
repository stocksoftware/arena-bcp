import locationData from '../../../../public/locations.json';

export const toLocationGeoJSON = () => {
    const {locations} = locationData;
    const LocationGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };
    const pushFeatureData = (geoJson, newFeature) => {
        geoJson.features.push(
            newFeature
        );
    };
    locations.forEach(track => {
        const feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    track.long,
                    track.lat,
                ]
            },
            "properties": {...track}
        };
        pushFeatureData(LocationGeoJSON, feature);
    });
    return LocationGeoJSON;
};