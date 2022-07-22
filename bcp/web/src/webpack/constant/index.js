export const ASSET_MODE={
    AIRCRAFT: 'AIRCRAFT',
    EQUIPMENT: 'EQUIPMENT'
};

export const MAP_CONFIG = {
    ESRItopoURL: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    ESRIearthURL: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    LINZtopoURL: 'https://tiles-a.koordinates.com/services;key=f731840ac8d043fb8c1a34d03e41ed0c/tiles/v4/layer=50767/EPSG:3857/{z}/{x}/{y}.png',
};
export const MAP_CONSTANTS = {
    // Local Storage Keys
    MAP_AIRCRAFT_LAYER_STORAGE_KEY: 'mapAircraftLayers',
    MAP_EQUIPMENT_LAYER_STORAGE_KEY: 'mapEquipmentLayers',
    MAP_DYNAMIC_LAYER_STORAGE_KEY: 'mapDynamicLayer',
    MAP_SHARED_LAYER_STORAGE_KEY: 'mapSharedLayers',
    MAP_COVERAGE_TIME_STORAGE_KEY: 'mapCoverageTime',
    PLANNING_COVERAGE_TIME_STORAGE_KEY: 'planningCoverageTime',
    BASE_LOCATION_ROTATIONS_STORAGE_KEY: 'activeBaseRotations',
    MAP_ASSET_TAGS_STORAGE_KEY: 'mapAssetTags',
    // Incident Classification types
    MAP_FIRE_INCIDENT_CLASSIFICATION: 'FIRE',
    MAP_BURN_INCIDENT_CLASSIFICATION: 'BURN',
    MAP_OTHER_INCIDENT_CLASSIFICATION: 'OTHER',

    // Notes
    NOTES_HEADINGS: 'Standby|Unserviceable|Request|Dispatch|Reservation|Availability|Configuration|Temporary Change|Asset Change'
};
