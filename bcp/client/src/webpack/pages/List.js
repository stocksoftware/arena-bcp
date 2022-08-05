import React,{useState, useEffect} from 'react';
import useStores from "../hooks/use-stores";
import {observer} from "mobx-react";
import Table from 'react-bootstrap/Table';
import {fetchAssetList} from "../helper/toGeoJSON";
import {getLocationCell} from '../helper/map-dashboard';
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
    const [locationDesc, setLocationDesc] = useState(true);
    const [statusDesc, setStatusDesc] = useState(true);
    const [CTAFDesc, setCTAFDesc] = useState(true);
    useEffect(() => {
        fetchAssetList(assetMode).then(setAssets);
        //initilisation of a new mode
        setAssetNameDesc(true);
        setLocationDesc(true);
        setStatusDesc(true);
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
    };
    const sortByLocation = () => {
        assets.sort((a, b) => {
            const aValue = a.locationOrder;
            const bValue = b.locationOrder;
            return locationDesc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        });
        setAssets(assets);
        setLocationDesc(!locationDesc);
    };
    const sortByStatus = () => {
        assets.sort((a, b) => {
            const aValue = a.statusOrder;
            const bValue = b.statusOrder;
            return statusDesc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
        });
        setAssets(assets);
        setStatusDesc(!statusDesc);
    };
    const sortByCTAF = () => {
        assets.sort((a, b) => {
            const aValue = a.dispatch_ctaf ? a.dispatch_ctaf : 'Z';
            const bValue = b.dispatch_ctaf ? b.dispatch_ctaf : 'Z';
            return CTAFDesc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
        });
        setAssets(assets);
        setCTAFDesc(!CTAFDesc);
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
                    <th onClick={sortByName}>Asset
                        <div className='table_sort'>
                            <TableSort desc={assetNameDesc}/>
                        </div>
                    </th>
                    <th onClick={sortByLocation}>Base Location
                        <div className='table_sort'>
                            <TableSort desc={locationDesc}/>
                        </div>
                    </th>
                    <th onClick={sortByStatus}>Status
                        <div className='table_sort'>
                            <TableSort desc={statusDesc}/>
                        </div>
                    </th>
                    <th onClick={sortByCTAF}>F-CTAF
                        <div className='table_sort'>
                            <TableSort desc={CTAFDesc}/>
                        </div>
                    </th>

                    <th>Notes</th>
                </tr>
                </thead>
                <tbody>
                {assets.length > 0 && assets.map(asset => {
                    const {eventType, location} = getLocationCell(asset);
                    const isDispatched = asset.event_name === 'Dispatched' ? 'dispatched' : '';
                    return (
                        <tr key={asset.id}>
                            {
                                assetMode === ASSET_MODE.EQUIPMENT ?
                                    <EquipmentAssetCol asset={asset} isDispatched={isDispatched}/>
                                    : <AircraftAssetCol asset={asset} isDispatched={isDispatched}/>
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
        )


});

export default List;