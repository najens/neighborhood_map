import {mapStyle} from '../styles/mapstyle';

export const loadMap = function(gmaps) {
    // Create a new StyledMapType object, passing it an array of styles,
    // and the name to be displayed on the map type control.
    var styledMapType = new gmaps.StyledMapType(
        mapStyle,
        {name: 'Styled Map'}
    );

    // Add map - requires center and zomm
    const map = new gmaps.Map(document.getElementById('map'), {
        center: {lat: 47.585591, lng: -122.330953},
        zoom: 10,
        //styles: styledMapType,
        mapTypeControlOptions: {
            mapTypeIds: ['roadmap', 'satellite', 'terrain', 'styled_map']
        },
        mapTypeControl: true  // Set to false to only show styled_map
    });

    //Associate the styled map with the MapTypeId and set it to display.
    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');

    return map;
};
