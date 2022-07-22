import React from 'react';
import * as L from 'leaflet';
import 'leaflet-extra-markers';
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

export default buildIncidentIcon;