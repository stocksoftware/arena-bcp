import React from "react";
import storesContext from "../context/stores-context";

const useStores = () => React.useContext(storesContext);

export default useStores;