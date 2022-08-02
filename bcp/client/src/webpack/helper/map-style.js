import * as L from 'leaflet';
import 'leaflet-extra-markers';
import {ASSET_MODE, MAP_CONSTANTS} from '../constant';
import * as AMFUNC_MATH from './map-math';
import * as AMFUNC_DISP from './map-display';
import moment from 'moment-timezone';
import turf from 'turf';
import {fetchAsset} from "./toGeoJSON";

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
const equipmentIconMarker = (iconColor, markerColor) => L.ExtraMarkers.icon({
    innerHTML: equipmentIconHtml(iconColor, markerColor),
    svg: true
});
const planeIconMarker = (iconColor, markerColor) => L.ExtraMarkers.icon({
    innerHTML: planeIconHtml(iconColor, markerColor),
    svg: true
});
const planeIconHtml = (iconColor, markerColor) => {
    return `<svg class="fa-content" width="15" height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><path fill='${iconColor}' d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"/></svg><svg class="truckContainer" width="35" height="45" viewBox="0 0 35 45" xmlns="http://www.w3.org/2000/svg"><path fill='${markerColor}' d="M28.205 3.217H6.777c-2.367 0-4.286 1.87-4.286 4.179v19.847c0 2.308 1.919 4.179 4.286 4.179h5.357l5.337 13.58 5.377-13.58h5.357c2.366 0 4.285-1.87 4.285-4.179V7.396c0-2.308-1.919-4.179-4.285-4.179" fill="red" /><g opacity=".15" transform="matrix(1.0714 0 0 -1.0714 -233.22 146.783)"><path d="M244 134h-20c-2.209 0-4-1.746-4-3.9v-18.525c0-2.154 1.791-3.9 4-3.9h5L233.982 95 239 107.675h5c2.209 0 4 1.746 4 3.9V130.1c0 2.154-1.791 3.9-4 3.9m0-1c1.654 0 3-1.301 3-2.9v-18.525c0-1.599-1.346-2.9-3-2.9h-5.68l-.25-.632-4.084-10.318-4.055 10.316-.249.634H224c-1.654 0-3 1.301-3 2.9V130.1c0 1.599 1.346 2.9 3 2.9h20" fill="#231f20" /></g></svg>`
};
const equipmentIconHtml = (iconColor, markerColor) => {
    return `<svg class="fa-content" width="15" height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill='${iconColor}' d="M368 0C394.5 0 416 21.49 416 48V96H466.7C483.7 96 499.1 102.7 512 114.7L589.3 192C601.3 204 608 220.3 608 237.3V352C625.7 352 640 366.3 640 384C640 401.7 625.7 416 608 416H576C576 469 533 512 480 512C426.1 512 384 469 384 416H256C256 469 213 512 160 512C106.1 512 64 469 64 416H48C21.49 416 0 394.5 0 368V48C0 21.49 21.49 0 48 0H368zM416 160V256H544V237.3L466.7 160H416zM160 368C133.5 368 112 389.5 112 416C112 442.5 133.5 464 160 464C186.5 464 208 442.5 208 416C208 389.5 186.5 368 160 368zM480 464C506.5 464 528 442.5 528 416C528 389.5 506.5 368 480 368C453.5 368 432 389.5 432 416C432 442.5 453.5 464 480 464z"/></svg><svg class="truckContainer" width="35" height="45" viewBox="0 0 35 45" xmlns="http://www.w3.org/2000/svg"><path fill='${markerColor}' d="M28.205 3.217H6.777c-2.367 0-4.286 1.87-4.286 4.179v19.847c0 2.308 1.919 4.179 4.286 4.179h5.357l5.337 13.58 5.377-13.58h5.357c2.366 0 4.285-1.87 4.285-4.179V7.396c0-2.308-1.919-4.179-4.285-4.179" fill="red" /><g opacity=".15" transform="matrix(1.0714 0 0 -1.0714 -233.22 146.783)"><path d="M244 134h-20c-2.209 0-4-1.746-4-3.9v-18.525c0-2.154 1.791-3.9 4-3.9h5L233.982 95 239 107.675h5c2.209 0 4 1.746 4 3.9V130.1c0 2.154-1.791 3.9-4 3.9m0-1c1.654 0 3-1.301 3-2.9v-18.525c0-1.599-1.346-2.9-3-2.9h-5.68l-.25-.632-4.084-10.318-4.055 10.316-.249.634H224c-1.654 0-3 1.301-3 2.9V130.1c0 1.599 1.346 2.9 3 2.9h20" fill="#231f20" /></g></svg>`
};

// show different markers for different types of Aircraft Availability
export const iconForEquipmentAvailability = (availabilityType) => {
    switch (availabilityType) {
        case 'AVAILABLE':
            return equipmentIconMarker('yellow', '#0F3325');
        case 'LIMITED':
            return equipmentIconMarker('orange', '#0F3325');
        case 'STANDBY':
        case 'STANDBY_TEMP_ASSET':
        case 'STANDBY_AMENDED':
            return equipmentIconMarker('yellow', 'blue');
        case 'UNAVAILABLE':
            return equipmentIconMarker('grey', 'white');
        case 'UNSERVICEABLE':
            return equipmentIconMarker('black', 'white');
        case 'DEPLOYED':
        case 'DISPATCHED':
            return equipmentIconMarker('orange', 'blue');

        default:
            return equipmentIconMarker('', 'blue');
    }
};

// Creates a marker with a plane icon
export const planeMarker = planeIconHtml('', 'blue')
const planeAVMarker = planeIconMarker('yellow', '#0F3325');
const planeLIMarker = planeIconMarker('orange', '#0F3325');
const planeSTMarker = planeIconMarker('yellow', 'blue');
export const planeDSMarker = planeIconMarker('orange', 'blue');
export const planeUAMarker = planeIconMarker('gray', 'white');
export const planeUSMarker = planeIconMarker('black', 'white');
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

export const renderAvailabilityPopup = async function (feature) {
    let popupContent = '<strong>AVAILABILITY RECORD </strong><br/>';
    popupContent = await popUpAvailabilityContent(feature, popupContent);
    return popupContent;
};

const popUpAvailabilityContent = function (feature, popupContent) {
    if (feature && feature.properties) {
        const availability = feature.properties;
        const status = availability.event_name ? availability.event_name : availability.event_type;
        const statusClass = 'status-' + AMFUNC_DISP.getStatusClass(availability.event_type);

        // Ensure popups are styled the same as tables.
        popupContent += '<div class="arena-map-table">';
        popupContent += '<span class="emphasis">' + AMFUNC_DISP.getAssetTitle(availability) + '</span><br/>';
        popupContent += '<span class="' + statusClass + '">';
        popupContent += '<span class="eventName emphasis">' + status + '</span>';
        popupContent += availability.dispatch_number ? '' : ' ' + AMFUNC_MATH.timeToString(availability.response);
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
            const fuellingDescription = AMFUNC_DISP.getFuellingArrangmentDisplayValue(availability.fuelling_arrangement);
            popupContent += '<span class="emphasis">Fuelling Arrangement:</span> ';
            popupContent += fuellingDescription;
            popupContent += '<br/>';
        }

        if (availability &&
            // MIGHT NEED TO ADD MORE EVENT TYPES HERE
            availability.event_type !== 'UNAVAILABLE' &&
            availability.event_type !== 'UNSERVICEABLE') {
            const fromPt = {
                type: 'Feature',
                properties: {},
                geometry: feature.geometry
            };
            const toPt = {
                type: 'Feature',
                properties: {},
                geometry: {type: 'Point', coordinates: feature.properties.base_location_coordinates}

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
        if (availability.id) {
            // arena asset
            const isEquipment = availability.is_equipment;
            popupContent +=
                (!isEquipment ? buildPopUpAircraftCommonContent(feature, false) : buildPopUpEquipmentCommonContent(feature, false));
            popupContent += AMFUNC_DISP.getAssetOperatorDetails(feature.properties);
            popupContent += AMFUNC_DISP.getAssetAvailabilityNotes(feature);
            popupContent += AMFUNC_DISP.getAssetDispatchContactDetails(feature);
        }
    }
    return popupContent;
};




