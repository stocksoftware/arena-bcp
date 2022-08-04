import {createSearchText} from './map-style';
import {AIRCRAFT_TYPE, ASSET_MODE} from '../constant';

export const fetchLocations = async () => {
    const locationData = await fetch('/data/locations.json');
    const locationJSON = await locationData.json();
    const {locations} = locationJSON;
    const LocationGeoJSON = {
        type: 'FeatureCollection',
        features: []
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
export const fetchEquipmentTrack = async () => {
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
    return equipmentTrackGeoJSON;
};
export const fetchAircraftTrack = async () => {
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
    return aircraftTrackGeoJSON;
};
export const fetchAircraftGeoJSON = async () => {
    const {aircraft, aircraftLocations} = await toGeoJSON();
    const aircraftWithoutImei = aircraft.filter(a=>!a.imei.match(/\w{15}/));
    const aircraftWithImei = aircraft.filter(a=>a.imei.match(/\w{15}/));
    const concatAssets =[];
    aircraftWithImei.forEach(a=>{
        const sameImeiAssets =aircraftWithImei.filter(aCraft=>aCraft.imei===a.imei);
        if(sameImeiAssets.length>1){
            const operator =sameImeiAssets.map(asset=>asset.operator);
            const mergedAsset = {...a,operator};
            if(concatAssets.find(asset=>asset.imei ===a.imei)===undefined){
                concatAssets.push(mergedAsset);
            }
        }
    });
    const allAircrafts = [...concatAssets, ...aircraftWithoutImei];

    const aircraftGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };
    aircraftLocations.forEach(location => {
        const arenaAsset = allAircrafts.find(value => value.imei === location.imei);

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
                    operator: arenaAsset.operator,
                    profilePhotoSmall: arenaAsset.profilePhotoSmall,
                    category: arenaAsset.category,
                    make: arenaAsset.make,
                    model: arenaAsset.model,
                    airframe: arenaAsset.airframe,
                    id: arenaAsset.id
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
    return aircraftGeoJSON;
};
export const fetchEquipmentGeoJSON = async () => {
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
                    fuelType: arenaAsset.fuelType,
                    id: arenaAsset.id
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
    return equipmentGeoJSON;
};

export const fetchIncidentGeoJSON = async () => {
    const incidentData = await fetch('/data/incidents.json');
    return await incidentData.json();
};

export const filterAvailabilityData = async (assetMode) => {
    const availabilityData = await fetch('/data/availability.json');
    const availabilityJSON = await availabilityData.json();
    const availableFeatures = availabilityJSON.features.filter(f => f.geometry.coordinates.length !== 0);
    let availableAsset = assetMode === ASSET_MODE.EQUIPMENT ? availableFeatures.filter(a => a.properties.is_equipment) : availableFeatures.filter(a => !a.properties.is_equipment);
    return {
        "type": "FeatureCollection",
        "features": availableAsset
    };
};

export const fetchAsset = async (id, is_equipment) => {
    const aircraftData = await fetch('/data/aircraft.json');
    const equipmentData = await fetch('/data/equipment.json');
    const aircraftJSON = await aircraftData.json();
    const equipmentJSON = await equipmentData.json();
    const {aircraft} = aircraftJSON;
    const {equipment} = equipmentJSON;
    const currentLocationsData = await fetch('/data/currentLocations.json');
    const currentLocationsJSON = await currentLocationsData.json();
    const {currentLocations} = currentLocationsJSON;
    if (is_equipment) {
        const matchAsset = equipment.filter(e => e.id === id);
        if (matchAsset.length > 0) {
            const asset = matchAsset[0];
            const matchLocation = currentLocations.filter(location => location.imei === asset.imei);
            const location = matchLocation.length > 0 && matchLocation[0];
            return {...asset, ...location};
        }
    } else {
        const matchAsset = aircraft.filter(acraft => acraft.id === id);
        if (matchAsset.length > 0) {
            const asset = matchAsset[0];
            const matchLocation = currentLocations.filter(location => location.imei === asset.imei);
            const location = matchLocation.length > 0 && matchLocation[0];
            return {...asset, ...location};
        }
    }
};


