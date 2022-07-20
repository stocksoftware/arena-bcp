import React, {useState} from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Map from './pages/map';
import List from './pages/list';
import './less/app.less';
// import 'react-bootstrap/dist/'
const App = () => {
    const [key, setKey] = useState('map');

    return (
        <div id="app">
            <div className="navFilter">
            <div>
                Mode
            </div>
             <ul id="viewFilter">
                 <li className={key==='map'? 'active btn':'btn'} onClick={()=>{setKey('map')}}>MAP</li>
                 <li className={key==='list'?'active btn':'btn'} onClick={()=>{setKey('list')}}>LIST</li>
             </ul>
            </div>
            {key==='map'? <Map/> : <List/>}
        </div>
    );
};

export default App;
