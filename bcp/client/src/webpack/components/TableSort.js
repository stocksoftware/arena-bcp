import React from "react";
import SortIcon from '../assets/sort.svg?component';
import DescendingIcon from '../assets/descending.svg?component';
import AscendingIcon from '../assets/ascending.svg?component';

const TableSort = ({desc, sortKey, tagKey}) => sortKey === tagKey ? (desc ? <DescendingIcon/>:<AscendingIcon/>) :<SortIcon/>;

export default TableSort;
