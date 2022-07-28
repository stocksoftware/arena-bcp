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
    const allEquipment = currentLocations.filter(location => location.assetType === 'VEHICLE');
    const allAircraft = currentLocations.filter(location => location.assetType === 'FIXED_WING' || location.assetType === 'HELICOPTER');

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
            pushFeatureData(aircraftTrackGeoJSON, track);
        } else {
            pushFeatureData(equipmentTrackGeoJSON, track);
        }
    });
    currentLocations.forEach(location => {
        const matchedAircraft = aircraft.find(value => value.imei === location.imei);
        const matchedEquipment = equipment.find(value => value.imei === location.imei);
        const arenaAsset = matchedAircraft || matchedEquipment;

        if (matchedAircraft) {
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
        }
        if (matchedEquipment) {
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
        }
    });

    allEquipment.forEach(equipment => {
        const filterResult = equipmentGeoJSON.features.filter(feature => feature.properties.imei === equipment.imei);
        if (filterResult.length === 0) {
            const newFeature = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [
                        equipment.longitude,
                        equipment.latitude
                    ]
                },
                properties: {
                    ...equipment,
                    imeiMatch: false,
                }
            };
            pushFeatureData(equipmentGeoJSON, newFeature);
        }
    });
    allAircraft.forEach(aircraft => {
        const filterResult = aircraftGeoJSON.features.filter(feature => feature.properties.imei === aircraft.imei);
        if (filterResult.length === 0) {
            const newFeature = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [
                        aircraft.longitude,
                        aircraft.latitude
                    ]
                },
                properties: {
                    ...aircraft,
                    imeiMatch: false,
                }
            };
            pushFeatureData(aircraftGeoJSON, newFeature);
        }
    });
    return {
        aircraftGeoJSON, equipmentGeoJSON, aircraftTrackGeoJSON, equipmentTrackGeoJSON
    };

};