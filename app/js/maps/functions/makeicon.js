// This function takes in a color, and then creates a new marker
// The icon will be 21px wide by 34px high, have an origin
// of 0, 0 and be anchored at 10, 34.
export const makeIcon = function(gmaps, markerColor) {
    const markerImage = new gmaps.MarkerImage(
        `http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|${markerColor}|40|_|%E2%80%A2`,
        new gmaps.Size(21, 34),
        new gmaps.Point(0, 0),
        new gmaps.Point(10, 34),
        new gmaps.Size(21,34)
    );
    return markerImage;
}
