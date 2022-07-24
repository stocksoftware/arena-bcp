import buildIncidentIcon from "./buildIncidentIcon";
import {MAP_CONSTANTS} from "../constant";
import 'leaflet-extra-markers';
import 'leaflet-rotatedmarker';
import * as AMFUNC_MATH from './arenamap-math';
// import $ from 'jquery';
import moment from 'moment-timezone';
import '../css/thirdparty/leaflet.label';
import '../css/thirdparty/leaflet.label.css';
import * as AMFUNC_DISP from './arenamap-funcs-disp';
import * as AM_FILTER from './arenamap-filters';
let _equipmentImeiMap={};

export function buildPopUpEquipmentContent(feature) {
    let popupContent = '';
    const equipmentFromFeature = getEquipmentDetailsForFeature(feature);
    if (equipmentFromFeature.length) {
        // Ensure popups are styled the same as tables.
        popupContent += '<div class="arena-map-table">';
        if (equipmentFromFeature.length > 1) {
            popupContent += buildPopUpEquipmentCommonContent(equipmentFromFeature[0], true);
            const tabsId = ('tabs-' + cleanNonAlphaNumericCharacters(equipmentFromFeature[0].registration));
            popupContent +=
                '<span class=\'warning-icon\'><i class=\'fa fa-warning\'></i> This equipment has been registered by multiple operators </span>';
            popupContent += '<ul class=\'tabs\' id=\'' + tabsId + '-ul\'>';
            let tabContent = '<div id=\'' + tabsId + '-div\'>';
            for (let i = 0; i < equipmentFromFeature.length; i++) {
                const tabId = 'tab-' + i;
                const liId = 'li-' + i;
                const showTab = ' AM_MAP.showOperatorTab("' + tabsId + '", "' + tabId + '", "' + liId + '")';
                popupContent = popupContent +
                    (('<li id=\'' + liId + '\' ' + (i === 0 ? ' class=\'selected\'>' : '>')) +
                        '<a href=\'#\' onclick=\'' + showTab + '\'> Operator ' + (i + 1) + '</a></li>');
                tabContent += ('<div id=\'' + tabId + '\' class=\'tabContent ' + (i === 0 ? 'open' : 'close') + '\'>');
                const equipment = equipmentFromFeature[i];
                const incident = AMFUNC_DISP.getIncident(equipment,
                    AM_FILTER.getAssetTypes().EQUIPMENT,
                    _cachedIncidentData);
                tabContent += incident ? incident + '<br/>' : '';
                tabContent += AMFUNC_DISP.getAssetOperatorDetails(equipment) + '<br/>';
                if (!_readOnlyMode) {
                    tabContent += AMFUNC_DISP.getEquipmentActions(equipment, true);
                }
                tabContent += '</div>';
                popupContent += AMFUNC_DISP.getAssetPlanningActions(true, equipment);
                popupContent += AMFUNC_DISP.getOpsAssetActions(true, equipment, isAssetPinned(equipment.imei));
            }
            tabContent += '</div>';
            popupContent += '</ul>';
            popupContent += tabContent;
        } else {
            const equipment = equipmentFromFeature[0];
            popupContent += buildPopUpEquipmentCommonContent(equipment, true);
            popupContent +=
                AMFUNC_DISP.getIncident(equipment, AM_FILTER.getAssetTypes().AIRCRAFT, _cachedIncidentData) + '<br/>';
            popupContent += AMFUNC_DISP.getAssetOperatorDetails(equipment) + '<br/>';
            popupContent += AMFUNC_DISP.getEquipmentActions(equipment, true);
            popupContent += AMFUNC_DISP.getAssetPlanningActions(true, equipment);
            popupContent += AMFUNC_DISP.getOpsAssetActions(true, equipment, isAssetPinned(equipment.imei));
        }
        popupContent += '</div>';
    } else {
        popupContent += buildPopUpOtherAssetContent(feature);
    }
    return popupContent;
}
function buildPopUpOtherAssetContent(feature) {
    let popupContent = '<strong>OTHER ASSET</strong><br/>';
    popupContent += 'Asset not found in ARENA<br/><br/>';
    if (feature.properties) {
        const out = [];
        Object.entries(feature.properties).forEach(entry => {
            const [key, value] = entry;
                if (key !== 'url' && key !== 'unparseableTrackingRego' && value) {
                    out.push('<span class=\'popupKey\'>' + key + ':</span> ' + value);
                }
                if (key === 'transmitted') {
                    // convert tracking date to a moment
                    const t = moment(value);
                    // get current date time
                    const d = moment();
                    // calculate the duration
                    const dh = moment.duration(t.diff(d)).humanize(true);
                    out.push('<span class=\'popupKey\'>Last seen:</span> ' + dh);
                }
        }
            )
        popupContent += out.join('<br/>');
    }
    return popupContent;
}
function buildPopUpEquipmentCommonContent(equipment, includeTitle) {
    const equipmentData = { includeTitle: includeTitle };
    if (includeTitle) {
        equipmentData.title = AMFUNC_DISP.getAssetTitle(equipment);
    }
    equipmentData.lastSeen = AMFUNC_DISP.getAssetLastSeen(equipment);
    equipmentData.spatialDisp = AMFUNC_DISP.getAssetSpatialDisp(equipment);
    equipmentData.details = AMFUNC_DISP.getEquipmentDetails(equipment);
    equipmentData.contactDetails = AMFUNC_DISP.getAssetDispatchContactDetails(equipment);
    return require('./templates/assetCommonContent.hbs')(equipmentData);
}

export function styleAssetMarker(feature, latlng, historicViewDate) {
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
    console.log( feature.properties.track);
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
export function getAircraftDetailsForFeature(feature) {
    let aircraft = null;
    // if (feature && feature.properties && feature.properties.asset_id && !feature.properties.is_equipment) {
    //     aircraft = _aircraftIdMap[feature.properties.asset_id];
    // } else if (feature && feature.properties && feature.properties.imei) {
    //     aircraft = _aircraftImeiMap[feature.properties.imei];
    // }
    // // Always returns an array, possibly empty
    return aircraft ? _.flatten([aircraft]) : [];
}

// Always returns an array, possibly empty
export function getEquipmentDetailsForFeature(feature) {
    let equipment = null;
    if (feature && feature.properties && feature.properties.equipment_id) {
        equipment = _equipmentIdMap[feature.properties.equipment_id];
    } else if (feature && feature.properties && feature.properties.asset_id && feature.properties.is_equipment) {
        equipment = _equipmentIdMap[feature.properties.asset_id];
    } else if (feature && feature.properties && feature.properties.imei) {
        equipment = _equipmentImeiMap[feature.properties.imei];
    }

    // Always returns an array, possibly empty
    return equipment ? _.flatten([equipment]) : [];
}
function getAircraftLabel(callsign, regLabel) {
    let labelTxt = callsign || regLabel;
    if (labelTxt) {
        labelTxt = labelTxt.replace('HELITAK ', 'HT');
        labelTxt = labelTxt.replace('HELITACK ', 'HT'); // allow for incorrect spelling
        labelTxt = labelTxt.replace('BOMBER ', 'B');
        labelTxt = labelTxt.replace('FIREBIRD ', 'FB');
        labelTxt = labelTxt.replace('FIRESPOTTER ', 'FS');
        labelTxt = labelTxt.replace('FIREBIRD ', 'FB');
        labelTxt = labelTxt.replace('LIFESAVER ', 'LS');
        labelTxt = labelTxt.replace('FIRESCAN ', 'SCAN');
        labelTxt = labelTxt.replace('PARKAIR ', 'PKAIR');
        labelTxt = labelTxt.replace('BIRDDOG ', 'BD');
    }
    return labelTxt;
}
export function getIconForIncident(feature) {
    // TODO process Incident data to render markers in standard 'fire' icons rather than these off the shelf ones
    const dispatchCount = feature.properties.currentDispatchCount ?
        feature.properties.currentDispatchCount :
        feature.properties.dispatchCount ? '*' : '';
    const currentDate = new Date();
    const startDate = new Date(feature.properties.startDate);

    let borderColour;
    let fillColour ='#ccc';
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
                iconColour='#ef9227';
                break;
            case 'CONTROLLED':
                iconColour='#211c1d';
                break;
            case 'OTHER':
                iconColour='#d3d3de';
                break;
            default:
                fillColour='#ccc';
                break;
        }
    }
    
    // none of the above
    return buildIncidentIcon(dispatchCount, fillColour, iconColour, borderColour);
}
export const renderIncidentPopup = function(feature) {
    // let addDisatchBoardButton = false;
    parseNotesField(feature);
    // console.log(feature)
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
            if (includePopupKey(key)) {
                const valueString = formatNullToString(value);
                if (key === 'dispatchCount') {
                    if (valueString !== '0') {
                        showCurrentDispatchCountEvenIfZero = true;
                    } else {
                        return;
                    }
                }
                if (key !== 'dateClosed') {
                    out.push('<strong>' + formatPopupKey(key) + ':</strong> ' + valueString);
                }
                if (key === 'endDate') {
                    const dateClosed = formatNullToString(feature.properties.dateClosed);
                    out.push('<strong>' + formatPopupKey('dateClosed') + ':</strong> ' + dateClosed);
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
const formatNullToString = function (value) {
    return value === null ? '' : `${value}`;
};

const formatPopupKey = function(key) {
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
const includePopupKey = function(key) {
    return key !== 'event_type' && key !== 'Data' &&
        key !== 'url' &&
        key !== 'id' &&
        key !== 'searchText' &&
        key !== 'dateCreated' &&
        key !== 'unparseableTrackingRego';
};
const parseNotesField = function(feature) {
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



export function toShortCallsign(callsign) {
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
}
function cleanNonAlphaNumericCharacters(string) {
    if (!string) {
        return '';
    }

    return string.replace(/[^a-zA-Z0-9]/g, '');
}