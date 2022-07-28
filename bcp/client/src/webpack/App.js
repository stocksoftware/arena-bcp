import React, {useState} from 'react';
import {Dropdown} from 'react-bootstrap';
import Map from './pages/map';
import List from './pages/list';
import './less/app.less';
import {ASSET_MODE} from "./constant";
import { observer } from "mobx-react";
import useStores from "./hooks/use-stores";
import './css/thirdparty/font-awesome/css/font-awesome.css';

const App = observer(() => {
    const [key, setKey] = useState('map');
    const {mapStore} = useStores();
    const asset = mapStore.assetType;
    return (
        <div id="app">
            <div className="navFilter">
                <Dropdown id="modeFilter">
                    <Dropdown.Toggle  id="dropdown-mode">
                        <span>MODE:{asset}</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={()=>{mapStore.setAssetType(ASSET_MODE.AIRCRAFT);}}>{ASSET_MODE.AIRCRAFT}</Dropdown.Item>
                        <Dropdown.Item onClick={()=>{mapStore.setAssetType(ASSET_MODE.EQUIPMENT);}}>{ASSET_MODE.EQUIPMENT}</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <ul id="viewFilter">
                    <li className={key==='map'? 'active btn':'btn'} onClick={()=>{setKey('map');}}>MAP</li>
                    <li className={key==='list'?'active btn':'btn'} onClick={()=>{setKey('list');}}>LIST</li>
                </ul>
            </div>
            {key==='map'? <Map asset={asset}/> : <List/>}
        </div>
    );
});

export default App;