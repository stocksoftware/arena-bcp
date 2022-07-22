import React, {useState, useEffect} from 'react';
import {GeoJSON} from "react-leaflet";
import L from 'leaflet';
import {fetchIncidentJson} from '../helper/fetchData';

const DataLayer = ({fileName,pointToLayer, onEachFeature}) => {
    const [data, setData] = useState(null);
    useEffect(() => {
        fetchIncidentJson(fileName).then(setData)
    },[])



    return (<GeoJSON data={data} pointToLayer={pointToLayer} key={data!==null} onEachFeature={onEachFeature}/>)
}

export default DataLayer;