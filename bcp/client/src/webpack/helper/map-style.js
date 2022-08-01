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
