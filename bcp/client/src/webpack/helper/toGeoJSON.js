import {createSearchText} from './map-style';
import {AIRCRAFT_TYPE} from '../constant';

export const fetchLocations = (cb) => {
    fetch('/data/locations.json').then(res => res.json()).then(
        locationJSON => {
            const {locations} = locationJSON;
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
            cb(LocationGeoJSON);
        });
};
export const toGeoJSON = async () => {

    const geoTracksData = await fetch('/data/geoTracks.json');
    const currentLocationData = await fetch('/data/currentLocations.json');
    const aircraftData = await fetch('/data/aircraft.json');
    const equipmentData = await fetch('/data/equipment.json');
    const geoTracks = await geoTracksData.json();
    const currentLocationJSON = await currentLocationData.json();
    const aircraftJSON = await aircraftData.json();
    const equipmentJSON = await equipmentData.json();
    const trackFeature = geoTracks.features;
    const {currentLocations} = currentLocationJSON;
    const {aircraft} = aircraftJSON;
    const {equipment} = equipmentJSON;
    const equipmentLocations = currentLocations.filter(location => location.assetType === 'VEHICLE');
    const aircraftLocations = currentLocations.filter(location => location.assetType === 'FIXED_WING' || location.assetType === 'HELICOPTER');

    return {trackFeature, aircraft, equipment, equipmentLocations, aircraftLocations};

};
const pushFeatureData = (geoJson, newFeature) => {
    geoJson.features.push(
        newFeature
    );
};
export const fetchEquipmentTrack = async (cb) => {
    const {trackFeature, equipment} = await toGeoJSON();
    const equipmentTrackGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };
    trackFeature.forEach(track => {
        const type = track.properties.assetType;
        if (!AIRCRAFT_TYPE[type]) {
            //equipment track
            track.properties.imeiMatch = equipment.find(e => e.imei === track.properties.imei) !== undefined;
            pushFeatureData(equipmentTrackGeoJSON, track);
        }
    });
    cb(equipmentTrackGeoJSON);
};
export const fetchAircraftTrack = async (cb) => {
    const {trackFeature, aircraft} = await toGeoJSON();
    const aircraftTrackGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };
    trackFeature.forEach(track => {
        const type = track.properties.assetType;
        if (AIRCRAFT_TYPE[type]) {
            //aircraft track
            track.properties.imeiMatch = aircraft.find(a => a.imei === track.properties.imei) !== undefined;
            pushFeatureData(aircraftTrackGeoJSON, track);
        }
    });
    cb(aircraftTrackGeoJSON);
};
export const fetchAircraftGeoJSON = async (cb) => {
    const {aircraft, aircraftLocations} = await toGeoJSON();
    const aircraftGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };
    aircraftLocations.forEach(location => {
        const arenaAsset = aircraft.find(value => value.imei === location.imei);

        if (arenaAsset) {
            const newFeature = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [
                        location.longitude,
                        location.latitude
                    ]
                },
                properties: {
                    ...location,
                    imeiMatch: arenaAsset.imei,
                    searchText: createSearchText(arenaAsset),
                    callsign: arenaAsset.callsign,
                    registration: arenaAsset.registration,
                    operator: {
                        name: arenaAsset.operator.name,
                        registeredName: arenaAsset.operator.registeredName,
                        operationalContact: arenaAsset.operator.operationalContact
                    },
                    profilePhotoSmall: arenaAsset.profilePhotoSmall,
                    category: arenaAsset.category,
                    make: arenaAsset.make,
                    model: arenaAsset.model,
                    airframe: arenaAsset.airframe
                }
            };
            pushFeatureData(aircraftGeoJSON, newFeature);
        } else {
            const newFeature = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [
                        location.longitude,
                        location.latitude
                    ]
                },
                properties: {
                    ...location,
                    imeiMatch: false,
                }
            };
            pushFeatureData(aircraftGeoJSON, newFeature);
        }
    });
    cb(aircraftGeoJSON);
};
export const fetchEquipmentGeoJSON = async (cb) => {
    const {equipment, equipmentLocations} = await toGeoJSON();
    const equipmentGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };
    equipmentLocations.forEach(location => {
        const arenaAsset = equipment.find(value => value.imei === location.imei);

        if (arenaAsset) {
            const newFeature = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [
                        location.longitude,
                        location.latitude
                    ]
                },
                properties: {
                    ...location,
                    imeiMatch: arenaAsset.imei,
                    searchText: createSearchText(arenaAsset),
                    callsign: arenaAsset.callsign,
                    registration: arenaAsset.registration,
                    dispatch_contact: arenaAsset.operator.name,
                    dispatch_phone: arenaAsset.operator.operationalContact,
                    dispatch_email: arenaAsset.operator.email,
                    description: arenaAsset.description,
                    fuelType: arenaAsset.fuelType
                }
            };
            pushFeatureData(equipmentGeoJSON, newFeature);
        } else {
            const newFeature = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [
                        location.longitude,
                        location.latitude
                    ]
                },
                properties: {
                    ...location,
                    imeiMatch: false,
                }
            };
            pushFeatureData(equipmentGeoJSON, newFeature);
        }
    });
    cb(equipmentGeoJSON);
};

export const fetchIncidentGeoJSON = (cb) => {
    fetch('/data/incidents.json').then(res => res.json()).then(
        incidentJSON => {
            cb(incidentJSON);
        }
    );
};