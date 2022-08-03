const FEET_PER_M = 3.281;
import {AIRCRAFT_CATEGORIES, MAP_CONSTANTS} from '../constant';

import moment from 'moment-timezone';

export const getEquipmentCell = (equipment) => {
    const equipmentDetails = {
        description: equipment.description,
        registration: equipment.registration ? equipment.registration : null,
        operatorName: equipment.operator ?
            cleanOperatorName(equipment.operator.name ?
                equipment.operator.name :
                equipment.operator.registeredName) :
            null
    }
    return equipmentDetails;
}
export const getPopUpContents = (asset) => {
    let feature = {properties: asset};
    const lastSeen = getAssetLastSeen(feature);
    const aircraftDetails = getAircraftDetailsForPopup(feature.properties);
    const operator = getAssetOperatorDetailsForPopup(asset);
    // const dispatchDetails = getAssetDispatchDetails(feature)
    // return {lastSeen,aircraftDetails, operator, dispatchDetails}
    return {lastSeen, aircraftDetails,operator};
}
function getAssetOperatorDetailsForPopup(asset){
    let details ={name:'', contact: ''};
    if (asset.operator.name || asset.operator.registeredName || asset.operator.operationalContact) {
        details.name = cleanOperatorName(asset.operator.name ? asset.operator.name : asset.operator.registeredName);
        details.contact =
            asset.operator.operationalContact ? safeString(asset.operator.operationalContact) : '';}
    return details;
}
function getAircraftDetailsForPopup(aircraft) {

    const category = aircraft.category ? formatAircraftCategory(aircraft.category)  : '';
    let makeAndModel = aircraft.make ? safeString(aircraft.make) + ' ' : '';
    makeAndModel += aircraft.model ? safeString(aircraft.model)  : '';
    const imageSrc = aircraft.model ? getAssetSilhouettePath(aircraft) : '';
    return {category, makeAndModel, imageSrc};
}

export function getAssetDispatchDetails(feature) {
    const {properties} = feature;
    if (properties.dispatch_contact ||
        properties.dispatch_email ||
        properties.dispatch_phone) {
        details.showContact = true;
        details.contactName = properties.dispatch_contact;
        details.email = properties.dispatch_email;
        details.phone = properties.dispatch_phone;
        details.altPhone = properties.dispatch_alt_phone;
        details.altPhoneIntegration = formatPhoneIntegrationValue(user.phoneIntegration, details.altPhone);
        return require('./templates/assetDispatchContactDetails.hbs')(details);
    }


}

export const getAircraftCell = function (aircraft) {
    const aircraftDetails = {
        callsign: aircraft.callsign ? aircraft.callsign : null,
        registration: aircraft.registration ? aircraft.registration : null,
        operatorName: aircraft.operator ?
            cleanOperatorName(aircraft.operator.name ?
                aircraft.operator.name :
                aircraft.operator.registeredName) :
            null
    };
    return aircraftDetails;
};


export function getAssetTitle(asset) {
    return asset.callsign ? asset.callsign + ' [' + asset.registration + ']' : asset.registration;
}

export function getAssetLastSeen(asset) {
    let content = '';
    if (asset.properties.transmitted) {
        // compute and humanise last seen time
        const lastSeen = moment(asset.properties.transmitted);
        const timeDiff = lastSeen.diff(moment());
        content += moment.duration(timeDiff).humanize(true) + ' at ' + lastSeen.format('HH:mm');
    }
    return content;
}

export function getAssetLastSeenDetails(asset) {
    const lastSeen = getAssetLastSeen(asset);
    if (lastSeen) {
        return require('./templates/lastSeenDetails.hbs')({details: lastSeen});
    }
    return '';
}

export function getAssetSpatialDisp(asset) {
    let content = '';
    if (
        asset.geometry &&
        asset.properties.speed &&
        asset.properties.track) {
        const stateText = asset.trackingData ? asset.trackingData.stateText : null;
        const lat = asset.geometry.coordinates[1];
        const lon = asset.geometry.coordinates[0];
        const spd = asset.properties.speed;
        const trk = asset.properties.track;
        const alt = asset.geometry.coordinates[2];
        if (stateText) {
            if (stateText === 'Unknown') {
                content +=
                    '<strong>State:</strong> <span class="tblWarning"><strong> ' + stateText + '</strong></span></BR>';
                content +=
                    '<span class="tblWarning">' +
                    (AM_FILTER.getCurrentAssetTypeFilterValue() === AM_FILTER.getAssetTypes().AIRCRAFT ?
                        'The aircraft was last known to be flying but has not reported a landing or reported recently.' :
                        'The equipment was last known to be moving but has not reported recently.') + '</span></BR>';
            } else {
                content += '<strong>State:</strong> ' + stateText + '</BR>';
            }
        }
        content +=
            '<strong>Coords: </strong>' + parseFloat(lat).toFixed(3) + ',' + parseFloat(lon).toFixed(3) + '</BR>';
        if (stateText !== 'Parked') {
            content += '<strong>Speed:</strong> ' + spd + ' km/h </BR>';
            content += '<strong>Track:</strong> ' + trk + ' deg</BR>';
        }
        // content += '<strong>Altitude:</strong> ' + mToFeet(alt).toFixed(0) + ' ft</BR>';
    }

    return content;
}

export function getEquipmentDetails(equipment) {
    let content = '';
    content += (equipment.properties.description ?
        '<strong>Description: </strong>' + safeString(equipment.properties.description) + '<br/>' :
        '');
    content +=
        (equipment.properties.fuelType ? '<strong>Fuel Type: </strong>' + safeString(equipment.properties.fuelType) + '<br/>' : '');
    return content;
}

export function getAssetDispatchContactDetails(asset) {
    if (asset.properties) {
        const details = {showContact: false};
        const properties = asset.properties;
        details.number = properties.dispatch_number;
        if (properties.dispatch_contact ||
            properties.dispatch_email ||
            properties.dispatch_phone) {
            details.showContact = true;
            details.contactName = properties.dispatch_contact;
            details.email = properties.dispatch_email;
            details.phone = properties.dispatch_phone;
        }
        return require('./templates/assetDispatchContactDetails.hbs')(details);
    }
}

export function mToFeet(m) {
    return m * FEET_PER_M;
}

export function getAssetOperatorDetails(asset) {
    const details = {};
    details.photo = asset.profilePhotoSmall ? getAssetProfilePhoto(asset) : '';
    if (asset.operator.name || asset.operator.registeredName || asset.operator.operationalContact) {
        details.name = cleanOperatorName(asset.operator.name ? asset.operator.name : asset.operator.registeredName);
        details.contact =
            asset.operator.operationalContact ? safeString(asset.operator.operationalContact) : '';
        return require('./templates/assetOperatorDetails.hbs')(details);
    }
    return details.photo;
}

export function getAircraftDetails(aircraft) {
    let content = '<span class="subsection-heading">Type:</span><div class="subsection">';

    content += aircraft.category ? formatAircraftCategory(aircraft.category) + '<br/>' : '';
    content += aircraft.make ? safeString(aircraft.make) + ' ' : '';
    content += aircraft.model ? safeString(aircraft.model) + '<br/>' : '';
    content += aircraft.model ? getAssetSilhouette(aircraft) : '';
    content += '</div>';
    return content;
}

export function formatAircraftCategory(category) {
    const aircraftcategory = AIRCRAFT_CATEGORIES[category] || category;
    return aircraftcategory.replace(/FW -/, 'Fixed Wing -').replace(/RW -/, 'Helicopter -');
}

export function getAssetProfilePhoto(asset) {
    if (asset.profilePhotoSmall) {
        return '<img src=\'' + asset.profilePhotoSmall + '\' style="width:auto;height:90px">';
    }
    return '';
}

export function cleanOperatorName(string) {
    if (!string) {
        return '';
    }
    let result = safeString(string);
    result = result.replace(/[pP][tT][yY]/, '');
    result = result.replace(/[lL][tT][dD]/, '');
    return result.trim();
}

export function getAssetSilhouette(asset) {
    return '<img src=\'' + getAssetSilhouettePath(asset) + '\' style=\'width:100px; height:auto;\'/>';
}

function getAssetSilhouettePath(asset) {
    let path;

    if (asset.isEquipment || asset._isEquipment) {
        path = getEquipmentSilhouettePath(asset);
    } else {
        path = getAircraftSilhouettePath(asset);
    }

    return path ? './silhouettes/' + path : null;
}

export function getAircraftSilhouettePath(aircraft) {
    let silhouettePath;
    const model = aircraft.model;
    if (aircraft.airframe === 'HELICOPTER') {
        if (model.includes('350')) {
            silhouettePath = 'AS350B3.png';
        } else if (model.includes('355')) {
            silhouettePath = 'AS355F1.png';
        } else if (model.includes('145')) {
            silhouettePath = 'EC145.png';
        } else if (model.includes('206L')) {
            silhouettePath = 'B206L.png';
        } else if (model.includes('365')) {
            silhouettePath = 'AS365N2.png';
        } else if (model.includes('117')) {
            silhouettePath = 'BK117.png';
        } else if (model.includes('120')) {
            silhouettePath = 'EC120.png';
        } else if (model.includes('145')) {
            silhouettePath = 'EC145.png';
        } else if (model.includes('212')) {
            silhouettePath = 'B212.png';
        } else if (model.includes('412')) {
            silhouettePath = 'B412.png';
        } else if (model.includes('214')) {
            silhouettePath = 'B214B.png';
        } else if (model.includes('64E')) {
            silhouettePath = 'S64E.png';
        } else if (model.includes('61N')) {
            silhouettePath = 'S61N.png';
        } else if (model.includes('76')) {
            silhouettePath = 'S76.png';
        } else if (model.includes('47')) {
            silhouettePath = 'CH47.png';
        } else if (model.includes('UH-6') || model.includes('EH-6')) {
            silhouettePath = 'UH60.png';
        } else if (model.includes('UH') || model.includes('205') || model.includes('204')) {
            silhouettePath = 'UH1H.png';
        } else if (model.includes('K-1200')) {
            silhouettePath = 'KMAX.png';
        } else if (model.includes('206')) {
            silhouettePath = 'Bell 206.png';
        } else if (model.includes('429')) {
            silhouettePath = 'Bell 429.png';
        } else if (model.includes('500E')) {
            silhouettePath = 'MD-500E.png';
        } else if (model.includes('500')) {
            silhouettePath = 'MD-500.png';
        } else if (model.includes('520')) {
            silhouettePath = 'MD-520N.png';
        } else if (model.includes('900')) {
            silhouettePath = 'MD-900.png';
        } else if (model.includes('90')) {
            silhouettePath = 'NH90.png';
        } else {
            silhouettePath = 'RWGeneric.png';
        }
    } else if (aircraft.airframe === 'FIXED_WING') {
        if (model.includes('AT-802') || model.includes('AT-602')) {
            silhouettePath = 'AT802.png';
        } else if (model.includes('208')) {
            silhouettePath = 'C208.png';
        } else if (model.includes('182')) {
            silhouettePath = 'C182.png';
        } else if (model.includes('337')) {
            silhouettePath = 'C337.png';
        } else if (model.includes('M-18')) {
            silhouettePath = 'M18T-Hubler.png';
        } else if (model.includes('C130') ||
            model.includes('L100')) {
            silhouettePath = 'C130Q.png';
        } else if (model.includes('340B')) {
            silhouettePath = 'SAAB340.png';
        } else if (model.includes('SA227')) {
            silhouettePath = 'SA227.png';
        } else if (model.includes('690') ||
            model.includes('695')) {
            silhouettePath = 'TC690.png';
        } else if (model.includes('RJ')) {
            silhouettePath = 'RJ85.png';
        } else if (model.includes('DC')) {
            silhouettePath = 'DC10.png';
        } else if (model.includes('35') ||
            model.includes('36')) {
            silhouettePath = 'Lear35.png';
        } else if (model.includes('B200')) {
            silhouettePath = 'B200.png';
        } else if (model.includes('AT-502') || model.includes('AT-504') || model.includes('AT-402')) {
            silhouettePath = 'AT-502-504.png';
        } else if (model.includes('750')) {
            silhouettePath = 'PAC Cresco 750XL.png';
        } else if (model.includes('Cresco')) {
            silhouettePath = 'PAC Cresco.png';
        } else if (model.includes('737')) {
            silhouettePath = 'Boeing B737 v001.png';
        } else if (model.includes('87')) {
            silhouettePath = 'MD87 v001.png';
        } else if (model.includes('DHC-8-402')) {
            silhouettePath = 'Q400 v001.png';
        } else {
            silhouettePath = 'FWGeneric.png';
        }
    }
    return silhouettePath;
}


export function getStatusClass(eventType) {
    // These are the four status classes:
    // .status-dispatched
    // .status-planned-dispatch
    // .status-standby
    // .status-available
    // .status-unserviceable

    // These are the eventTypes.
    // UNKOWNN
    // AVAILABLE
    // UNAVAILABLE
    // LIMITED
    // DEPLOYED
    // PLANNED_DISPATCH
    // STANDBY
    // STANDBY_AMENDED
    // STANDBY_TEMP_ASSET
    // UNSERVICEABLE
    // UNSERVICEABLE_AIRDESK
    // UNSERVICEABLE_STOOD_DOWN
    // UNSERVICEABLE_RESTRICTED
    // UNSERVICEABLE_STANDBY

    switch (eventType) {
        case 'AVAILABLE':
        case 'LIMITED':
            return 'available';
        case 'DEPLOYED':
            return 'dispatched';
        case 'PLANNED_DISPATCH':
            return 'planned-dispatch';
        case 'STANDBY':
        case 'STANDBY_AMENDED':
        case 'STANDBY_TEMP_ASSET':
            return 'standby';
        case 'UNSERVICEABLE':
        case 'UNSERVICEABLE_AIRDESK':
        case 'UNSERVICEABLE_STOOD_DOWN':
        case 'UNSERVICEABLE_RESTRICTED':
        case 'UNSERVICEABLE_STANDBY':
            return 'unserviceable';
        default:
            return 'unknown';
    }
}

export function buildPopUpAircraftCommonContent(aircraft, includeTitle) {
    const aircraftData = {includeTitle: includeTitle};
    if (includeTitle) {
        aircraftData.title = getAssetTitle(aircraft.properties);
    }
    aircraftData.lastSeen = getAssetLastSeen(aircraft);
    aircraftData.spatialDisp = getAssetSpatialDisp(aircraft);
    aircraftData.details = getAircraftDetails(aircraft.properties);
    return require('./templates/assetCommonContent.hbs')(aircraftData);
}

export function buildPopUpEquipmentCommonContent(equipment, includeTitle) {
    const equipmentData = {includeTitle: includeTitle};
    if (includeTitle) {
        equipmentData.title = getAssetTitle(equipment);
    }
    equipmentData.lastSeen = getAssetLastSeen(equipment);
    equipmentData.spatialDisp = getAssetSpatialDisp(equipment);
    equipmentData.details = getEquipmentDetails(equipment);
    equipmentData.contactDetails = getAssetDispatchContactDetails(equipment);
    return require('./templates/assetCommonContent.hbs')(equipmentData);
}

export function getFuellingArrangmentDisplayValue(fuellingArrangement) {
    if (!fuellingArrangement) {
        return '';
    }
    switch (fuellingArrangement) {
        case 'D':
            return 'Dry Only';

        case 'BD':
            return 'Wet-B or Dry';

        case 'ABD':
            return 'Wet-A, Wet-B or Dry';

        case 'NA':
            return 'Not Applicable';

        default:
            return '';
    }
}

export function getAssetAvailabilityNotes(asset) {
    if (asset && asset.properties.notes) {
        const fullNotes = asset.properties.notes.trim();
        const notes = truncateNotes(fullNotes, 60);
        // Remove double and training newlines.
        return require('./templates/assetAvailabilityNotes.hbs')({
            truncatedNotes: notes
        });
    }
    return '';
}

export function truncateNotes(notes, maxLength) {
    // Split the notes on the headings
    const regex = new RegExp('(' + MAP_CONSTANTS.NOTES_HEADINGS + '):', 'g');
    const oneLinePerNote = notes.replace(regex, '\n$1:').trim();
    return oneLinePerNote;
}


export function safeString(string) {
    if (!string) {
        return '';
    }
    let result = string.replace(/'/g, '&#39');
    result = result.replace(/"/g, '&#34');
    return result;
}

export const getIncident = function (incidentId) {
    let incident = null;
    if (_cachedIncidentData) {
        _cachedIncidentData.features.forEach(f => {
            if (f.properties.id === incidentId) {
                incident = f;
                return false;
            }
        });
    }
    return incident;
};
export const getLocationOrder = function(asset) {
    let order = 'Z';
        if (asset.location) {
            switch (asset.event_type) {
                // POSSIBLY NEED TO ADD MORE CASES HERE
                case 'STANDBY':
                    order = 'A ' + asset.location;
                    break;
                case 'AVAILABLE':
                    order = 'B ' + asset.location;
                    break;
                default:
                    order = 'X ' + asset.location;
                    break;
            }
    }
    return order;
};
export const getStatusOrder = function(asset) {
    let order = 'Z';
    if (asset.response) {
        // zero pad the minutes for response time
        let mins = '000000000' + asset.response;
        mins = mins.slice(mins.length - 6);
        switch (asset.event_type) {
            case 'DEPLOYED': // TEMPORARY FIX AS THIS SHOULD BE 'DISPATCHED'
            case 'DISPATCHED':
                order = 'A';
                break;
            case 'STANDBY':
                order = 'B' + mins;
                break;
            case 'STANDBY_AMENDED':
                order = 'B' + mins;
                break;
            case 'AVAILABLE':
            case 'LIMITED':
                order = 'C' + mins;
                break;
            case 'UNSERVICABLE':
                order = 'E';
                break;
            case 'UNAVAILABLE':
                order = 'F';
                break;
            default:
                order = 'X';
                break;
        }
        return order;
    }
    return order;
};

