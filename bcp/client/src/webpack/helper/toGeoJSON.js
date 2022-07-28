import currentLocationJSON from '../asset/currentLocations.json';
import aircraftJSON from '../asset/aircraft.json';
import equipmentJSON from '../asset/equipment.json';
import {createSearchText} from './map-style';

export const toGeoJSON = () => {
    const {currentLocations} = currentLocationJSON;
    const {aircraft} = aircraftJSON;
    const {equipment} = equipmentJSON;
    const allEquipment = currentLocations.filter(location=>location.assetType==='VEHICLE');
    const allAircraft = currentLocations.filter(location=>location.assetType==='FIXED_WING'||location.assetType==='HELICOPTER');

    let equipmentGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };

    let aircraftGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };

    const pushFeatureData = (geoJson, newFeature) => {
        geoJson.features.push(
            newFeature
        );
    };
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
                        operator: arenaAsset.operator.name,
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
                        dispatch_email:arenaAsset.operator.email,
                        description: arenaAsset.description,
                        fuelType: arenaAsset.fuelType
                    }
                };
                pushFeatureData(equipmentGeoJSON, newFeature);
            }
    });

    allEquipment.forEach(equipment=>{
        const filterResult = equipmentGeoJSON.features.filter(feature=>feature.properties.imei===equipment.imei);
        if( filterResult.length ===0){
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
    allAircraft.forEach(aircraft=>{
        const filterResult = aircraftGeoJSON.features.filter(feature=>feature.properties.imei===aircraft.imei);
        if( filterResult.length===0){
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
    aircraftGeoJSON, equipmentGeoJSON
};

};