import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';

const rootElement = document.getElementById("root");
console.log('rootElement', rootElement);
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);