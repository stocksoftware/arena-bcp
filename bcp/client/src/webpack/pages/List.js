import React, {useState, useEffect} from 'react';
import useStores from "../hooks/use-stores";
import {observer} from "mobx-react";
import Table from 'react-bootstrap/Table';
import {fetchAssetList} from "../helper/toGeoJSON";
import {getLocationCell, getOperatorName} from '../helper/map-dashboard';
import * as AMFUNC_DISP from "../helper/map-display";
import {ASSET_MODE, DEBOUNCE_DELAY_MS} from '../constant';
import {filterAssets} from "../helper/map-math";
import _ from 'lodash';
import {TableSort} from '../components/TableSort';
import AircraftAssetCol from '../components/AircraftAssetCol';
import EquipmentAssetCol from '../components/EquipmentAssetCol';

const List = observer(() => {
    const {mapStore} = useStores();
    const assetMode = mapStore.assetType;
    const [assets, setAssets] = useState([]);
    const [filter, setFilter] = useState('');
    const [assetNameDesc, setAssetNameDesc] = useState(true);
    const [popUpKey, setPopupKey] = useState('');
    useEffect(() => {
        fetchAssetList(assetMode).then(setAssets);
    }, [assetMode]);
    useEffect(() => {
        if (assets.length > 0) {
            const debounce_search = _.debounce(function () {
                    let filterResult = filterAssets(assets, filter);
                    setAssets(filterResult);
                }
                , DEBOUNCE_DELAY_MS);
            debounce_search();
        }

    }, [filter]);
    const sortByName = () => {
        assets.sort((a, b) => {
            const aValue = a.callsign || a.registration;
            const bValue = b.callsign || b.registration;
            return assetNameDesc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        });

        setAssets(assets);

        setAssetNameDesc(!assetNameDesc);
    }
    return (
        <div>
            <div className='keyword_filter'>
                <strong>Filter</strong><input onChange={e => {
                setFilter((e.target.value).trim());
            }}/>
            </div>
            <Table striped>
                <thead>
                <tr>
                    <th>Asset
                        <div className='table_sort' onClick={sortByName}>
                            <TableSort desc={assetNameDesc}/>
                        </div>
                    </th>
                    <th>Base Location</th>
                    <th>Status</th>
                    <th>F-CTAF</th>
                    <th>Notes</th>
                </tr>
                </thead>
                <tbody>
                {assets && assets.map(asset => {
                    const {eventType, location} = getLocationCell(asset);
                    const isDispatched = asset.event_name ==='Dispatched' ? 'dispatched' : '';
                    return (
                        <tr key={asset.id}>
                            {
                                assetMode === ASSET_MODE.EQUIPMENT ?
                                    <EquipmentAssetCol asset={asset} isDispatched={isDispatched}/>
                                    :<AircraftAssetCol asset={asset} isDispatched={isDispatched}/>
                            }

                            <td className="baseLocation">
                                <p>{eventType}{location}</p>
                            </td>
                            <td className="statusCell">
                                <div className="eventAndNumber">
                                    <div className="eventName">
                                        <span className={isDispatched}>{asset.event_name}
                                        </span>
                                    </div>
                                    <span className="dispatchNumber">
                                        {asset.dispatch_number}
                                    </span>
                                    <div className="incidentName">{asset.incident_name}</div>
                                </div>
                            </td>
                            <td>
                                <div className='ctaf'>{asset.dispatch_ctaf}</div>
                            </td>
                            <td>
                                <div className='notes'>{asset.notes}</div>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </Table>
        </div>
    );
});

export default List;