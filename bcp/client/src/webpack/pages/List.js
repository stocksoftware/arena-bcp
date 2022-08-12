import React, {useState, useEffect} from 'react';
import useStores from "../hooks/use-stores";
import {observer} from "mobx-react";
import Table from 'react-bootstrap/Table';
import {fetchAssetList} from "../helper/toGeoJSON";
import {getLocationCell} from '../helper/map-dashboard';
import {ASSET_MODE, DEBOUNCE_DELAY_MS, SORTKEYID, STATUS_LIST} from '../constant';
import {filterAssets} from "../helper/map-math";
import debounce from 'lodash.debounce';
import TableSort from '../components/TableSort';
import AircraftAssetCol from '../components/AircraftAssetCol';
import EquipmentAssetCol from '../components/EquipmentAssetCol';


const List = observer(() => {
    const {mapStore} = useStores();
    const assetMode = mapStore.assetType;
    const [allAssets, setAllAssets] = useState([]);
    const [assets, setAssets] = useState([]);
    const [filter, setFilter] = useState('');
    const [assetNameDesc, setAssetNameDesc] = useState(true);
    const [locationDesc, setLocationDesc] = useState(false);
    const [statusDesc, setStatusDesc] = useState(false);
    const [CTAFDesc, setCTAFDesc] = useState(false);
    const [sortKey, setSortKey] = useState('A');
    useEffect(() => {
        fetchAssetList(assetMode).then(data => {
            setAllAssets(data);
            setAssets(data);
        });
        //initilisation of a new mode
        setLocationDesc(false);
        setStatusDesc(false);
        setCTAFDesc(false);
    }, [assetMode]);

    useEffect(() => {
        if (allAssets.length > 0) {
            const debounce_search = debounce(function () {
                    let filterResult = filterAssets(allAssets, filter);
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
            return assetNameDesc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
        });
        setAssets(assets);
        setAssetNameDesc(!assetNameDesc);
        setSortKey('A');
    };

    const sortByLocation = () => {
        assets.sort((a, b) => {
            const aValue = a.locationOrder;
            const bValue = b.locationOrder;
            return locationDesc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
        });
        setAssets(assets);
        setLocationDesc(!locationDesc);
        setSortKey('B');

    };
    const sortByStatus = () => {
        assets.sort((a, b) => {
            const aValue = a.statusOrder;
            const bValue = b.statusOrder;
            return statusDesc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
        });
        setAssets(assets);
        setStatusDesc(!statusDesc);
        setSortKey('C');
    };
    const sortByCTAF = () => {
        assets.sort((a, b) => {
            const aValue = a.dispatch_ctaf ? a.dispatch_ctaf : 'Z';
            const bValue = b.dispatch_ctaf ? b.dispatch_ctaf : 'Z';
            return CTAFDesc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
        });
        setAssets(assets);
        setCTAFDesc(!CTAFDesc);
        setSortKey('D');
    };

    return (
        <div>
            <div className='keyword_filter'>
                <span className="label">Filter</span><input onChange={e => {
                setFilter((e.target.value).trim());
            }}/>
            </div>
            <Table striped>
                <thead>
                <tr>
                    <th onClick={sortByName} className={`sort ${sortKey === SORTKEYID.Asset ? "selected" : ""} `}>
                        <span>Asset</span>
                        <div className="table_sort">
                            <TableSort desc={assetNameDesc} sortKey={sortKey} tagKey={SORTKEYID.Asset}/>
                        </div>
                    </th>
                    <th onClick={sortByLocation}
                        className={`sort ${sortKey === SORTKEYID.BaseLocation ? "selected" : ""} `}>Base
                        <span>Location</span>
                        <div className="table_sort">
                            <TableSort desc={locationDesc} sortKey={sortKey} tagKey={SORTKEYID.BaseLocation}/>
                        </div>
                    </th>
                    <th onClick={sortByStatus} className={`sort ${sortKey === SORTKEYID.Status ? "selected" : ""} `}>
                        <span>Status</span>
                        <div className="table_sort">
                            <TableSort desc={statusDesc} sortKey={sortKey} tagKey={SORTKEYID.Status}/>
                        </div>
                    </th>
                    <th onClick={sortByCTAF} className={`sort ${sortKey === SORTKEYID.FCTAF ? "selected" : ""} `}>
                        <span>F-CTAF</span>
                        <div className="table_sort">
                            <TableSort desc={CTAFDesc} sortKey={sortKey} tagKey={SORTKEYID.FCTAF}/>
                        </div>
                    </th>
                    <th>Notes</th>
                </tr>
                </thead>
                <tbody>
                {assets.length > 0 && assets.map(asset => {
                    const locations = getLocationCell(asset);

                    const status =STATUS_LIST[asset.event_name];
                    return (
                        <tr key={asset.id}>
                            {
                                assetMode === ASSET_MODE.EQUIPMENT ?
                                    <EquipmentAssetCol asset={asset} status={status}/>
                                    : <AircraftAssetCol asset={asset} status={status}/>
                            }


                            <td className="baseLocation">
                                {locations.length > 0 && locations.map((loc, index) => <p key={index}>
                                    <span className="loc-header">{loc.eventType}</span>
                                    {loc.location}</p>)
                                }

                            </td>
                            <td className="statusCell">
                                <div className="eventAndNumber">
                                    <div className={status}>
                                        <span className="eventName">{asset.event_name}
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
    )
});

export default List;