export const ASSET_MODE={
    AIRCRAFT: 'AIRCRAFT',
    EQUIPMENT: 'EQUIPMENT'
};

export const MAP_CONFIG = {
    ESRItopoURL: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
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