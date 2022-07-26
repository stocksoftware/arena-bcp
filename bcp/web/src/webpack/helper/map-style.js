import * as L from 'leaflet';
import 'leaflet-extra-markers';
import {MAP_CONSTANTS} from '../constant';
import * as AMFUNC_MATH from './map-math';
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
    return ` <i style='color: ${iconColour}' class='${(dispatchCount && 'dispatched') + ' fa fa-var-fire ' + iconClass}' data-content='${dispatchCount}'> </i> <svg width='33' height='44' viewBox='0 0 35 45' xmlns='http://www.w3.org/2000/svg'> <path d='M1.872 17.35L9.679 2.993h15.615L33.1 17.35 17.486 44.992z' fill='${fillColour}' style='border: 10px'/> <g opacity='${borderOpacity}' transform='matrix(1.0769 0 0 -1.0769 -272.731 48.23)'> <path d='M276.75 42h-14.5L255 28.668 269.5 3 284 28.668zm-.595-1l6.701-12.323L269.5 5.033l-13.356 23.644L262.845 41z' stroke='${borderColour}' stroke-width='${borderWidth}'/> </g> </svg>`;

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
const includePopupKey = function (key) {
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
const formatPopupKey = function (key) {
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