import React, {useState} from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Map from './pages/map';
import List from './pages/list';
import './less/app.less';
// import 'react-bootstrap/dist/'
const App = () => {
    const [key, setKey] = useState("map");
    return (
        <div className="app">
            <Tabs
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-3"
            >
                <Tab eventKey="map" title="MAP">
                    <Map/>
                </Tab>
                <Tab eventKey="list" title="LIST">
                    <List/>
                </Tab>
            </Tabs>
        </div>
    );
};

export default App;