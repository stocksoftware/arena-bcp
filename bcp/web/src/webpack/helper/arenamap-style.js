import buildIncidentIcon from "./buildIncidentIcon";
import {MAP_CONSTANTS} from "../constant";
import 'leaflet-extra-markers';
import * as AMFUNC_MATH from './arenamap-math';
import $ from 'jquery';
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
        $.each(feature.properties, function(key, value) {
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