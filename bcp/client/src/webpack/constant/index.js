export const ASSET_MODE = {
    AIRCRAFT: 'AIRCRAFT',
    EQUIPMENT: 'EQUIPMENT'
};

export const AIRCRAFT_TYPE = {
    FIXED_WING: 'FIXED_WING',
    HELICOPTER: 'HELICOPTER'
};

export const DEBOUNCE_DELAY_MS = 500;
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

export const AIRCRAFT_CATEGORIES = {
    RotType1: 'RW - Type 1 Heavy',
    RotType2: 'RW - Type 2 Medium',
    RotType3: 'RW - Type 3 Light',
    RotType4: 'RW - Type 4 Extra Light',
    RotOther: 'RW - Other',
    FixType1: 'FW - Type 1 MEAT',
    FixType4: 'FW - Type 4 SEAT',
    FixType5: 'FW - Type 5 SEAT',
    FixAas: 'FW - AAS / Recce',
    FixOther: 'FW - Other',
    UAV: 'Unmanned Aerial Vehicle',
    Other: 'Other'
};

export const SORTKEYID = {
    Asset: 'A',
    BaseLocation: 'B',
    Status: 'C',
    FCTAF: 'D'
};

export const STATUSLIST = {
    'Dispatched': 'status-dispatched',
    'Standby': 'status-standby',
    'Available': 'status-available',
    'Planned-dispatch': 'status-planned-dispatch'
}
