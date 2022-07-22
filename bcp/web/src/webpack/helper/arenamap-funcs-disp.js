/* jslint browser: true */
/* jslint bitwise: true */
/* jslint white: true */
/* jslint this: true */

import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment-timezone';
import turf from 'turf';
import * as AM_FILTER from './arenamap-filters';

export function getAssetSilhouette(asset) {
    return '<img src=\'' + getAssetSilhouettePath(asset) + '\' style=\'width:100px; height:auto;\'/>';
}

function getAssetSilhouettePath(asset) {
    let path;

    if (asset.isEquipment || asset._isEquipment) {
        path = getEquipmentSilhouettePath(asset);
    } else {
        path = getAircraftSilhouettePath(asset);
    }

    return path ? './silhouettes/' + path : null;
}

export function getAssetTitle(asset) {
    return asset.callsign ? asset.callsign + ' [' + asset.registration + ']' : asset.registration;
}

export function wrapNotesHeader(notes, colonFollowedByNewline) {
    let regex;
    // /mg puts the regex into a mode where ^ matches the start of each line, not just he start of the string.
    if (colonFollowedByNewline) {
        regex = new RegExp('^(' + MAP_CONSTANTS.NOTES_HEADINGS + '):()$', 'mg');
    } else {
        regex = new RegExp('^(' + MAP_CONSTANTS.NOTES_HEADINGS + '):([^\n]*)$', 'mg');
    }
    return notes.replace(regex, '<span class=\'notes-header\'>$1:</span>$2');
}

export function truncateNotes(notes, maxLength) {
    // Put each note onto one line.
    const oneLine = notes.replace(/\n/g, ' ');

    // Split the notes on the headings
    const regex = new RegExp('(' + MAP_CONSTANTS.NOTES_HEADINGS + '):', 'g');
    const oneLinePerNote = oneLine.replace(regex, '\n$1:').trim();

    return truncateLines(oneLinePerNote, maxLength);
}

export function truncateLines(lines, maxLength) {
    let result = '';
    _.each(lines.split('\n'), function(line) {
        if (line.length > maxLength) {
            result += line.substring(0, maxLength - 3) + '...\n';
        } else {
            result += line + '\n';
        }
    });
    return result.trim();
}

export function getAircraftDetails(aircraft) {
    let content = '<span class="subsection-heading">Type:</span><div class="subsection">';

    content += aircraft.category ? formatAircraftCategory(aircraft.category) + '<br/>' : '';
    content += aircraft.make ? safeString(aircraft.make) + ' ' : '';
    content += aircraft.model ? safeString(aircraft.model) + '<br/>' : '';
    content += aircraft.model ? getAssetSilhouette(aircraft) : '';
    content += '</div>';
    return content;
}

export function getEquipmentDetails(equipment) {
    let content = '';
    content += (equipment.description ?
        '<strong>Description: </strong>' + safeString(equipment.description) + '<br/>' :
        '');
    content +=
        (equipment.fuelType ? '<strong>Fuel Type: </strong>' + safeString(equipment.fuelType) + '<br/>' : '');
    return content;
}

export function getAssetOperatorDetails(asset) {
    const details = {};
    details.photo = asset.profilePhotoSmall ? getAssetProfilePhoto(asset) : '';
    if (asset.operator.name || asset.operator.registeredName || asset.operator.operationalContact) {
        details.name = cleanOperatorName(asset.operator.name ? asset.operator.name : asset.operator.registeredName);
        details.contact =
            asset.operator.operationalContact ? safeString(asset.operator.operationalContact) : '';
        const user = getUser(false);
        details.phoneIntegration = formatPhoneIntegrationValue(user.phoneIntegration, details.contact);
        return;
    }
    return details.photo;
}

export function getAssetAvailabilityNotes(asset) {
    if (asset.availabilityFeature && asset.availabilityFeature.properties.notes) {
        // Remove double and training newlines.
        let fullNotes = asset.availabilityFeature.properties.notes.replace(/\n\n/g, '\n').trim();

        if (fullNotes !== '') {
            let truncatedNotes = truncateNotes(fullNotes, 60);
            truncatedNotes = wrapNotesHeader(truncatedNotes, false);
            truncatedNotes = truncatedNotes.replace(/\n/g, '<br/>');

            fullNotes = wrapNotesHeader(fullNotes, true);
            fullNotes = fullNotes.replace(/\n/g, '<br/>');

            if (truncatedNotes.indexOf('...') > 0) {
                return require('./templates/assetAvailabilityNotes.hbs')({
                    truncatedNotes: truncatedNotes,
                    popup: require('./templates/popup.hbs')({
                        position: 'left', title: 'Notes', content: fullNotes
                    })
                });
            } else {
                return require('./templates/assetAvailabilityNotes.hbs')({
                    truncatedNotes: truncatedNotes
                });
            }
        }
    }
    return '';
}

export function getAircraftPilotDetails(aircraft) {
    const checkinsForAircraft = _.sortBy(AM_DATA.getCheckinsForAircraft(aircraft.id), 'id').reverse();
    const pilotCheckin = findPilotCheckin(checkinsForAircraft);
    const user = getUser(false);
    return pilotCheckin ?
        require('./templates/pilotDetails.hbs')({
            name: `${pilotCheckin.firstName} ${pilotCheckin.lastName}`,
            mobile: pilotCheckin.mobile,
            checkinAt: moment(pilotCheckin.checkinAt).calendar(),
            phoneIntegration: formatPhoneIntegrationValue(user.phoneIntegration, pilotCheckin.mobile)
        }) :
        '';
}

export function getAssetDispatchContactDetails(asset) {
    if (asset.availabilityFeature) {
        const user = getUser(false);
        const details = { showContact: false };
        const properties = asset.availabilityFeature.properties;
        details.number = properties.dispatch_number;
        details.primaryRole = properties.dispatch_primary_role;
        if (properties.dispatch_contact ||
            properties.dispatch_email ||
            properties.dispatch_phone) {
            details.showContact = true;
            details.contactName = properties.dispatch_contact;
            details.email = properties.dispatch_email;
            details.phone = properties.dispatch_phone;
            details.phoneIntegration = formatPhoneIntegrationValue(user.phoneIntegration, details.phone);
            details.altPhone = properties.dispatch_alt_phone;
            details.altPhoneIntegration = formatPhoneIntegrationValue(user.phoneIntegration, details.altPhone);
        }
        return require('./templates/assetDispatchContactDetails.hbs')(details);
    }
    return '';
}

export function getAssetProfilePhoto(asset) {
    if (asset.profilePhotoSmall) {
        return '<img src=\'' + asset.profilePhotoSmall + '\' style="width:auto;height:90px">';
    }
    return '';
}

export function getAssetSpatialDisp(asset) {
    let content = '';
    if (asset.locationFeature &&
        asset.locationFeature.geometry &&
        asset.locationFeature.properties.speed &&
        asset.locationFeature.properties.track) {
        const stateText = asset.trackingData ? asset.trackingData.stateText : null;
        const lat = asset.locationFeature.geometry.coordinates[1];
        const lon = asset.locationFeature.geometry.coordinates[0];
        const spd = asset.locationFeature.properties.speed;
        const trk = asset.locationFeature.properties.track;
        const alt = asset.locationFeature.geometry.coordinates[2];

        if (stateText) {
            if (stateText === 'Unknown') {
                content +=
                    '<strong>State:</strong> <span class="tblWarning"><strong> ' + stateText + '</strong></span></BR>';
                content +=
                    '<span class="tblWarning">' +
                    (AM_FILTER.getCurrentAssetTypeFilterValue() === AM_FILTER.getAssetTypes().AIRCRAFT ?
                        'The aircraft was last known to be flying but has not reported a landing or reported recently.' :
                        'The equipment was last known to be moving but has not reported recently.') + '</span></BR>';
            } else {
                content += '<strong>State:</strong> ' + stateText + '</BR>';
            }
        }
        content +=
            '<strong>Coords: </strong>' + parseFloat(lat).toFixed(3) + ',' + parseFloat(lon).toFixed(3) + '</BR>';
        if (stateText !== 'Parked') {
            content += '<strong>Speed:</strong> ' + spd + ' km/h </BR>';
            content += '<strong>Track:</strong> ' + trk + ' deg</BR>';
        }
        content += '<strong>Altitude:</strong> ' + mToFeet(alt).toFixed(0) + ' ft</BR>';
    }
    return content;
}

export function getAssetLastSeen(asset) {
    let content = '';
    if (asset.locationFeature && asset.locationFeature.properties.transmitted) {
        // compute and humanise last seen time
        const lastSeen = moment(asset.locationFeature.properties.transmitted);
        const timeDiff = lastSeen.diff(moment());
        content += moment.duration(timeDiff).humanize(true) + ' at ' + lastSeen.format('HH:mm');
    }
    return content;
}

export function getAssetLastSeenDetails(asset) {
    const lastSeen = getAssetLastSeen(asset);
    if (lastSeen) {
        return require('./templates/lastSeenDetails.hbs')({ details: lastSeen });
    }
    return '';
}

export function getAircraftActions(aircraft, popup) {
    return getAssetActions(aircraft, popup, false);
}

export function getEquipmentActions(equipment, popup) {
    return getAssetActions(equipment, popup, true);
}

export function getAssetPlanningActions(isEquipment, asset) {
    if (isPlanningMode()) {
        const planStore = PlanStoreProvider.store();
        const action = planStore.planActions.find(action => action.asset.id === asset.id);
        if (!action) {
            return require('./templates/addToPlanButton.hbs')(
                { assetId: asset.id, assetType: isEquipment ? 'EQUIPMENT' : asset.airframe });
        } else {
            return require('./templates/removeFromPlanButton.hbs')(
                { action });
        }
    }
    return '';
}

export function getOpsAssetActions(isEquipment, asset, pinned) {
    const acOrEq = isEquipment ? 'equipment' : 'aircraft';
    const viewUrl = CONFIG.arenaRegisterRedirectURL + '&' + acOrEq + 'Id=' + asset.id;
    return require('./templates/opsAssetButton.hbs')(
        { viewUrl, assetId: asset.id, assetType: isEquipment ? 'EQUIPMENT' : asset.airframe, pinned });
}

function getAssetActions(asset, popup, isEquipment) {
    const acOrEq = isEquipment ? 'equipment' : 'aircraft';
    const user = getUser(false);

    const viewUrl = CONFIG.arenaRegisterRedirectURL + '&' + acOrEq + 'Id=' + asset.id;
    const dailyReturnsURL = CONFIG.arenaReturnsRedirectURL + '&gwtParams=dailyReport;' + acOrEq + 'ID=' + asset.id;

    // View Action
    const registerLink =
        '<a href="' +
        viewUrl +
        '" title="View in Register" target="register" class="btn viewInRegisterBtn"><i></i></a>';

    // Map Action
    let mapLink;
    if (asset.locationFeature) {
        mapLink =
            '<a href="#" title="View on Map" class="btn viewOnMapBtn" data-position="' +
            asset.locationFeature.geometry.coordinates[1] +
            ',' +
            asset.locationFeature.geometry.coordinates[0] +
            '" data-zoom="12"><i></i></a>';
    } else {
        mapLink =
            '<a href="#" title="View on Map" class="btn viewOnMapBtn disabled" onclick="return false;"><i></i></a>';
    }
    // List Action
    const listLink = '<a href="#" title="View in List" class="btn viewOnListBtn"' +
        ' data-' + acOrEq + 'Id="' + (asset.id ? asset.id : '') +
        '" data-tablerowindex="' + (asset.tableRowIndex ? asset.tableRowIndex : '') +
        '"><i></i></a>';

    // Dispatch Action
    let dispatchLink = '';
    if (user && user.canDispatch) {
        if (asset.availabilityFeature && asset.availabilityFeature.properties.event_type === 'DEPLOYED') {
            if (popup) {
                const releaseURL = CONFIG.arenaRegisterRedirectURL +
                    '&dispatchId=' +
                    asset.availabilityFeature.properties.dispatch_id +
                    '&requestType=releaseDispatch';
                dispatchLink =
                    '<a href="' + releaseURL + '" title="Release" target="dispatch" class="btn releaseBtn"><i></i></a>';
            } else {
                dispatchLink =
                    '<button title="Release" data-dispatchid="' + asset.availabilityFeature.properties.dispatch_id + '" ' +
                    'data-assetid="' + asset.id + '" ' +
                    'data-isequipment="' + isEquipment + '" ' +
                    'class="btn releaseBtn releaseToggleBtn">' +
                    '<i></i></button>';
            }
        } else {
            const title = getUser(false).canDispatch ? 'Dispatch' : 'Request';
            if (popup) {
                const dispatchUrl = CONFIG.arenaRegisterRedirectURL + '&' + acOrEq + 'Id=' + asset.id +
                    '&requestType=dispatch&airdeskSearchType=Individual';

                dispatchLink =
                    '<a href="' + dispatchUrl + '" title="' + title + '" target="dispatch" class="btn dispatchBtn"><i></i></a>';
            } else {
                dispatchLink =
                    '<button title="' + title + '" data-' + acOrEq + 'id="' + asset.id + '" ' +
                    'class="btn dispatchBtn dispatchToggleBtn">' +
                    '<i></i></button>';
            }
        }
    }

    // Returns Action
    let dailyReturnsLink = '';
    if (!isEquipment) {
        dailyReturnsLink = '<a href="' +
            dailyReturnsURL +
            '" title="Daily report" target="Returns" class="btn dailyReturnsBtn"><i></i></a>';
    }

    // Create Service Period Action
    const setServicePeriodUrl = CONFIG.arenaProcurementRedirectURL + '&gwtParams=PMSS' + ';' + acOrEq + 'Id=' + asset.id;
    const isAssetEngaged = isEngaged(asset);
    const hasAvailabilityFeature = !isUndefinedOrNull(asset.availabilityFeature);
    const isAssetServiceable = !isUnserviceable(asset);
    const hasAvailabilityProperties = hasAvailabilityFeature &&
        !isUndefinedOrNull(asset.availabilityFeature.properties);
    const hasServicePeriod = hasAvailabilityProperties &&
        !isUndefinedOrNull(asset.availabilityFeature.properties.service_period_id);
    let setServicePeriodLink = '';
    let editServicePeriodLink = '';

    if (user && (user.isAgencyManager || user.isAgencyAirdesk)) {
        if (!hasAvailabilityFeature || ((!isAssetEngaged || (isAssetEngaged && !hasServicePeriod)) && isAssetServiceable)) {
            setServicePeriodLink += '<a href="' +
                setServicePeriodUrl +
                '" title="Set Standby" target="PC" class="btn viewServicePeriodBtn">' +
                '<i></i></a>';
        }
        // Edit Service Period Action

        if (hasServicePeriod) {
            const editServicePeriodUrl = CONFIG.arenaProcurementRedirectURL +
                '&gwtParams=PMSP;servicePeriodID=' +
                asset.availabilityFeature.properties.service_period_id;
            editServicePeriodLink += '<a href="' +
                editServicePeriodUrl +
                '" title="Edit Service Period" target="PC" class="btn editServicePeriodBtn">' +
                '<i></i></a>';
        }
    }

    if (setServicePeriodLink === '' && editServicePeriodLink === '') {
        editServicePeriodLink =
            '<a href="#" title="Edit Standby" class="btn viewServicePeriodBtn disabled" onclick="return false;"><i></i></a>';
    }

    let checkinsLink = '';
    if (!isEquipment) {
        const checkins = AM_DATA.getCheckinsForAircraft(asset.id);
        if (checkins.length > 0) {
            const url = `${CONFIG.arenaRegisterRedirectURL}&requestType=manifest&aircraftId=${asset.id}`;
            checkinsLink =
                `<a href="${url}" title="View checkins in Register" target="register" class="btn checkinsBtn"><i class="fa fa-user"></i><span class="count">${checkins.length}</span></a>`;
        }
    }

    return '<div class="action-buttons assetButtons">' +
        registerLink +
        mapLink +
        listLink +
        dispatchLink +
        setServicePeriodLink +
        editServicePeriodLink +
        dailyReturnsLink +
        checkinsLink +
        '</div>';
}

export function getLocationCheckinsButton(locationId) {
    const checkins = AM_DATA.getCheckinsForLocation(locationId);
    if (checkins.length > 0) {
        const url = `${CONFIG.arenaRegisterRedirectURL}&requestType=manifest&locationId=${locationId}`;
        return `<a href="${url}" title="View checkins in Register" target="register" class="btn checkinsBtn"><i class="fa fa-user"></i><span class="count">${checkins.length}</span></a>`;
    }
    return '';
}

export function isUnserviceable(asset) {
    const unserviceableEventTypes = ['UNSERVICEABLE'];
    return asset.availabilityFeature &&
        _.includes(unserviceableEventTypes, asset.availabilityFeature.properties.event_type);
}

export function isEngaged(asset) {
    const engagedEventTypes = ['STANDBY', 'STANDBY_AMENDED', 'STANDBY_TEMP_ASSET', 'DEPLOYED', 'PLANNED_DISPATCH'];
    return asset.availabilityFeature &&
        _.includes(engagedEventTypes, asset.availabilityFeature.properties.event_type);
}

export function isAvailable(asset) {
    const availableEventTypes = ['AVAILABLE', 'LIMITED'];
    return asset.availabilityFeature &&
        _.includes(availableEventTypes, asset.availabilityFeature.properties.event_type);
}

export function getIncident(asset, assetType, incidentData) {
    let content = '';
    const availabilityFeature = asset.availabilityFeature;
    if (availabilityFeature && incidentData) {
        const availability = availabilityFeature.properties;
        content += availability.dispatch_number ?
            '<strong>Dispatch Number: </strong>' +
            safeString(availability.dispatch_number) +
            '<br/>' :
            '';
        content += availability.dispatch_primary_role ?
            '<strong>Primary Role: </strong>' +
            safeString(availability.dispatch_primary_role) +
            '<br/>' :
            '';
        content += availability.dispatch_ctaf ?
            '<strong>F-CTAF: </strong>' + safeString(availability.dispatch_ctaf) + '<br/>' :
            '';
        content += '<strong>Incident:</strong> ';
        let incidentContent = '';
        $.each(incidentData.features, function(index, incidentFeature) {
            const incidentProperties = incidentFeature.properties;
            if (incidentProperties.id === availability.incident_id) {
                incidentContent = incidentProperties.name ? safeString(incidentProperties.name) + '<br/>' : '';
                incidentContent += incidentProperties.number ?
                    '<strong>Incident Number: </strong>' +
                    safeString(incidentProperties.number) +
                    '<br/>' :
                    '';

                if (availability.location) {
                    incidentContent += `<span class="emphasis">Staging Base:</span> ${availability.location}<br/>`;
                }

                incidentContent += incidentProperties.dataSource ?
                    '<strong>Source: </strong>' +
                    safeString(incidentProperties.dataSource) +
                    '<br/>' :
                    '';
                if (incidentFeature.geometry) {
                    incidentContent += incidentFeature.geometry.coordinates ?
                        '<strong>Coordinates: </strong>' +
                        incidentFeature.geometry.coordinates[1] +
                        ',' +
                        incidentFeature.geometry.coordinates[0] +
                        '<br/>' :
                        '';
                }

                // calculate distance from asset to incident
                if (asset.locationFeature &&
                    incidentFeature.geometry &&
                    (!asset.isEquipment || assetType !== AM_FILTER.getAssetTypes().EQUIPMENT)) {
                    const fromPt = {
                        type: 'Feature',
                        properties: {},
                        geometry: incidentFeature.geometry
                    };
                    const toPt = {
                        type: 'Feature',
                        properties: {},
                        geometry: asset.locationFeature.geometry
                    };
                    const distance = turf.distance(fromPt, toPt, 'kilometers');
                    const bearing = turf.bearing(fromPt, toPt).toFixed(0);

                    if (!isNaN(distance)) {
                        incidentContent +=
                            '<strong>' + (asset.callsign ? asset.callsign : asset.registration) + ' Currently: </strong>';
                        if (distance < 5) {
                            incidentContent += 'at incident';
                        } else {
                            incidentContent += distance.toFixed(0);
                            incidentContent += ' km ' + degToCard(bearing) + ' of incident </BR>';
                        }
                    }
                }

                // URL for viewing dispatch
                // http://arenatest.nafc.org.au/register/main/agency/editDispatch.xhtml?dispatchId=174
                // URL for viewing incident
                // http://arenatest.nafc.org.au/register/main/agency/editIncident.xhtml?incidentId=153625 content +=
                // incidentProperties.number ?  "<A HREF = '/register/main/agency/editIncident.xhtml?incidentId="+
                // incidentProperties.number  + "'>incident</A><br/>" : "";
            }
        });
        if (incidentContent === '') {
            incidentContent = 'No incident selected';
        }
        content += incidentContent;
    }
    if (content === '') {
        content = 'No incident selected';
    }
    return content;
}

export function removePopup() {
    $(this).find('.amPopup:not(.modalAmPopup)').remove();
}

export function positionAndShowPopup(elem, onMap) {
    const popupElement = $(elem.attr('data-popup'));
    const popupBody = popupElement.find('.popupBody');
    popupBody.css('visibility', 'hidden');
    elem.append(popupElement);
    positionPopup(elem, popupElement, onMap);
    popupBody.css('visibility', 'visible');
    return popupElement;
}

export const positionPopup = function(elem, popupElement, onMap) {
    const parent = onMap ? elem.parents('.leaflet-container') : elem.parents('.dataTables_scrollBody');
    const parentTop = parent[0].getBoundingClientRect().top;
    const parentBottom = parent[0].getBoundingClientRect().bottom;
    const popupBody = popupElement.find('.popupBody');
    popupBody.css('transform', 'translateY(0)');
    const popupTop = popupBody[0].getBoundingClientRect().top;
    const popupBottom = popupBody[0].getBoundingClientRect().bottom;
    if (parentBottom < popupBottom) {
        popupBody.css('transform', 'translateY(-' + (popupBottom - parentBottom) + 'px)');
    } else if (parentTop > popupTop) {
        popupBody.css('transform', 'translateY(' + (parentTop - popupTop) + 'px)');
    }
    if (onMap) {
        popupBody.parent().css('transform', 'translateX(-20px)');
    }
    if (elem[0].getBoundingClientRect().bottom > parentBottom || elem[0].getBoundingClientRect().top < parentTop) {
        popupElement.removeClass('arrow');
    }
    popupElement.find('img').on('load', function() { positionPopup(elem, popupElement, onMap); });
};

export function popupIframe(url) {
    return require('./templates/popupModal.hbs')(
        { content: require('./templates/popupIframe.hbs')({ id: 'editNotes', url: url }), position: 'left', open: true });
}

export function editAssetNotes(elem, url) {
    localStorage.removeItem(MAP_CONSTANTS.MAP_FINISH_EDITING_NOTES_STORAGE_KEY);
    $(elem).parent().addClass('editingNotes').append(window.AM_FUNCS.popupIframe(url));
    return false;
}

window.AM_FUNCS = { popupIframe: popupIframe, editAssetNotes: editAssetNotes };
