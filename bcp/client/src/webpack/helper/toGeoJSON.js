import currentLocationJSON from '../../../../public/currentLocations.json';
import aircraftJSON from '../../../../public/aircraft.json';
import equipmentJSON from '../../../../public/equipment.json';
import geoTracks from '../../../../public/geoTracks.json';
import {createSearchText} from './map-style';
import {AIRCRAFT_TYPE} from '../constant';

export const toGeoJSON = () => {
    const trackFeature = geoTracks.features;
    const {currentLocations} = currentLocationJSON;
    const {aircraft} = aircraftJSON;
    const {equipment} = equipmentJSON;
    const equipmentLocations = currentLocations.filter(location => location.assetType === 'VEHICLE');
    const aircraftLocations = currentLocations.filter(location => location.assetType === 'FIXED_WING' || location.assetType === 'HELICOPTER');

    const equipmentGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };

    const aircraftGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };

    const aircraftTrackGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };

    const equipmentTrackGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };

    const pushFeatureData = (geoJson, newFeature) => {
        geoJson.features.push(
            newFeature
        );
    };

    trackFeature.forEach(track => {
        const type = track.properties.assetType;
        if (AIRCRAFT_TYPE[type]) {
            //aircraft track
            track.properties.imeiMatch = aircraft.find(a => a.imei === track.properties.imei) !== undefined;
            pushFeatureData(aircraftTrackGeoJSON, track);
        } else {
            track.properties.imeiMatch = equipment.find(e => e.imei === track.properties.imei) !== undefined;
            pushFeatureData(equipmentTrackGeoJSON, track);
        }
    });

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

    return {
        aircraftGeoJSON, equipmentGeoJSON, aircraftTrackGeoJSON, equipmentTrackGeoJSON
    };
};