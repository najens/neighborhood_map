import {initialData} from './data';

export class Model {
    constructor() {
        this.initialData = initialData;
    }

    // Creates new Place objects
    Place(data) {
        return {
            id: data.id,
            name: data.name,
            place_id: data.place_id,
            address: data.address,
            location: data.location,
            description: data.description
        };
    }

    // Stores initial data in localStorage if it doesn't already exist
    setInitialData() {
        const self = this;
        if (!localStorage.getItem('locations')) {
            const neighborhoodList = [];
            self.initialData.forEach(function(locationItem) {
                const newPlace = self.Place(locationItem);
                neighborhoodList.push(newPlace);
            });
            localStorage.setItem(
                'locations', JSON.stringify(neighborhoodList)
            );
            localStorage.setItem('idCount', self.initialData.length);
        }
    }

    // Gets locations from localStorage
    getLocations() {
        const locations = localStorage.getItem('locations');
        return JSON.parse(locations);
    }

    // Stores locations in localStorage
    setLocations(neighborhoodList) {
        const self = this;
        const locations = [];
        neighborhoodList.forEach(function(locationItem) {
            locations.push(self.Place(locationItem));
        });
        localStorage.setItem('locations', JSON.stringify(locations));
    }

    // Gets current place from local storage
    getCurrentPlace() {
        const currentPlace = localStorage.getItem('currentPlace');
        return JSON.parse(currentPlace);
    }

    // Stores current place in local storage
    setCurrentPlace(currentPlace) {
        let place;
        if (currentPlace == null) {
            place = null;
        } else {
            place = this.Place(currentPlace);
        }
        localStorage.setItem('currentPlace', JSON.stringify(place));
    }

    // Get id count from local storage
    getIdCount() {
        const idCount = localStorage.getItem('idCount');
        return JSON.parse(idCount);
    }

    // Store id count in local storage
    setIdCount(idCount) {
        localStorage.setItem('idCount', JSON.stringify(idCount));
    }
}
