import * as L from 'leaflet';
import 'leaflet-extra-markers';
import {ASSET_MODE, MAP_CONSTANTS} from '../constant';
import * as AMFUNC_MATH from './map-math';
import * as AMFUNC_DISP from './map-display';
import moment from 'moment-timezone';
import turf from 'turf';

export const renderIncidentPopup = function (feature) {
    // let addDisatchBoardButton = false;
    parseNotesField(feature);
    let showCurrentDispatchCountEvenIfZero = false;
    const out = [];
    const currentDate = new Date();
    if (feature.properties) {
        const startDate = new Date(feature.properties.startDate);
        if (currentDate < startDate) {
            out.push('<h5 class="planned">Planned Event</h5>');
        }
        Object.entries(feature.properties).forEach(entry => {
            const [key, value] = entry;
            if (includeemphasis(key)) {
                const valueString = formatNullToString(value);
                if (key === 'dispatchCount') {
                    if (valueString !== '0') {
                        showCurrentDispatchCountEvenIfZero = true;
                    } else {
                        return;
                    }
                }
                if (key !== 'dateClosed') {
                    out.push('<strong>' + formatemphasis(key) + ':</strong> ' + valueString);
                }
                if (key === 'endDate') {
                    const dateClosed = formatNullToString(feature.properties.dateClosed);
                    out.push('<strong>' + formatemphasis('dateClosed') + ':</strong> ' + dateClosed);
                }
            }
        });

        const coordinates = feature.geometry.coordinates;
        out.push('<strong>Latitude:</strong> ' +
            AMFUNC_MATH.ddm(coordinates[AMFUNC_MATH.COORD_LAT]) +
            '  ( ' +
            coordinates[AMFUNC_MATH.COORD_LAT] +
            ' )');
        out.push('<strong>Longitude:</strong> ' +
            AMFUNC_MATH.ddm(coordinates[AMFUNC_MATH.COORD_LON]) +
            '  ( ' +
            coordinates[AMFUNC_MATH.COORD_LON] +
            ' )');


        let popupContent = '<div class="arena-map-table">';
        popupContent += out.join('<br>');
        popupContent += '</div>';
        return popupContent;
    }
};

export function getIconForIncident(feature) {
    // TODO process Incident data to render markers in standard 'fire' icons rather than these off the shelf ones
    const dispatchCount = feature.properties.currentDispatchCount ?
        feature.properties.currentDispatchCount :
        feature.properties.dispatchCount ? '*' : '';
    const currentDate = new Date();
    const startDate = new Date(feature.properties.startDate);

    let borderColour;
    let fillColour = '#ccc';
    let iconColour = 'white';

    // Determine Border Colour
    if (currentDate < startDate) {
        borderColour = '#905678';
    } else if (feature.properties.dataSource === 'ARENA') {
        borderColour = '#ef9227';
    }

    // Determine Fill Colour
    if (feature.properties.classification === MAP_CONSTANTS.MAP_BURN_INCIDENT_CLASSIFICATION) {
        fillColour = '#211c1d';
    } else if (feature.properties.classification === MAP_CONSTANTS.MAP_OTHER_INCIDENT_CLASSIFICATION) {
        fillColour = '#276273';
    } else if (feature.properties.classification === MAP_CONSTANTS.MAP_FIRE_INCIDENT_CLASSIFICATION) {
        fillColour = '#a23337';
        switch (feature.properties.status) {
            case 'GOING':
                // leave as default
                break;
            case 'CONTAINED':
                iconColour = '#ef9227';
                break;
            case 'CONTROLLED':
                iconColour = '#211c1d';
                break;
            case 'OTHER':
                iconColour = '#d3d3de';
                break;
            default:
                fillColour = '#ccc';
                break;
        }
    }

    // none of the above
    return buildIncidentIcon(dispatchCount, fillColour, iconColour, borderColour);
}

const iconHtml = (dispatchCount, iconClass, fillColour, iconColour, borderColour, borderWidth, borderOpacity) => {
    const dispatched = dispatchCount ? 'dispatched' : '';
    return ` <svg width='14' height='14' class="${dispatched}  fa-fire" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" >
 <path fill='${iconColour}' d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 86.13 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z"/></svg>
 <span class="dispatchCount" style="color: ${iconColour}">${dispatchCount}</span>
 <svg width='33' height='44' viewBox='0 0 35 45' xmlns='http://www.w3.org/2000/svg'> <path d='M1.872 17.35L9.679 2.993h15.615L33.1 17.35 17.486 44.992z' fill='${fillColour}' style='border: 10px'/> <g opacity='${borderOpacity}' transform='matrix(1.0769 0 0 -1.0769 -272.731 48.23)'> <path d='M276.75 42h-14.5L255 28.668 269.5 3 284 28.668zm-.595-1l6.701-12.323L269.5 5.033l-13.356 23.644L262.845 41z' stroke='${borderColour}' stroke-width='${borderWidth}'/> </g> </svg>`;

};
const buildIncidentIcon = (dispatchCount, fillColour, iconColour = "white", borderColour) => {
    let borderWidth = 3;
    let borderOpacity = 1;
    if (borderColour === undefined) {
        borderColour = 'black';
        borderWidth = 1;
        borderOpacity = 0.3;
    }

    return L.ExtraMarkers.icon({
        innerHTML: iconHtml(dispatchCount, 'fa-fire', fillColour, iconColour, borderColour, borderWidth, borderOpacity),
        svg: true
    });
};
const parseNotesField = function (feature) {
    const props = feature.properties;
    const notes = props.notes;
    if (notes) {
        notes.split('\n').forEach(line => {
            const pair = line.match(/^([^:]+):(.*)$/);
            if (pair) {
                props[pair[1]] = pair[2];
            }
        });
        delete props.notes;
    }
};
const includeemphasis = function (key) {
    return key !== 'event_type' && key !== 'Data' &&
        key !== 'url' &&
        key !== 'id' &&
        key !== 'searchText' &&
        key !== 'dateCreated' &&
        key !== 'unparseableTrackingRego';
};
const formatNullToString = function (value) {
    return value === null ? '' : `${value}`;
};
const formatemphasis = function (key) {
    if (key.match(/^[A-Z _]*$/)) {
        key = key.replace(/_/g, ' ').toLowerCase();
    }

    key = key.trim()
        .replace(/([A-Z])/g, ' $1')
        .replace(/["]/g, '')
        .replace(/_/g, ' ')
        .replace(/ ./, str => str.toUpperCase())
        .replace(/^./, str => str.toUpperCase());

    if (key === 'Dispatch Count') {
        return 'Total Dispatch Count';
    }
    if (key === 'Location Text') {
        return 'Location';
    }

    return key;
};
export const createSearchText = function (asset) {
    const callsign = asset.callsign ? toShortCallsign(asset.callsign) + ' ' : '';
    const rego = asset.registration ? asset.registration + ' ' : '';
    const operator = asset.operator && asset.operator.name ?
        cleanOperatorName(asset.operator.name) :
        asset.operator && asset.operator.registeredName ?
            cleanOperatorName(asset.operator.registeredName) :
            '';

    return callsign + rego + operator;
};
export const toShortCallsign = (callsign) => {
    let result = callsign.replace(/ /g, '');
    result = result.replace(/firebird/i, 'FB');
    result = result.replace(/lifesaver/i, 'LS');
    result = result.replace(/helitak/i, 'HT');
    result = result.replace(/helitack/i, 'HT');
    result = result.replace(/bomber/i, 'B');
    result = result.replace(/birddog/i, 'BD');
    result = result.replace(/birdog/i, 'BD');
    result = result.replace(/firescan/i, 'FS');
    result = result.replace(/firespotter/i, 'SP');

    return result;
};

export function cleanOperatorName(string) {
    if (!string) {
        return '';
    }
    let result = safeString(string);
    result = result.replace(/[pP][tT][yY]/, '');
    result = result.replace(/[lL][tT][dD]/, '');
    return result.trim();
}

function safeString(string) {
    if (!string) {
        return '';
    }
    let result = string.replace(/'/g, '&#39');
    result = result.replace(/"/g, '&#34');
    return result;
}

export function styleAssetMarker(feature, latlng, historicViewDate = null) {
    // build icon URL - start with directory
    let icon = './icons/';
    const airframe = (feature.properties.airframe) ?
        feature.properties.airframe.toUpperCase().replace(' ', '_') :
        feature.properties.assetType;
    // appended aircraft type
    if (airframe === 'HELICOPTER') {
        icon = icon + 'HELICOPTER';
    } else if (airframe === 'FIXED_WING') {
        icon = icon + 'FIXED_WING';
    } else {
        icon = icon + 'VEHICLE';
    }

    // change icon colour based on age of report and speed of aircraft

    // convert tracking date to Unix seconds
    const t = moment(feature.properties.transmitted);
    // get current date time
    const d = historicViewDate ? moment(historicViewDate) : moment();
    // get time two hours ago
    const dt = d.clone().subtract(2, 'hours');
    // get midnight last night
    const dm = d.clone().startOf('day');
    // get midnight a few days days ago
    const dmw = dm.clone().subtract(3, 'days');

    // Start with the base grey icon colour
    let iconColour = '-gry';

    if (t.isAfter(dmw)) {
        // if seen in last few days make icon black
        iconColour = '-blk';
    }

    if (t.isAfter(dm)) {
        // if seen today make icon green
        iconColour = '-grn';
    }

    if (t.isAfter(dt)) {
        // if seen in last two hours make icon orange
        iconColour = '-org';
        // if aircraft is moving ( and has reported in last couple of hours) then use red icon
        if (feature.properties.speed > 10) {
            iconColour = '-red';
        }
    }

    icon = icon + iconColour;

    // append file extension
    icon = icon + '.png';

    // rotate marker by reported track
    const marker = L.marker(latlng, {
        rotationAngle: feature.properties.track,
        rotationOrigin: 'center center',
        icon: L.icon({
            iconUrl: icon,
            iconSize: [16, 16]
        })
    });


    return marker;
}

export const buildPopUpEquipmentContent = (feature) => {
    const equipment = feature;
    if (feature.properties.imeiMatch) {
        const equipmentData = {includeTitle: true};
        equipmentData.title = AMFUNC_DISP.getAssetTitle(equipment.properties);
        equipmentData.lastSeen = AMFUNC_DISP.getAssetLastSeen(equipment);
        equipmentData.spatialDisp = AMFUNC_DISP.getAssetSpatialDisp(equipment);
        equipmentData.details = AMFUNC_DISP.getEquipmentDetails(equipment);
        equipmentData.contactDetails = AMFUNC_DISP.getAssetDispatchContactDetails(equipment);
        return require('./templates/assetCommonContent.hbs')(equipmentData);
    } else {
        return buildPopUpOtherAssetContent(feature);
    }

};

export function buildPopUpAircraftContent(feature) {
    const aircraftData = {};
    if (feature.properties.imeiMatch) {
        // arena aircraft
        aircraftData.commonContent = buildPopUpAircraftCommonContent(feature, true);
        aircraftData.operatorDetails = AMFUNC_DISP.getAssetOperatorDetails(feature.properties);
        aircraftData.contactDetails = AMFUNC_DISP.getAssetDispatchContactDetails(feature);
        return require('./templates/aircraftPopup.hbs')(aircraftData);
    } else {
        return buildPopUpOtherAssetContent(feature);
    }

}

function buildPopUpAircraftCommonContent(aircraft, includeTitle) {
    const aircraftData = {includeTitle: includeTitle};
    if (includeTitle) {
        aircraftData.title = AMFUNC_DISP.getAssetTitle(aircraft.properties);
    }
    aircraftData.lastSeen = AMFUNC_DISP.getAssetLastSeen(aircraft);
    aircraftData.spatialDisp = AMFUNC_DISP.getAssetSpatialDisp(aircraft);
    aircraftData.details = AMFUNC_DISP.getAircraftDetails(aircraft.properties);
    return require('./templates/assetCommonContent.hbs')(aircraftData);
}

function buildPopUpOtherAssetContent(feature) {
    let popupContent = '<div class=\'arena-map-table\'><strong>OTHER ASSET</strong><br/>';
    popupContent += 'Asset not found in ARENA<br/><br/>';
    if (feature.properties) {
        const out = [];
        Object.entries(feature.properties).forEach(([key, value]) => {
            if (key !== 'url' && key !== 'productType' && key !== 'unparseableTrackingRego' && value) {
                out.push('<span class=\'emphasis\'>' + key + ':</span> ' + value);
            }
            if (key === 'transmitted') {
                // convert tracking date to a moment
                const t = moment(value);
                // get current date time
                const d = moment();
                // calculate the duration
                const dh = moment.duration(t.diff(d)).humanize(true);
                out.push('<span class=\'emphasis\'>Last seen:</span> ' + dh);
            }
        });
        popupContent += out.join('<br/>');
    }
    popupContent += '</div>';
    return popupContent;
}

export function styleAssetTrack(feature) {
    const speed = feature.properties.speed[feature.properties.speed.length - 1];
    let colour = '#336699';
    switch (true) {
        case speed < 0:
            // use the default colour
            break;
        case speed <= 20:
            colour = '#585858 '; // grey
            break;

        case speed <= 100:
            colour = '#ff9900'; // orange
            break;

        case speed <= 200:
            colour = '#ff0000'; // red
            break;

        default:
            colour = '#cc0099'; // purple
    }
    return colour;

}

export function buildTrackingPopup(e, feature, type) {
    const clickPoint = turf.point([e.latlng.lng, e.latlng.lat]);
    const coordinates = feature.geometry.coordinates;
    const properties = feature.properties;
    const pointOnLine = turf.pointOnLine(feature, clickPoint);
    const index = pointOnLine.properties.index;
    const lat = parseFloat(coordinates[index][1]);
    const lng = parseFloat(coordinates[index][0]);
    const label = properties.assetRegistration;
    const assetType = properties.assetType;
    const coords = lat.toFixed(3) + ',' + lng.toFixed(3);
    const time = moment(properties.time[index]).format('HH:mm:ss DD/MM/YYYY');
    const speed = properties.speed[index];
    const track = properties.track[index];
    const altitude = AMFUNC_DISP.mToFeet(coordinates[index][2]).toFixed(0);
    const content = require('./templates/assetSpatialData.hbs')({
        label,
        assetType,
        time,
        coords,
        speed,
        track,
        altitude
    });
    return content;
}

export function renderLocationPopup(location) {
    return require('./templates/locationPopup.hbs')({
        location,
    });
}

export function locationIcon(location) {
    let icon;
    switch (location.classification) {
        case 'Primary':
            icon = locationPrimaryIcon;
            break;
        case 'Secondary':
            icon = locationSecondaryIcon;
            break;
        case 'Support':
            icon = locationSupportIcon;
            break;
        case 'Helipad':
            icon = locationHelipadIcon;
            break;
        default:
            icon = locationUnclassifiedIcon;
            break;
    }
    return icon;

}

const locationPrimaryIcon = L.icon({
    iconUrl: './icons/location-crosshairs-red.svg',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

const locationSecondaryIcon = L.icon({
    iconUrl: './icons/location-crosshairs-orange.svg',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

const locationSupportIcon = L.icon({
    iconUrl: './icons/location-crosshairs-blue.svg',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

const locationHelipadIcon = L.icon({
    iconUrl: './icons/location-crosshairs-purple.svg',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

const locationUnclassifiedIcon = L.icon({
    iconUrl: './icons/location-crosshairs-grey.svg',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

export const equipmentAVMarker = L.ExtraMarkers.icon({
    // AVAILABLE marker
    icon: 'fa-truck',
    iconColor: 'yellow',
    markerColor: 'green-dark',
    shape: 'square',
    prefix: 'fa'
});
export const equipmentLIMarker = L.ExtraMarkers.icon({
    // LIMITED AVILABLE marker
    icon: 'fa-truck',
    iconColor: 'orange',
    markerColor: 'green-dark',
    shape: 'square',
    prefix: 'fa'
});
export const equipmentSTMarker = L.ExtraMarkers.icon({
    // STANDBY marker
    icon: 'fa-truck',
    iconColor: 'yellow',
    markerColor: 'blue',
    shape: 'square',
    prefix: 'fa'
});
export const equipmentDSMarker = L.ExtraMarkers.icon({
    // DISPATCHED marker
    icon: 'fa-truck',
    iconColor: 'orange',
    markerColor: 'blue',
    shape: 'square',
    prefix: 'fa'
});
export const equipmentUAMarker = L.ExtraMarkers.icon({
    // UNAVAILABLE marker
    icon: 'fa-truck',
    iconColor: 'gray',
    markerColor: 'white',
    shape: 'square',
    prefix: 'fa'
});
export const equipmentUSMarker = L.ExtraMarkers.icon({
    // UNSERVICEABLE marker
    icon: 'fa-truck',
    iconColor: 'black',
    markerColor: 'white',
    shape: 'square',
    prefix: 'fa'
});
export const equipmentMGMarker = L.ExtraMarkers.icon({
    // Multiple AVAILABLE OR LIMITED marker
    icon: 'fa-truck',
    iconColor: 'white',
    markerColor: 'green-dark',
    shape: 'star',
    prefix: 'fa',
    extraClasses: 'marker-cluster-multi'
});
export const equipmentMBMarker = L.ExtraMarkers.icon({
    // MULTIPLE STANDBY OR DEPLOYED marker
    icon: 'fa-truck',
    iconColor: 'white',
    markerColor: 'blue',
    shape: 'star',
    prefix: 'fa',
    extraClasses: 'marker-cluster-multi'
});
// Creates a marker with a equipment icon
export const equipmentMarker = L.ExtraMarkers.icon({
    // generic marker
    icon: 'fa-truck',
    markerColor: 'blue',
    shape: 'square',
    prefix: 'fa'
});
// show different markers for different types of Aircraft Availability
export function iconForEquipmentAvailability(availabilityType) {
    switch (availabilityType) {
        case 'AVAILABLE':
            return equipmentAVMarker;
        case 'LIMITED':
            return equipmentLIMarker;
        case 'STANDBY':
        case 'STANDBY_TEMP_ASSET':
        case 'STANDBY_AMENDED':
            return equipmentSTMarker;
        case 'UNAVAILABLE':
            return equipmentUAMarker;
        case 'UNSERVICEABLE':
            return equipmentUSMarker;
        case 'DEPLOYED':
        case 'DISPATCHED':
            return equipmentDSMarker;

        default:
            return equipmentMarker;
    }
};


// const paperPlane = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><path d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"/></svg>;

// Creates a marker with a plane icon
export const planeMarker = L.ExtraMarkers.icon({
    // generic marker
    icon: 'fa-paper-plane',
    markerColor: 'blue',
    shape: 'square',
    prefix: 'fa'
});
export const planeAVMarker = L.ExtraMarkers.icon({
    // AVAILABLE marker
    icon: 'fa-paper-plane',
    iconColor: 'yellow',
    markerColor: 'green-dark',
    shape: 'square',
    prefix: 'fa'
});

export const planeLIMarker = L.ExtraMarkers.icon({
    // LIMITED AVILABLE marker
    icon: 'fa-paper-plane',
    iconColor: 'orange',
    markerColor: 'green-dark',
    shape: 'square',
    prefix: 'fa'
});

export const planeSTMarker = L.ExtraMarkers.icon({
    // STANDBY marker
    icon: 'fa-paper-plane',
    iconColor: 'yellow',
    markerColor: 'blue',
    shape: 'square',
    prefix: 'fa'
});

export const planeDSMarker = L.ExtraMarkers.icon({
    // DISPATCHED marker
    icon: 'fa-paper-plane',
    iconColor: 'orange',
    markerColor: 'blue',
    shape: 'square',
    prefix: 'fa'
});

export const planePDMarker = L.ExtraMarkers.icon({
    // PLANNED DISPATCHED marker
    icon: 'fa-paper-plane',
    iconColor: '#6300d0',
    markerColor: 'blue',
    shape: 'square',
    prefix: 'fa'
});

export const planeUAMarker = L.ExtraMarkers.icon({
    // UNAVAILABLE marker
    icon: 'fa-paper-plane',
    iconColor: 'gray',
    markerColor: 'white',
    shape: 'square',
    prefix: 'fa'
});
export const planeUSMarker = L.ExtraMarkers.icon({
    // UNSERVICEABLE marker
    icon: 'fa-paper-plane',
    iconColor: 'black',
    markerColor: 'white',
    shape: 'square',
    prefix: 'fa'
});

export const planeMGMarker = L.ExtraMarkers.icon({
    // Multiple AVAILABLE OR LIMITED marker
    icon: 'fa-paper-plane',
    iconColor: 'white',
    markerColor: 'green-dark',
    shape: 'star',
    prefix: 'fa',
    extraClasses: 'marker-cluster-multi'
});

export const planeMBMarker = L.ExtraMarkers.icon({
    // MULTIPLE STANDBY OR DEPLOYED marker
    icon: 'fa-paper-plane',
    iconColor: 'white',
    markerColor: 'blue',
    shape: 'star',
    prefix: 'fa',
    extraClasses: 'marker-cluster-multi'
});
// show different markers for different types of Aircraft Availability
export function iconForAircraftAvailability(availabilityType) {
    switch (availabilityType) {
        case 'AVAILABLE':
            return planeAVMarker;
        case 'LIMITED':
            return planeLIMarker;
        case 'STANDBY':
        case 'STANDBY_TEMP_ASSET':
        case 'STANDBY_AMENDED':
            return planeSTMarker;
        case 'UNAVAILABLE':
            return planeUAMarker;
        case 'UNSERVICEABLE':
            return planeUSMarker;
        case 'DEPLOYED':
        case 'DISPATCHED':
        case 'PLANNED_DISPATCH':
            return planeDSMarker;

        default:
            return planeMarker;
    }
}
// Always returns an array, possibly empty
const popUpAvailabilityContent = function(feature, popupContent) {
    if (feature.properties) {
        const availability = feature.properties;
        const status = availability.event_name ? availability.event_name : availability.event_type;
        const statusClass = 'status-' + AMFUNC_DISP.getStatusClass(availability.event_type);

        // Ensure popups are styled the same as tables.
        popupContent += '<div class="arena-map-table">';
        popupContent += '<span class="emphasis">' + AMFUNC_DISP.getAssetTitle(asset) + '</span><br/>';
        popupContent += '<span class="' + statusClass + '">';
        popupContent += '<span class="eventName emphasis">' + status + '</span>';
        popupContent += availability.dispatch_number ? '' : ' ' + timeToString(availability.response);
        popupContent += '</span><br/>';

        if (availability.base_location) {
            popupContent += '<span class="emphasis">';
            if (availability.temp_base) {
                popupContent += 'TOB';
            } else {
                popupContent += 'NOB';
            }
            popupContent += `: </span>${availability.base_location}<br/>`;
        }

        if (availability.fuelling_arrangement) {
            const fuellingDescription = getFuellingArrangmentDisplayValue(availability.fuelling_arrangement);
            popupContent += '<span class="emphasis">Fuelling Arrangement:</span> ';
            popupContent += fuellingDescription;
            popupContent += '<br/>';
        }

        if (feature.geometry&&
            // MIGHT NEED TO ADD MORE EVENT TYPES HERE
            availability.event_type !== 'UNAVAILABLE' &&
            availability.event_type !== 'UNSERVICEABLE') {
            const fromPt = {
                type: 'Feature',
                properties: {},
                geometry:feature.geometry.coordinates
            };
            const toPt = {
                type: 'Feature',
                properties: {},
                geometry: feature.properties.base_location_coordinates
            };
            const distance = turf.distance(fromPt, toPt, 'kilometers');
            if (!isNaN(distance)) {
                popupContent += '<span class="emphasis">Currently:</span> ';
                if (distance < 5) {
                    popupContent += 'at base';
                } else {
                    popupContent += distance.toFixed(0) + ' km from base';
                }
            }
            popupContent += '<br/>';
        }

        const isEquipment = availability.is_equipment;
        popupContent +=
            (!isEquipment ? buildPopUpAircraftCommonContent(asset, false) : buildPopUpEquipmentCommonContent(asset, false));

        popupContent += AMFUNC_DISP.getAssetOperatorDetails(asset);
        popupContent += AMFUNC_DISP.getAssetDispatchContactDetails(asset) + '<br/>';
        popupContent += '</div>';
        popupContent += getAssetPlanningActions(isEquipment, asset);
    }
    return popupContent;
};

export const renderAvailabilityPopup = function(feature, assetMode) {
    let popupContent = '<strong>AVAILABILITY RECORD </strong><br/>';
    popupContent = popUpAvailabilityContent(feature.properties, popupContent);
    return popupContent;
};


