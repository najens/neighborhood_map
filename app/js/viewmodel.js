import {Model} from './model';


const ViewModel = function() {
    const self = this;
    const model = new Model();

    // If locations list not already in local storage, add default data
    model.setInitialData();

    // Set neighborhood list to an empty array
    this.neighborhoodList = ko.observableArray([]);

    // Get locations from local storage
    const locations = model.getLocations();

    // Add each location item to the neighborhoodList
    locations.forEach(function(locationObj){
        self.neighborhoodList.push(new model.Place(locationObj));
    });

    // Get the current place from local storage
    const currentPlace = model.getCurrentPlace();

    // Set current place to an empty knockout observable
    this.currentPlace = ko.observable(currentPlace);

    // When a place item is clicked set current place to clicked place
    // and add current place to local storage
    this.setPlace = function(clickedPlace) {
        self.currentPlace(clickedPlace);
        model.setCurrentPlace(self.currentPlace());
    };
}

// Apply knockout bindings
ko.applyBindings(new ViewModel())
