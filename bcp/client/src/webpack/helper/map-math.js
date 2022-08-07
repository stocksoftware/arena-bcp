export const COORD_LON = 0;
export const COORD_LAT = 1;

export function ddm(dd, precision) {
    var deg = parseInt(dd);
    var dec = Math.abs(dd - deg);
    var mins = (dec * 60.0).toFixed(precision || 3);
    var pad = mins < 10 ? '0' : '';
    return '' + deg + ', ' + pad + mins;
}

const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_HOUR = 60;

// Returns the passed number of minutes in 1d 2h 30m format.
export function timeToString(timeParam) {
    if (timeParam === null) {
        return '';
    }

    let time;
    if (typeof timeParam === 'string') {
        if (!timeParam.match(/^[0-9]*$/)) {
            return timeParam;
        }
        time = parseFloat(timeParam).toFixed(0);
    } else {
        time = timeParam.toFixed(0);
    }

    time = parseInt(time);

    const day = Math.floor(time / MINUTES_PER_DAY).toFixed(0);
    const hour = Math.floor((time % (MINUTES_PER_DAY)) / MINUTES_PER_HOUR).toFixed(0);
    const minute = Math.floor((time % (MINUTES_PER_DAY)) % MINUTES_PER_HOUR).toFixed(0);

    let responseTime = '';
    if (day > 0) {
        responseTime += day + 'd ';
    }
    if (hour > 0 || (day > 0 && minute > 0)) {
        responseTime += hour + 'h ';
    }
    if (minute > 0) {
        if (minute < 10) {
            responseTime += '0';
        }
        responseTime += minute + 'm';
    }
    return responseTime;
}

export const filterAssets = (assets, filterText) => {
    let filterResult = [];
    let pushed = false;
    if (!filterText) {
        return assets;
    } else {
        for (let i = 0; i < assets.length; i++) {
            pushed = true;
            Object.values(assets[i]).forEach(value => {
                if (value && (typeof value === 'string' || typeof value === 'number')) {
                    value = value.toString().toUpperCase();
                    if (value && value.includes(filterText.toUpperCase())) {
                        if (pushed) {
                            filterResult.push(assets[i]);
                            pushed = false;
                        }
                    }
                }
            });
        }
        return filterResult;
    }
};


