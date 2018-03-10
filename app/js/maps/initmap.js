import 'js-marker-clusterer';
import {loadMap} from './services/loadmap';
import {ViewModel} from '../viewmodel';
const gmapsapi = require(
    'google-maps-api')('AIzaSyDRd5kI46dHc4wGwX_kwbAKHkiHJEfPuro', ['places']
);

// Initiate google maps asynchronously using a Promise
const initMap = gmapsapi().then(function(resolve) {
    // google.maps is returned by the promise resolve
    const gmaps = resolve;
    // Load map object
    const map = loadMap(gmaps);
    // Create ViewModel instance and pass in map objects
    const VM = new ViewModel(gmaps, map);
    // Apply knockout bindings to View Model
    ko.applyBindings(VM);
    // Subscribe knockout filter to filter list and markers
    VM.filter.subscribe(function(){
        VM.filterLocations();
    });
// If Promise is rejected alert user that Google maps failed to load
}, function(reject) {
    alert(`Google Maps failed to load. Please check your internet \
          connection and try again.`);
    console.log(reject);
});
