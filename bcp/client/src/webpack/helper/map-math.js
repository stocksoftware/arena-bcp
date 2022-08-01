export const COORD_LON = 0;
export const COORD_LAT = 1;
export function ddm(dd, precision) {
    var deg = parseInt(dd);
    var dec = Math.abs(dd - deg);
    var mins = (dec * 60.0).toFixed(precision || 3);
    var pad = mins < 10 ? '0' : '';
    return '' + deg + ', ' + pad + mins;
}


