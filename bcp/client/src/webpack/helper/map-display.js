const FEET_PER_M = 3.281;
import moment from 'moment-timezone';
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
        return require('./templates/lastSeenDetails.hbs')({ details: lastSeen });
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
        const details = { showContact: false };
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
function safeString(string) {
    if (!string) {
        return '';
    }
    let result = string.replace(/'/g, '&#39');
    result = result.replace(/"/g, '&#34');
    return result;
}
export function mToFeet(m) {
    return m * FEET_PER_M;
}