import React, {useState} from 'react';
import {Dropdown} from 'react-bootstrap';
import Map from './pages/map';
import List from './pages/list';
import './less/app.less';
import {ASSET_MODE} from "./constant";
const App = () => {
    const [key, setKey] = useState('map');
    const [asset, setAsset] = useState(ASSET_MODE.aircraft);

    return (
        <div id="app">
            <div className="navFilter">
                <Dropdown id="modeFilter">
                    <Dropdown.Toggle  id="dropdown-mode">
                       MODE:{asset}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={()=>{setAsset(ASSET_MODE.aircraft);}}>{ASSET_MODE.aircraft}</Dropdown.Item>
                        <Dropdown.Item onClick={()=>{setAsset(ASSET_MODE.equipment);}}>{ASSET_MODE.equipment}</Dropdown.Item>
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
};

export default App;