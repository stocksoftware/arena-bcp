import $ from 'jquery';

export const fetchIncidentJson = (fileName)=>{
  return $.getJSON(`/${fileName}.json`);
};

