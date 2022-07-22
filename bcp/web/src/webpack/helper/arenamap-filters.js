/* jslint browser: true */
/* jslint bitwise: true */
/* jslint white: true */
/* jslint this: true */

import $ from 'jquery';
import _ from 'lodash';

const STATUS_ALL = 'ALL';
const STATUS_AVAIL_STB = 'AVAIL_STB';
const STATUS_STANDBY = 'STANDBY';
const STATUS_STANDBY_AMENDED = 'STANDBY_AMENDED';
const STATUS_STANDBY_TEMP_ASSET = 'STANDBY_TEMP_ASSET';
const STATUS_AVAILABLE = 'AVAILABLE';
const STATUS_AVAILABLE_LIMITED = 'LIMITED';
const STATUS_DISPATCHED = 'DEPLOYED';
const STATUS_PLANNED_DISPATCH = 'PLANNED_DISPATCH';
const STATUS_UNSERVICEABLE = 'UNSERVICEABLE';
const FUELLING_ARRANGEMENT_WET_A_ONLY = 'WET_A_ONLY';
const FUELLING_ARRANGEMENT_WET_A_OR_B = 'WET_A_OR_B';

export const ASSET_TYPE = {
    AIRCRAFT: 'AIRCRAFT',
    EQUIPMENT: 'EQUIPMENT'
};

let currentFilter = {
    approvedBy: {},
    engagedBy: {},
    status: {},
    aircraftOfferedServiceRole: {},
    aircraftApprovedServiceRole: {},
    equipmentOfferedServiceRole: {},
    equipmentApprovedServiceRole: {},
    assetTypeFilter: {},
    airframe: {},
    category: {},
    aircraft_capability1: {},
    aircraft_capability2: {},
    equipment_capability1: {},
    equipment_capability2: {},
    fuellingArrangement: {},
    passengers: {},
    bombingType: {},
    suppressantType: {}
};

let _jurisdiction;

/**************************************************************************************
 *
 * PRIVATE METHODS
 */

const isBlank = function(filter) {
    return !filter || filter.trim().length === 0;
};

const getStatusChecked = function(status, hasServicePeriod, hasDispatch) {
    let statusCheck = status;
    if (status === STATUS_PLANNED_DISPATCH) {
        statusCheck = STATUS_DISPATCHED;
    } else if (status === STATUS_UNSERVICEABLE && hasDispatch) {
        statusCheck = STATUS_DISPATCHED;
    } else if (status === STATUS_STANDBY_AMENDED || status === STATUS_STANDBY_TEMP_ASSET ||
        (status === STATUS_UNSERVICEABLE && hasServicePeriod)) {
        statusCheck = STATUS_STANDBY;
    } else if (status === STATUS_AVAILABLE_LIMITED) {
        statusCheck = STATUS_AVAILABLE;
    }
    return statusCheck;
};

const getDropDown = function(selector, items, optgroup) {
    const dropdown = $(selector);
    let elem;
    if (optgroup) {
        elem = dropdown.find('#' + optgroup);
    } else {
        elem = dropdown;
    }
    elem.empty();
    dropdown.trigger('chosen:updated');
    elem.append($('<option selected>', { value: '', text: '' }));
    $.each(items, (index, value) => elem.append($('<option>', { value: _.isArray(items) ? value : index, text: value })));
    dropdown.trigger('chosen:updated');
};

const getOfferedServiceRoles = function(assetList) {
    let list = _.map(_.uniqBy(_.flattenDeep(_.map(assetList, 'serviceRoles')), 'name'), 'name');
    list = _.sortBy(list, [o => { return o; }]);
    return _.keyBy(list, o => { return o; });
};

const getApprovedServiceRoles = function(assetList) {
    let list = _.filter(_.flattenDeep(_.map(assetList, 'serviceRoles')),
        function(o) { return o.approvedBy && o.approvedBy.length > 0; });
    list = _.map(_.uniqBy(_.flattenDeep(list), 'name'), 'name');
    list = _.sortBy(list, [o => { return o; }]);
    return _.keyBy(list, o => { return o; });
};

const getCapabilities = function(assetIdMap) {
    let capabilities = [];
    $.each(assetIdMap, (id, asset) => {
        if (asset.capabilities) {
            capabilities =
                capabilities.concat(asset.capabilities.filter(capability => capabilities.indexOf(capability) === -1));
        }
    });
    return capabilities;
};

const getAgencies = function(assets) {
    return _.uniqBy(_.map(_.flatMap(_.map(assets, 'approvedByAgencies')), 'name'));
};

const filterStatusApprovalAndEngagement = function(status,
                                                   approvalCandidates,
                                                   statusJurisdiction,
                                                   hasServicePeriod,
                                                   hasDispatch) {
    const statusCheck = getStatusChecked(status, hasServicePeriod, hasDispatch);
    const filterApprovedBy = currentFilter.approvedBy.value;
    const passedApprovedBy = isBlank(filterApprovedBy) ||
        undefined !== (_.find(approvalCandidates, { name: filterApprovedBy }));
    const filterEngagedBy = currentFilter.engagedBy.value;
    const isEngaged = (statusCheck === STATUS_DISPATCHED || statusCheck === STATUS_STANDBY);
    const passedEngagedBy = isBlank(filterEngagedBy) ||
        (filterEngagedBy === statusJurisdiction && isEngaged) ||
        (filterEngagedBy === 'ANY' && isEngaged);

    const filterStatus = currentFilter.status.value;
    let passedStatus = false;

    if (isBlank(filterStatus)) {
        passedStatus = true;
    } else if (isBlank(status)) {
        passedStatus = false;
    } else if (filterStatus === STATUS_ALL) {
        passedStatus = (passedApprovedBy && statusCheck === STATUS_AVAILABLE) ||
            (passedEngagedBy && statusCheck === STATUS_STANDBY) ||
            (passedEngagedBy && statusCheck === STATUS_DISPATCHED);
    } else if (filterStatus === STATUS_AVAIL_STB) {
        passedStatus = (passedApprovedBy && statusCheck === STATUS_AVAILABLE) ||
            (passedEngagedBy && statusCheck === STATUS_STANDBY);
    } else {
        passedStatus = (filterStatus === statusCheck);
    }

    if (filterStatus === STATUS_ALL || filterStatus === STATUS_AVAIL_STB) {
        return passedStatus;
    } else {
        return passedApprovedBy && passedEngagedBy && passedStatus;
    }
};

const filterAircraftOfferedServiceRoles = function(serviceRoles) {
    const filter = currentFilter.aircraftOfferedServiceRole.value;
    return isBlank(filter) || undefined !== (_.find(serviceRoles, { name: filter }));
};

const filterAircraftApprovedServiceRoles = function(serviceRoles,
                                                    status,
                                                    statusJurisdiction,
                                                    hasServicePeriod,
                                                    hasDispatch) {
    const filter = currentFilter.aircraftApprovedServiceRole.value;
    const filterApprovedBy = currentFilter.approvedBy.value;
    const filterEngagedBy = currentFilter.engagedBy.value;
    return isBlank(filter) ||
        undefined !==
        _.find(serviceRoles,
            function(o) {
                if (o.name === filter && o.approvedBy && o.approvedBy.length > 0) {
                    if (!isBlank(filterApprovedBy)) {
                        return undefined !== (_.find(o.approvedBy, { name: filterApprovedBy })) ||
                            undefined !== (_.find(o.approvedBy, { jurisdiction: filterApprovedBy }));
                    } else if (!isBlank(filterEngagedBy)) {
                        const statusCheck = getStatusChecked(status, hasServicePeriod, hasDispatch);
                        const isEngaged = (statusCheck === STATUS_DISPATCHED || statusCheck === STATUS_STANDBY);
                        return (filterEngagedBy === statusJurisdiction && isEngaged) ||
                            (filterEngagedBy === 'ANY' && isEngaged);
                    }
                    return true;
                }
                return false;
            });
};

const filterEquipmentOfferedServiceRoles = function(serviceRoles) {
    const filter = currentFilter.equipmentOfferedServiceRole.value;
    return isBlank(filter) || undefined !== (_.find(serviceRoles, { name: filter }));
};

const filterEquipmentApprovedServiceRoles = function(serviceRoles,
                                                     status,
                                                     statusJurisdiction,
                                                     hasServicePeriod,
                                                     hasDispatch) {
    const filter = currentFilter.equipmentApprovedServiceRole.value;
    const filterApprovedBy = currentFilter.approvedBy.value;
    const filterEngagedBy = currentFilter.engagedBy.value;
    return isBlank(filter) ||
        undefined !==
        _.find(serviceRoles,
            function(o) {
                if (o.name === filter && o.approvedBy && o.approvedBy.length > 0) {
                    if (!isBlank(filterApprovedBy)) {
                        return undefined !== (_.find(o.approvedBy, { name: filterApprovedBy })) ||
                            undefined !== (_.find(o.approvedBy, { jurisdiction: filterApprovedBy }));
                    } else if (!isBlank(filterEngagedBy)) {
                        const statusCheck = getStatusChecked(status, hasServicePeriod, hasDispatch);
                        const isEngaged = (statusCheck === STATUS_DISPATCHED || statusCheck === STATUS_STANDBY);
                        return (filterEngagedBy === statusJurisdiction && isEngaged) ||
                            (filterEngagedBy === 'ANY' && isEngaged);
                    }
                    return true;
                }
                return false;
            });
};

const filterAssetType = function(assetType) {
    const filter = currentFilter.assetTypeFilter.value;
    return isBlank(filter) || (filter === assetType);
};

const filterAirframe = function(airframe) {
    const filter = currentFilter.airframe.value;
    return isBlank(filter) || (filter === airframe);
};

const filterCategory = function(category) {
    const filter = currentFilter.category.value;
    return isBlank(filter) || (filter === category);
};

const filterCapability = function(asset, filter) {
    return isBlank(filter) || (asset.capabilities && asset.capabilities.indexOf(filter) !== -1);
};

const filterFuellingArrangement = function(fuellingArrangement) {
    const filter = currentFilter.fuellingArrangement.value;
    if (isBlank(filter)) {
        return true;
    } else if (filter === FUELLING_ARRANGEMENT_WET_A_ONLY) {
        return fuellingArrangement === 'ABD';
    } else if (filter === FUELLING_ARRANGEMENT_WET_A_OR_B) {
        return fuellingArrangement === 'ABD' || fuellingArrangement === 'BD';
    }
};

const filterPassengers = function(passengers) {
    const filter = currentFilter.passengers.value;
    return isBlank(filter) || (parseInt(filter) <= parseInt(passengers));
};

const filterFirebombingType = function(fireBombingType) {
    const filter = currentFilter.bombingType.value;
    return isBlank(filter) || (filter.toLowerCase() === fireBombingType.toLowerCase());
};

const filterSuppresantType = function(suppressant) {
    const filter = currentFilter.suppressantType.value;
    return isBlank(filter) ||
        ((undefined !== _.find(suppressant, ['FOAM', 'true'])) && (filter === 'FOAM')) ||
        ((undefined !== _.find(suppressant, ['GEL', 'true'])) && (filter === 'GEL'));
};

const labelFor = function(filterId) {
    return $('label[for=\'' + filterId + '\']').html();
};

const populateFilter = function(filter, filterId) {
    const f = $('[id="' + filterId + '"]');
    filter.value = f.val();
    filter.text = f[0][f[0].selectedIndex].textContent;
};

const setModalField = function(filterId, filter) {
    const f = $('[id="' + filterId + '"]');
    f.val(filter.value);
    f.trigger('chosen:updated');
};

const updateJurisdiction = function(linkId, jurisdiction) {
    const link = $('[id="' + linkId + '"]');
    const linkHtml = link.html();
    link.html(linkHtml.replace(/Jurisdiction/, jurisdiction));
};

/**************************************************************************************
 *
 * PUBLIC METHODS
 */

export function initialise(jurisdiction, disableFiltering) {
    _jurisdiction = jurisdiction;
    currentFilter.assetTypeFilter = { label: '', value: ASSET_TYPE.AIRCRAFT, text: ASSET_TYPE.AIRCRAFT };
    if (!disableFiltering) {
        updateJurisdiction('filterJurisdicitonStandby', jurisdiction);
        updateJurisdiction('filterJurisdicitonCwn', jurisdiction);
        updateJurisdiction('filterJurisdicitonAvailStb', jurisdiction);
        updateJurisdiction('filterJurisdicitonAllAvails', jurisdiction);
        currentFilter.approvedBy = { label: labelFor('filter-approval'), value: '', text: '' };
        currentFilter.engagedBy = { label: labelFor('filter-engagementJurisdiction'), value: '', text: '' };
        currentFilter.status = { label: labelFor('filter-status'), value: '', text: '' };
        currentFilter.aircraftOfferedServiceRole = { label: labelFor('filter-aircraft-offered-role'), value: '', text: '' };
        currentFilter.aircraftApprovedServiceRole =
            { label: labelFor('filter-aircraft-approved-role'), value: '', text: '' };
        currentFilter.equipmentOfferedServiceRole =
            { label: labelFor('filter-equipment-offered-role'), value: '', text: '' };
        currentFilter.equipmentApprovedServiceRole =
            { label: labelFor('filter-equipment-approved-role'), value: '', text: '' };
        currentFilter.airframe = { label: labelFor('filter-airframe'), value: '', text: '' };
        currentFilter.category = { label: labelFor('filter-aircraft-category'), value: '', text: '' };
        currentFilter.aircraft_capability1 = { label: labelFor('filter-aircraft-capability1'), value: '', text: '' };
        currentFilter.aircraft_capability2 = { label: labelFor('filter-aircraft-capability2'), value: '', text: '' };
        currentFilter.fuellingArrangement = { label: labelFor('filter-fuelling-arrangement'), value: '', text: '' };
        currentFilter.passengers = { label: labelFor('filter-passengers'), value: '', text: '' };
        currentFilter.bombingType = { label: labelFor('filter-firebombing-type'), value: '', text: '' };
        currentFilter.suppressantType = { label: labelFor('filter-suppressant'), value: '', text: '' };
        currentFilter.equipment_capability1 = { label: labelFor('filter-equipment-capability1'), value: '', text: '' };
        currentFilter.equipment_capability2 = { label: labelFor('filter-equipment-capability2'), value: '', text: '' };
    }
}

export function addAircraftFilterData(aircraftList) {
    getDropDown('#filter-aircraft-offered-role', getOfferedServiceRoles(aircraftList));
    getDropDown('#filter-aircraft-approved-role', getApprovedServiceRoles(aircraftList));
    getDropDown('#filter-aircraft-category', ASSET_UTIL.getAircraftCategories());
    getDropDown('#filter-approval', getAgencies(aircraftList), 'filter-agency-group');
    const capabilities = getCapabilities(aircraftList);
    getDropDown('#filter-aircraft-capability1', capabilities);
    getDropDown('#filter-aircraft-capability2', capabilities);
}

export function addEquipmentFilterData(equipmentList) {
    getDropDown('#filter-equipment-offered-role', getOfferedServiceRoles(equipmentList));
    getDropDown('#filter-equipment-approved-role', getApprovedServiceRoles(equipmentList));
    const capabilities = getCapabilities(equipmentList);
    getDropDown('#filter-equipment-capability1', capabilities);
    getDropDown('#filter-equipment-capability2', capabilities);
}

// Returns true if the aircraft passes the filters
export function isAircraftInteresting(aircraft) {
    const approvalCandidates = _.union(aircraft.jurisdictions, aircraft.approvedByAgencies);
    const hasAvailabilityFeature = !AMFUNC_UTIL.isUndefinedOrNull(aircraft.availabilityFeature);
    const availabilityFeature = aircraft.availabilityFeature;
    const hasAvailabilityProperties = hasAvailabilityFeature &&
        !AMFUNC_UTIL.isUndefinedOrNull(availabilityFeature.properties);
    const availabilityProperties = hasAvailabilityProperties && availabilityFeature.properties;
    const hasServicePeriod = hasAvailabilityProperties &&
        !AMFUNC_UTIL.isUndefinedOrNull(availabilityProperties.service_period_id);
    const hasDispatch = hasAvailabilityProperties &&
        !AMFUNC_UTIL.isUndefinedOrNull(availabilityProperties.dispatch_id);

    const findApprEngStatus = filterStatusApprovalAndEngagement(aircraft.status,
        approvalCandidates,
        aircraft.statusJurisdiction,
        hasServicePeriod,
        hasDispatch);
    const serviceRoles = aircraft.serviceRoles && aircraft.serviceRoles.length > 0 ? aircraft.serviceRoles : [];
    const findOfferServiceRoles = filterAircraftOfferedServiceRoles(serviceRoles);
    const findApprovedServiceRoles = filterAircraftApprovedServiceRoles(serviceRoles,
        aircraft.statusJurisdiction,
        hasServicePeriod,
        hasDispatch);
    const findAirframe = filterAirframe(aircraft.airframe);
    const findAssetType = filterAssetType(ASSET_TYPE.AIRCRAFT);
    const findCategory = filterCategory(aircraft.category);
    const findCapability1 = filterCapability(aircraft, currentFilter.aircraft_capability1.value);
    const findCapability2 = filterCapability(aircraft, currentFilter.aircraft_capability2.value);
    const findFuellingArrangement = hasAvailabilityProperties && availabilityProperties.fuelling_arrangement ?
        filterFuellingArrangement(availabilityProperties.fuelling_arrangement) :
        filterFuellingArrangement('');
    const findPassengers = filterPassengers(aircraft.seats);
    const findFirebombingType = aircraft.firebombingType ?
        filterFirebombingType(aircraft.firebombingType) :
        filterFirebombingType('');

    const suppresants = [{ FOAM: aircraft.hasFoamSuppresant }, { GEL: aircraft.hasGelSuppresant }];
    const findSuppresantType = filterSuppresantType(suppresants);

    return !!(findApprEngStatus &&
        findApprovedServiceRoles &&
        findOfferServiceRoles &&
        findAssetType &&
        findAirframe &&
        findCategory &&
        findCapability1 &&
        findCapability2 &&
        findFuellingArrangement &&
        findPassengers &&
        findFirebombingType &&
        findSuppresantType);
}

// Returns true if the equipment passes the filters
export function isEquipmentInteresting(equipment) {
    const approvalCandidates = _.union(equipment.jurisdictions, equipment.approvedByAgencies);
    const hasAvailabilityFeature = !AMFUNC_UTIL.isUndefinedOrNull(equipment.availabilityFeature);
    const availabilityFeature = equipment.availabilityFeature;
    const hasAvailabilityProperties = hasAvailabilityFeature &&
        !AMFUNC_UTIL.isUndefinedOrNull(availabilityFeature.properties);
    const availabilityProperties = hasAvailabilityProperties && availabilityFeature.properties;
    const hasServicePeriod = hasAvailabilityProperties &&
        !AMFUNC_UTIL.isUndefinedOrNull(availabilityProperties.service_period_id);
    const hasDispatch = hasAvailabilityProperties &&
        !AMFUNC_UTIL.isUndefinedOrNull(availabilityProperties.dispatch_id);
    const findApprEngStatus = filterStatusApprovalAndEngagement(equipment.status,
        approvalCandidates,
        equipment.statusJurisdiction,
        hasServicePeriod,
        hasDispatch);
    const findAssetType = filterAssetType(ASSET_TYPE.EQUIPMENT);
    const serviceRoles = equipment.serviceRoles.length > 0 ? equipment.serviceRoles : [];
    const findApprovedServiceRoles = filterEquipmentApprovedServiceRoles(serviceRoles,
        equipment.statusJurisdiction,
        hasServicePeriod,
        hasDispatch);
    const findOfferServiceRoles = filterEquipmentOfferedServiceRoles(serviceRoles);
    const findCapability1 = filterCapability(equipment, currentFilter.equipment_capability1.value);
    const findCapability2 = filterCapability(equipment, currentFilter.equipment_capability2.value);
    return !!(findApprEngStatus &&
        findApprovedServiceRoles &&
        findOfferServiceRoles &&
        findAssetType &&
        findCapability1 &&
        findCapability2);
}

export function populateDataFromModal() {
    populateFilter(currentFilter.approvedBy, 'filter-approval');
    populateFilter(currentFilter.engagedBy, 'filter-engagementJurisdiction');
    populateFilter(currentFilter.status, 'filter-status');
    populateFilter(currentFilter.aircraftOfferedServiceRole, 'filter-aircraft-offered-role');
    populateFilter(currentFilter.aircraftApprovedServiceRole, 'filter-aircraft-approved-role');
    populateFilter(currentFilter.equipmentOfferedServiceRole, 'filter-equipment-offered-role');
    populateFilter(currentFilter.equipmentApprovedServiceRole, 'filter-equipment-approved-role');
    populateFilter(currentFilter.airframe, 'filter-airframe');
    populateFilter(currentFilter.category, 'filter-aircraft-category');
    populateFilter(currentFilter.aircraft_capability1, 'filter-aircraft-capability1');
    populateFilter(currentFilter.aircraft_capability2, 'filter-aircraft-capability2');
    populateFilter(currentFilter.equipment_capability1, 'filter-equipment-capability1');
    populateFilter(currentFilter.equipment_capability2, 'filter-equipment-capability2');
    populateFilter(currentFilter.fuellingArrangement, 'filter-fuelling-arrangement');
    populateFilter(currentFilter.passengers, 'filter-passengers');
    populateFilter(currentFilter.bombingType, 'filter-firebombing-type');
    populateFilter(currentFilter.suppressantType, 'filter-suppressant');

    // We have special handling for Status = "Available / Standby / Dispatched" and "Available / Standby"
    // We force the both the approved and engaged to be populated if either is populated
    if (currentFilter.status.value === STATUS_ALL || currentFilter.status.value === STATUS_AVAIL_STB) {
        if (isBlank(currentFilter.approvedBy.value)) {
            currentFilter.approvedBy.value = currentFilter.engagedBy.value;
            currentFilter.approvedBy.text = currentFilter.engagedBy.text;
        } else if (isBlank(currentFilter.engagedBy.value)) {
            currentFilter.engagedBy.value = currentFilter.approvedBy.value;
            currentFilter.engagedBy.text = currentFilter.approvedBy.text;
        }
    }
}

export function populateModalFromData() {
    setModalField('filter-approval', currentFilter.approvedBy);
    setModalField('filter-engagementJurisdiction', currentFilter.engagedBy);
    setModalField('filter-status', currentFilter.status);
    setModalField('filter-aircraft-offered-role', currentFilter.aircraftOfferedServiceRole);
    setModalField('filter-aircraft-approved-role', currentFilter.aircraftApprovedServiceRole);
    setModalField('filter-equipment-offered-role', currentFilter.equipmentOfferedServiceRole);
    setModalField('filter-equipment-approved-role', currentFilter.equipmentApprovedServiceRole);
    setModalField('filter-airframe', currentFilter.airframe);
    setModalField('filter-aircraft-category', currentFilter.category);
    setModalField('filter-aircraft-capability1', currentFilter.aircraft_capability1);
    setModalField('filter-aircraft-capability2', currentFilter.aircraft_capability2);
    setModalField('filter-equipment-capability1', currentFilter.equipment_capability1);
    setModalField('filter-equipment-capability2', currentFilter.equipment_capability2);
    setModalField('filter-fuelling-arrangement', currentFilter.fuellingArrangement);
    setModalField('filter-passengers', currentFilter.passengers);
    setModalField('filter-firebombing-type', currentFilter.bombingType);
    setModalField('filter-suppressant', currentFilter.suppressantType);
}

export function clearFilters() {
    _.forOwn(currentFilter, function(value, key) {
        if (key !== 'assetTypeFilter') {
            currentFilter[key].value = '';
            currentFilter[key].text = '';
        }
    });
}

export function clearAssetFilter() {
    this.setAssetFilterAircraft();
}

export function setEvidenceFilters(evidenceFilter) {
    this.clearFilters();
    this.clearAssetFilter();
    currentFilter = evidenceFilter;
    this.refreshFilterText();
}

export function setAssetFilterEquipment() {
    currentFilter.assetTypeFilter.value = ASSET_TYPE.EQUIPMENT;
    currentFilter.assetTypeFilter.text = ASSET_TYPE.EQUIPMENT;
}

export function setAssetFilterAircraft() {
    currentFilter.assetTypeFilter.value = ASSET_TYPE.AIRCRAFT;
    currentFilter.assetTypeFilter.text = ASSET_TYPE.AIRCRAFT;
}

function setJurisdictionFilter(filterField, jurisdiction) {
    filterField.value = jurisdiction;
    filterField.text = jurisdiction === 'NSW' ? 'NSW/ACT' : jurisdiction;
}

export function setFiltersJurisdictionStandby() {
    clearFilters();
    setJurisdictionFilter(currentFilter.engagedBy, _jurisdiction);
}

export function setFiltersJurisdictionCwn() {
    clearFilters();
    setJurisdictionFilter(currentFilter.approvedBy, _jurisdiction);
    currentFilter.status.value = STATUS_AVAILABLE;
    currentFilter.status.text = 'Available';
}

export function setFiltersJurisdictionAvailAndStandby() {
    clearFilters();
    setJurisdictionFilter(currentFilter.engagedBy, _jurisdiction);
    setJurisdictionFilter(currentFilter.approvedBy, _jurisdiction);
    currentFilter.status.value = STATUS_AVAIL_STB;
    currentFilter.status.text = 'Available / Standby';
}

export function setFiltersJurisdictionAllAvails() {
    clearFilters();
    setJurisdictionFilter(currentFilter.engagedBy, _jurisdiction);
    setJurisdictionFilter(currentFilter.approvedBy, _jurisdiction);
    currentFilter.status.value = STATUS_ALL;
    currentFilter.status.text = 'Available / Standby / Dispatched';
}

export function setFiltersAllStandby() {
    clearFilters();
    setJurisdictionFilter(currentFilter.engagedBy, 'ANY');
}

export function setFiltersAllCwn() {
    clearFilters();
    currentFilter.status.value = STATUS_AVAILABLE;
    currentFilter.status.text = 'Available';
}

export function setDispatchRequestFilters(jurisdiction, serviceRole, category, firebombingType, suppressantType) {
    clearFilters();
    setJurisdictionFilter(currentFilter.approvedBy, jurisdiction);
    currentFilter.aircraftOfferedServiceRole.text = serviceRole;
    currentFilter.aircraftOfferedServiceRole.value = serviceRole;
    const categoryStr = ASSET_UTIL.getAircraftCategory(category);
    currentFilter.category.value = category;
    currentFilter.category.text = categoryStr;
    const formattedFirebombingType = isBlank(firebombingType) ? undefined : firebombingType.toUpperCase();
    currentFilter.bombingType.text = formattedFirebombingType;
    currentFilter.bombingType.value = formattedFirebombingType;
    const formattedSuppressantType = isBlank(suppressantType) ? undefined : suppressantType.toUpperCase();
    currentFilter.suppressantType.text = formattedSuppressantType;
    currentFilter.suppressantType.value = formattedSuppressantType;
}

export function refreshFilterText() {
    const filterCriteriaSpan = $('.filter-criteria');
    const toolTip = $('.tool-tip');
    let criterias = '';
    _.forOwn(currentFilter, function(filter) {
        if (!isBlank(filter.value) && !isBlank(filter.label)) {
            criterias += filter.label + ' = ' + filter.text + ', ';
        }
    });

    const filterText = $('#airdeskTable_filter').find('input[type="Search"]').val();

    if (_.endsWith(criterias, ', ')) {
        criterias = criterias.substr(0, criterias.length - 2);
    }

    filterCriteriaSpan.html(criterias);
    toolTip.html(criterias);
    if (filterText) {
        const filterTextComma = criterias ? ', ' : '';
        const filterTextSpan = $('<span class=\'filter-text-contains\'/>');
        filterTextSpan.text(filterTextComma + 'Text contains \'' + filterText + '\'');
        filterCriteriaSpan.append(filterTextSpan);
    }

    $('#filter-dropdown').toggleClass('filtering', !filterCriteriaSpan.is(':empty'));
}

export function getCurrentFilter() {
    return currentFilter;
}

export function setCurrentFilter(filter) {
    currentFilter = { ...currentFilter, ...filter };
}

export function getCurrentAssetTypeFilterValue() {
    return currentFilter.assetTypeFilter.value;
}

export function getAssetTypes() {
    return ASSET_TYPE;
}

export function setAircraftAssetFilter() {
    $('#assetDropdownLabel').html(getAssetTypes().AIRCRAFT);
    setAssetFilterAircraft();
    refreshFilters();
    AM_MULTIDISPATCH.cancelDispatching();
    AM_MULTIRELEASE.cancelReleasing();
    $('.place-holder-button').text('Choose Aircraft');
    $('.equipment-filter').hide();
    $('.aircraft-filter').show();
}

export function setEquipmentAssetFilter() {
    $('#assetDropdownLabel').html(getAssetTypes().EQUIPMENT);
    setAssetFilterEquipment();
    refreshFilters();
    AM_MULTIDISPATCH.cancelDispatching();
    AM_MULTIRELEASE.cancelReleasing();
    $('.place-holder-button').text('Choose Equipment');
    $('.aircraft-filter').hide();
    $('.equipment-filter').show();
}

export function refreshFilters() {
    AM_MAP.refreshFilter();
    AM_MAP.refreshSearch();
    AM_DASHBOARD.refreshFilter();
    refreshFilterText();
}

// INITIALISATION
$(function() {
        $('.chosen-select').chosen(
            {
                disable_search_threshold: 100,
                width: '100%',
                allow_single_deselect: true
            });
    }
);
