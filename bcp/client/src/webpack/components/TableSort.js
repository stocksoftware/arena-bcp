import React from "react";
import SortIcon from '../../../../public/icons/sort.svg';
import DescendingIcon from '../../../../public/icons/descending.svg';
import AscendingIcon from '../../../../public/icons/ascending.svg';


const TableSort = ({desc, sortKey, tagKey}) => {
    return(
       sortKey === tagKey ? (desc ?< img src={DescendingIcon}/>:<img src={AscendingIcon}/>) :<img src={SortIcon}/>
)
    };


export default TableSort;