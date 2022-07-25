import $ from 'jquery';

export const generateGeoJSON = async (fileName) => {
    const data= await $.getJSON(`/${fileName}.json`);
    const {currentLocations} = await $.getJSON('./currentLocations.json');
    const geoData = {
        type: 'FeatureCollection',
        features: []
    };
   currentLocations.forEach(location=>{
       if(location.imei){
           const arenaAsset = Object.values(data)[0].find(element=>element.imei === location.imei);
           if(arenaAsset){
               // arena asset
               let properties = {};
               if(fileName==='aircraft'){
                   properties={
                       airframe: value.airframe
                   }
               }
               geoData.features.push(
                   {
                       type: "Feature",
                       geometry: {
                           type: "Point",
                           coordinates: [
                               location.longitude,
                               location.latitude
                           ]
                       },
                       properties: {
                           ...location,
                           ...properties,
                           imeiMatch: arenaAsset.imei,
                           searchText: createSearchText(arenaAsset),
                           callsign: arenaAsset.callsign,
                           registration: arenaAsset.registration,
                           operator: arenaAsset.operator.name
                       }
                   }
               );

           }else{
               let properties = {};

               geoData.features.push(
                   {
                       type: "Feature",
                       geometry: {
                           type: "Point",
                           coordinates: [
                               location.longitude,
                               location.latitude
                           ]
                       },
                       properties: {
                           ...location,
                           ...properties,
                           imeiMatch: false,
                           searchText: createSearchText(location),
                       }
                   }
               );

           }
       }
   })

    return geoData;
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
function toShortCallsign(callsign) {
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