export const Model = function() {
    const self = this;

    this.initialLocations = [
        {
            title: 'Space Needle',
            location: {lat: 47.6205124, lng: -122.3514743},
            description: "Observation tower and iconic landmark of the Pacific Northwest"
        },
        {
            title: 'Pike Place Market',
            location: {lat: 47.6097271, lng: -122.3465703},
            description: "Public market overlooking the Elliot Bay waterfront"
        },
        {
            title: 'Museum of Pop Culture',
            location: {lat: 47.621486, lng: -122.3503132},
            description: "Nonprofit museum dedicated to contemporary popular culture"
        },
        {
            title: 'Gum Wall',
            location: {lat: 47.6084288, lng: -122.3425538},
            description: "Brick wall alleyway covered in used chewing gum"
        },
        {
            title: 'Olympic Sculpture Park',
            location: {lat: 47.6165994, lng: -122.3574988},
            description: "Public park with outdoor sculpture museum and beach"
        },
        {
            title: 'Museum of Flight',
            location: {lat: 47.5179966, lng: -122.2985726},
            description: "The world's largest private air and space museum"
        },
        {
            title: 'Washington Park Arboretum',
            location: {lat: 47.6397989, lng: -122.2966592},
            description: "Popular tree garden in Washington Park"
        },
        {
            title: 'Seattle Central Library',
            location: {lat: 47.6067042, lng: -122.3346896},
            description: "Large public library with unique structural architecture"
        },
        {
            title: 'Seattle Cinerama',
            location: {lat: 47.6140096, lng: -122.3434987},
            description: "Lankmark movie theater in the Belltown neighborhood"
        },
        {
            title: 'Safeco Field',
            location: {lat: 47.5913944, lng: -122.3345161},
            description: "Baseball park of the Seattle Mariners"
        },
        {
            title: 'Century Link Field',
            location: {lat: 47.5951554, lng: -122.3338281},
            description: "Multipurpose stadium and home of the Seahawks and Sounders"
        }
    ];

    this.Place = function(data) {
        this.title = data.title;
        this.location = data.location;
        this.description = data.description;
    };

    this.setInitialData = function() {
        if (!localStorage.getItem('locations')) {
            const neighborhoodList = ko.observableArray([]);
            self.initialLocations.forEach(function(locationItem) {
                neighborhoodList.push(new self.Place(locationItem));
            });
            localStorage.setItem('locations', ko.toJSON(neighborhoodList()));
        }
    };

    this.getLocations = function() {
        const locations = localStorage.getItem('locations');
        return JSON.parse(locations);
    }

    this.getCurrentPlace = function() {
        const currentPlace = localStorage.getItem('currentPlace');
        return JSON.parse(currentPlace);
    }

    this.setCurrentPlace = function(currentPlace) {
        localStorage.setItem('currentPlace', ko.toJSON(currentPlace));
    }
}
