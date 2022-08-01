export const getAssetCell = function(asset) {
    const currentAssetFilter = AM_FILTER.getCurrentAssetTypeFilterValue();
    let cell = '';
    if (currentAssetFilter === AM_FILTER.getAssetTypes().AIRCRAFT) {
        cell = getAircraftCell(asset);
    } else if (currentAssetFilter === AM_FILTER.getAssetTypes().EQUIPMENT) {
        cell = getEquipmentCell(asset);
    }
    return cell;
};