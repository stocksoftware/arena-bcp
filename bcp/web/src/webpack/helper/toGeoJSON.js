import $ from 'jquery';

export const generateEquipmentGeoJSON = async () => {
    const {equipment} = await $.getJSON('/equipment.json');
    const {currentLocations} = await $.getJSON('./currentLocations.json');
    const equipmentGeodata = {
        type: 'FeatureCollection',
        features: []
    };
    console.log(equipment.length, currentLocations.length);
    equipment.forEach((eq) => {
        const matchedResult = currentLocations.find(location => location.imei === eq.imei);
        if (matchedResult) {
         equipmentGeodata.features.push(
             {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [
                        matchedResult.longitude,
                        matchedResult.latitude
                    ]
                },
                properties: {
                    ...matchedResult,
                    searchText: createSearchText(eq),
                    callsign: eq.callsign,
                    registration: eq.registration,
                    operator: eq.operator.name
                }
            }
         );
        }
    });
    return equipmentGeodata;
};

const createSearchText = function (asset) {
    const callsign = asset.callsign ? toShortCallsign(asset.callsign) + ' ' : '';
    const rego = asset.registration ? asset.registration + ' ' : '';
    const operator = asset.operator && asset.operator.name ?
        cleanOperatorName(asset.operator.name) :
        asset.operator && asset.operator.registeredName ?
            cleanOperatorName(asset.operator.registeredName) :
            '';
    return callsign + rego + operator;
};
function cleanOperatorName(string) {
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