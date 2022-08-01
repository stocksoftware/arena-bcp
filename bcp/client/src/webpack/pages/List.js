import React, {useState, useEffect} from 'react';
import useStores from "../hooks/use-stores";
import {observer} from "mobx-react";
import Table from 'react-bootstrap/Table';
import {ASSET_MODE} from "../constant";
import {fetchAircraftGeoJSON, fetchEquipmentGeoJSON} from "../helper/toGeoJSON";
import {getAssetCell} from '../helper/map-dashboard'

const List =observer(() => {
    const {mapStore} = useStores();
    const assetMode = mapStore.assetType;
    const [dataSource, setDataSource] = useState(null);
    useEffect(()=>{
        if(assetMode===ASSET_MODE.AIRCRAFT){
            fetchAircraftGeoJSON(setDataSource);
        }else{
            fetchEquipmentGeoJSON(setDataSource);
        }
    },[])
    return (
        <div>
            <Table striped>
                <thead>
                <tr>
                    <th>Asset</th>
                    <th>Base Location</th>
                    <th>Status</th>
                    <th>F-CTAF</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {dataSource.features.map(feature=>{
                    const {properties} = feature;
                    return(
                        <tr>
                            <td>{getAssetCell(properties)}</td>
                        </tr>
                    )
                })}
                </tbody>
            </Table>
        </div>
    );
}) ;

export default List;