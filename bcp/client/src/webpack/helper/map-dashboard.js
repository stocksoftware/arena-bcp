import * as AMFUNC_DISP from './map-display';
import {ASSET_MODE} from '../constant';
import {timeToString} from './map-math';
import moment from 'moment-timezone';
export const getOperatorName = function (asset) {
    if (asset.operator) {
        return cleanOperatorName(asset.operator.name ?
            asset.operator.name :
            asset.operator.registeredName);
    } else {
        return '';
    }
};

export function cleanOperatorName(string) {
    if (!string) {
        return '';
    }
    let result = AMFUNC_DISP.safeString(string);
    result = result.replace(/[pP][tT][yY]/, '');
    result = result.replace(/[lL][tT][dD]/, '');
    return result.trim();
}

export function getLocationCell(asset) {
    const locations = []
    if (asset.location) {
        if (asset.temp_base) {
            locations.push({eventType: 'TOB:', location: asset.location});
            return locations;
        } else {
            switch (asset.event_type) {
                // NEED TO ADD MORE CASES HERE
                case 'STANDBY':
                case 'STANDBY_TEMP_ASSET':
                case 'STANDBY_AMENDED':
                    locations.push({eventType: 'NOB:', location: asset.location});
                    return locations;
                case 'DEPLOYED':
                    locations.push({eventType: 'NOB:', location: asset.base_location});
                    locations.push({eventType: 'STG:', location: asset.location});
                    return locations;
                default:
                    locations.push({eventType: 'AVL:', location: asset.location});
                    return locations;
            }
        }
    }
    return locations;
}

export const getStatusCell = function(asset, assetMode) {
    const props = { asset };
    if (assetMode === ASSET_MODE.AIRCRAFT) {
        props.assetLabel = 'aircraft';
    } else {
        props.assetLabel = 'equipment';
    }
    // props.currentAssetFilter = currentAssetFilter;

    if (asset.availabilityFeature) {
        props.availability = true;
        const availabilityProperties = asset.properties;
        if (availabilityProperties.event_type === 'STANDBY_AMENDED' ||
            availabilityProperties.event_type === 'STANDBY_TEMP_ASSET') {
            availabilityProperties.event_name = 'Standby';
        }
        props.eventName = availabilityProperties.event_name ?
            availabilityProperties.event_name :
            availabilityProperties.event_type;
        if (availabilityProperties.is_pdd) {
            props.eventName += ' (PDD)';
        }
        props.eventResponse = timeToString(availabilityProperties.response);
        if (availabilityProperties.event_type === 'DEPLOYED' || availabilityProperties.event_type === 'PLANNED_DISPATCH') {
            props.deployed = true;
            props.dispatchNumber = availabilityProperties.dispatch_number;
            if (availabilityProperties.event_type === 'PLANNED_DISPATCH') {
                props.dispatchTime = moment(availabilityProperties.dispatch_time).format('HH:mm DD/MM/YYYY ');
            }
            const title = AMFUNC_DISP.getAssetTitle(asset);

            if (availabilityProperties.incident_id) {
                const theIncident = findIncidentById(availabilityProperties.incident_id);
                if (theIncident) {
                    props.incidentName = theIncident.properties.name;
                } else {
                    props.incidentName = 'Incident not found';
                }
            } else {
                props.incidentName = 'No incident selected';
            }
            if ( availabilityProperties.dispatch_ctaf) {
                props.ctaf = AMFUNC_DISP.safeString(availabilityProperties.dispatch_ctaf);
            }
            const assetType = (availabilityProperties.is_equipment ?
                ASSET_MODE.EQUIPMENT :
                ASSET_MODE.AIRCRAFT);
            const popupContent = AMFUNC_DISP.getIncident(asset, assetType, _incidentData);

            props.popup = require('./templates/popup.hbs')({ position: 'left', title: title, content: popupContent });
            props.editUrl =
                CONFIG.arenaRegisterRedirectURL + '&requestType=viewDispatch&dispatchId=' + availabilityProperties.dispatch_id;
            props.overwrittenResponseTime =
                availabilityProperties.response && availabilityProperties.standby_response &&
                availabilityProperties.standby_response !== availabilityProperties.response;
            props.standbyResponse = availabilityProperties.standby_response;
        }
    }
    return require('./templates/statusCell.hbs')(props);
};
