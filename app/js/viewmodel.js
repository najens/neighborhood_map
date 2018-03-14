import {Model} from './model';
import {makeIcon} from './maps/functions/makeicon';

export const ViewModel = function(gmaps, map) {
    const self = this;
    const model = new Model();

    // Get DOM elements
    const address = document.getElementById('google-search');
    const description = document.getElementById('description');
    const submitBtnAdd = document.getElementById('submit-btn-add');
    const submitBtnEdit = document.getElementById('submit-btn-edit');
    const filterInput = document.getElementById('filter-text');

    // Create an empty array for storing markers
    let markers = [];
    // Create styled icon images for markers
    const defaultIcon = makeIcon(gmaps, '0091ff');
    // Create "highlighted location" marker on mouseover
    const highlightedIcon = makeIcon(gmaps, 'c4e9ff');
    // Set image of marker clusterer
    const options = {imagePath: 'img/m'};
    // Set initial marker cluster settings
    const markerCluster = new MarkerClusterer(map, undefined, options);
    // Set initial bounds of map viewport
    const bounds = new gmaps.LatLngBounds();

    // This autocomplete is for use in the google search entry box
    const autocomplete = new gmaps.places.Autocomplete(address);
    let autoCompleteLocation = {};

    // Create icon images for marker
    const autoDefaultIcon = makeIcon(gmaps, 'ef5350');
    const autoHighlightedIcon = makeIcon(gmaps, 'ffff24');

    // Create marker for autocomplete
    const placeMarker = new gmaps.Marker({
        map: map,
        icon: autoDefaultIcon,
        animation: gmaps.Animation.DROP,
    });

    // Create an empty info window for locations
    const largeInfoWindow = new gmaps.InfoWindow();

    // Create ane empty infowindow for autocomplete
    const placeInfoWindow = new gmaps.InfoWindow();

    // Create empty foursquare object for storing info window data
    const foursquare = {};

    // Set neighborhood list as an empty ko observable array
    this.neighborhoodList = ko.observableArray([]);

    // Set current place to an empty ko observable
    this.currentPlace = ko.observable();

    // Set filter as an empty ko observable
    this.filter = ko.observable('');

    // Set visible markers to an empty ko observable array
    this.visibleLocations = ko.observableArray([]);

    // Set increment counter for new item ids
    this.idCount = ko.observable();

    // If locations and current place are in local storage
    // update ko observables or set them to default data
    this.init = (function() {
        // If locations list not already in local storage, add default data
        model.setInitialData();
        // Get locations from local storage
        const locations = model.getLocations();
        // Add each location item to the ko neighborhoodList
        locations.forEach(function(locationObj) {
            self.neighborhoodList.push(model.Place(locationObj));
        });
        // Get the current place from local storage
        const currentPlace = model.getCurrentPlace();
        self.currentPlace(currentPlace);
        // Get the current id count from local storage
        const idCount = model.getIdCount();
        self.idCount(idCount);

        // Add marker to each item in neighborhoodList
        self.neighborhoodList().forEach(function(locationObj) {
            // Get the position and title from the locations array
            const position = locationObj.location;
            const title = locationObj.name;
            // Create a marker
            const marker = new gmaps.Marker({
                position: position,
                title: title,
                icon: defaultIcon,
                animation: gmaps.Animation.DROP,
                place_id: locationObj.place_id
            });
            // Push the marker to array of markers
            markers.push(marker);
            // Extend the boundaries of the map for each marker
            bounds.extend(marker.position);
            // Create an onclick event to open an infowindow at each marker
            marker.addListener('click', function() {
                // If screen width is small and sidebar open, close the
                // sidebar before loading the infowindow
                if (($(window).width() < 500) &&
                    ($('#display').hasClass('toggled'))) {
                        $('#display').removeClass('toggled');
                }
                setTimeout(function(){
                    self.populateInfoWindow(marker, largeInfoWindow);
                }, 200);
            });
            // Set event listeners to change marker color on mouseover
            marker.addListener('mouseover', function() {
                this.setIcon(highlightedIcon);
            });
            marker.addListener('mouseout', function() {
                this.setIcon(defaultIcon);
            });
            // Store the marker in the ko neighborhoodList
            locationObj.marker = marker;
            // Store the location obj in the ko filter list
            self.visibleLocations.push(locationObj);
        });

        // Display markers on map by adding them to the marker clusterer
        markerCluster.addMarkers(markers);

        // Adjust map to fit bounds so all markers are visible
        map.fitBounds(bounds);

        // Bias the autocomplete to show results within map boundaries
        autocomplete.bindTo('bounds', map);

        // If map bounds change, update autocomplete bounds
        map.addListener('bounds_changed', function() {
            autocomplete.bindTo('bounds', map);
        });

        // Listen for the event fired when the user selects a prediction from
        // the picklist and retrieve more details for that place
        autocomplete.addListener('place_changed', function() {
            self.autocompletePlace(this);
        });

        submitBtnAdd.addEventListener('click', function(e) {
            self.addToStorage(autoCompleteLocation);
            e.preventDefault();
        });

        submitBtnEdit.addEventListener('click', function(e) {
            self.editStorage(autoCompleteLocation);
            e.preventDefault();
        });
    }());

    // When a place item is clicked set current place to clicked place
    // and add current place to local storage
    this.setPlace = function(clickedPlace) {
        self.currentPlace(clickedPlace);
        model.setCurrentPlace(clickedPlace);
    };

    // Adds updated neighborhoodList to local storage
    this.setLocations = function(locations) {
        model.setLocations(locations);
    }

    // Only display locations and markers that match filter input
    this.filterLocations = function() {
        const filter = self.filter().toLowerCase();
        self.visibleLocations.removeAll();
        markers = [];
        markerCluster.clearMarkers();
        self.neighborhoodList().forEach(function(locationObj) {
            locationObj.marker.setMap(null);
        });
        const filteredLocations = self.neighborhoodList().filter(
            locationObj =>
                locationObj.name.toLowerCase().indexOf(filter) >= 0
        );
        self.visibleLocations(filteredLocations);
        self.visibleLocations().forEach(function(locationObj) {
            markers.push(locationObj.marker);
        });
        markerCluster.addMarkers(markers);
    }

    // Modifies form modal when user clicks add location button
    this.addForm = function() {
        $('#form-title').text('Add Location');
        $('#submit-btn-edit').toggleClass('d-none', true);
        $('#submit-btn-add').toggleClass('d-none', false);
        $('#google-search').val('');
        $('#description').val('');
    }

    // Modifies form modal when user clicks edit button
    this.editForm = function(clickedPlace) {
        self.setPlace(clickedPlace);
        $('#form-title').text('Edit Location');
        $('#submit-btn-edit').toggleClass('d-none', false);
        $('#submit-btn-add').toggleClass('d-none', true);
        $('#google-search').val(clickedPlace.address);
        $('#description').val(clickedPlace.description);
    }

    // Modifies form modal when user clicks delete button
    this.deleteForm = function(clickedPlace) {
        self.setPlace(clickedPlace);
        const name = self.currentPlace().name;
        $('#delete-name').text(name);
    }

    // Deletes location from ko arrays and updates localStorage
    this.deleteLocation = function() {
        let locations = self.neighborhoodList();
        const currentPlace = self.currentPlace();
        const locationIndex = locations.findIndex(
            location => location.id == currentPlace.id
        );
        largeInfoWindow.close();
        locations[locationIndex].marker.setMap(null);
        locations.splice(locationIndex, 1);
        self.visibleLocations.removeAll();
        locations.forEach(function(locationObj) {
            self.visibleLocations.push(locationObj);
        });
        self.setLocations(locations);
        self.setPlace(null);
        self.filterLocations();
    }

    // Activate the appropriate marker when the user clicks a list item
    self.showInfo = function (placeItem) {
        google.maps.event.trigger(placeItem.marker, 'click');
    };

    // This function populates the infowindow when a marker is clicked
    this.populateInfoWindow = function(marker, infowindow) {
        const service = new gmaps.places.PlacesService(map);
        service.getDetails({
            placeId: marker.place_id,
        }, function(place, status) {
            if (status == gmaps.places.PlacesServiceStatus.OK) {
                // Set the marker prperty on this infowindow
                // so it isn't created again
                infowindow.marker = marker;
                // Send ajax request to foursquare and open
                // infowindow once data has been returned
                self.foursquareRequest(marker, infowindow, place);
            }
        })
    }

    // Send ajax request to foursquare and add results as well as data
    // from Google Places to the infowindow autocomplete object for
    // updating the ko arrays.
    this.foursquareRequest = function(marker, infowindow, place) {
        let url = 'https://api.foursquare.com/v2/venues/search?';
        const CLIENT_ID =
            'KYWCNFY04MNRGEAUYLUEOZ5W0D2K34RLKLOARYPIQMTLBO20';
        const CLIENT_SECRET =
            'DL0UB4GDXV50DWVJZOQR3GVR4PMX1UX4L5CNJ1CEO1QHF4VK';
        const ll = `${marker.position.lat()},${marker.position.lng()}`;
        const params = {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            v: '20180308',
            ll: ll,
            limit: 1,
            intent: 'match',
            name: place.name
        };
        // Add parameters to url
        $.each(params, function(key, value) {
            url += `${key}=${value}&`;
        });
        url = url.slice(0, -1);
        for (let i = 0; i < url.length; i++) {
            url = url.replace(' ', '%20');
        }

        // Send ajax request to foursquare
        $.getJSON(url)

        // Create infowindow and show on map after results received
        .done(function(data) {
            const result = data.response.venues[0];
            // Add foursquare data to own object to differentiate
            // from Google place object
            foursquare.name = result.name;
            foursquare.phone = result.contact.formattedPhone;
            foursquare.address = result.location.formattedAddress;
            foursquare.categories = [];
            result.categories.forEach(function(item) {
                foursquare.categories.push(item.name);
            });
            foursquare.url = result.url;
            // Create html to display in infowindow
            let innerHTML = '<div class="p-2">';
            // If foursquare result has name add to infowindow
            if (foursquare.name) {
                innerHTML += `<strong>${foursquare.name}</strong>`;
                // If this is a new location, add foursquare name
                // to autocomplete object
                if (autoCompleteLocation.location) {
                    autoCompleteLocation.name = place.name;
                }
            }

            // If foursquare result has categories add to infowindow
            if (foursquare.categories) {
                foursquare.categories.forEach(function(category) {
                    innerHTML += `<br>${category}`;
                });
            }

            // If Google place result has photo, add to infowindow
            if (place.photos) {
                innerHTML += `<br><br><img src="${place.photos[0].getUrl(
                    {maxWidth: 200})}" class="text-center"><br>`;
            }

            // If there is contact information, add
            // contact header to infowindow
            if (foursquare.address || foursquare.phone ||
                    place.formatted_phone_number || foursquare.url) {
                        innerHTML += `<br><strong>Contact</strong>`;
            }

            // If foursquare result hass address, add to infowindow
            if (foursquare.address) {
                foursquare.address.forEach(function(addressPart) {
                    innerHTML += `<br>${addressPart}`;
                });
            }

            // If foursquare result has phone number, add to infowindow.
            // Otherwise add the Google place phone number if it exists
            if (foursquare.phone) {
                innerHTML += `<br>${foursquare.phone}`;
            } else if (place.formatted_phone_number) {
                innerHTML += `<br>${place.formatted_phone_number}`;
            }

            // If foursquare result has url, add website to infowindow
            if (foursquare.url) {
                innerHTML += `<br><a href="${foursquare.url}">Website</a>`;
            }

            // If Google place result hour information, add to infowindow
            if (place.opening_hours) {
                innerHTML += `<br><br><strong>Hours:</strong><br>
                    ${place.opening_hours.weekday_text[0]}<br>
                    ${place.opening_hours.weekday_text[1]}<br>
                    ${place.opening_hours.weekday_text[2]}<br>
                    ${place.opening_hours.weekday_text[3]}<br>
                    ${place.opening_hours.weekday_text[4]}<br>
                    ${place.opening_hours.weekday_text[5]}<br>
                    ${place.opening_hours.weekday_text[6]}`;
            }

            innerHTML += '</div>';
            // Set new html in infowindow
            infowindow.setContent(innerHTML);
            // Set infowindow position to marker's position
            infowindow.setPosition(marker.getPosition());
            // Open infowindow
            infowindow.open(map);
            // Center map on marker's position
            map.setCenter(marker.getPosition());
            // Adjust marker position if sidebar showing
            if ($('#display').hasClass('toggled')) {
                map.panBy(125, -300);
            } else {
                map.panBy(0, -300);
            }
            // Zoom in on infowindow if not already zoomed in
            if (map.getZoom() < 15) {
                map.setZoom(15);
            }
            // Clear marker property from infowindow when it is closed
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        })

        // If the foursquare request failed, alert user and display
        // error message in browser's developer console
        .fail(function(err) {
            console.log(err);
            // const error = err.responseJSON.meta;
            // const code = error.code;
            // const message = error.errorDetail;
            // alert(`API Request Error. Please see browser \
            //       developer console for details.`
            // );
            // console.log(`Error ${code}: ${message}`);
        });
    }

    // This function fires when the user selects a prediction from the
    // autocomplete. It retrieve more details for the location
    // and adds a marker and infowindow to the map.
    this.autocompletePlace = function(autocomplete) {
        // Remove marker from map
        placeMarker.setMap(null);
        // Get more info about selected place
        const place = autocomplete.getPlace();
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert(`No details available for input: ${place.name}`);
            return;
        }
        // Create a marker for the place and add it to the map
        self.createMarkerForPlace(place);
    }

    // This function creates a marker and displays an
    // infowindow after autocomplete input changes
    this.createMarkerForPlace = function(place) {
        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(15);
        }
        // Store place position and id in marker object
        placeMarker.setPosition(place.geometry.location);
        placeMarker.place_id = place.place_id;
        // Create location object that will be added to ko arrays
        const lat = placeMarker.position.lat();
        const lng = placeMarker.position.lng();
        const location = {lat: lat, lng: lng};
        // Add location and id to autocomplete location object
        autoCompleteLocation.location = location;
        autoCompleteLocation.place_id = placeMarker.place_id;
        // Display infowindow if screen is not too small
        if (!($(window).width() < 500) &&
            ($('#display').hasClass('toggled'))) {
                placeMarker.infowindow = self.populateInfoWindow(
                    placeMarker, placeInfoWindow
                );
                largeInfoWindow.close();
        }
        // Add marker to map
        placeMarker.setMap(map);
        // Set event listeners to change marker color on mouseover
        placeMarker.addListener('mouseover', function() {
            this.setIcon(autoHighlightedIcon);
        });
        placeMarker.addListener('mouseout', function() {
            this.setIcon(autoDefaultIcon);
        });
        // If marker is clicked, display infowindow
        placeMarker.addListener('click', function() {
            if (placeInfoWindow.marker == this) {
                console.log('This infowindow is already on the marker!');
            } else {
                placeMarker.infowindow =
                    self.populateInfoWindow(placeMarker, placeInfoWindow);
                placeInfoWindow.open(map, placeInfoWindow.marker);
            }
        });
        // If infowindow is closed, remove marker from map
        gmaps.event.addListener(placeInfoWindow,'closeclick',function(){
           placeMarker.setMap(null);
        });
    }

    // This function is fired when the user hits the submit button
    // and updates the ko array and adds the marker to the map.
    this.addToStorage = function(newLocation) {
        // Check that all of the necessary information
        // has been filled out by the user
        if (address) {
            newLocation.address = address.value;
        }

        if (description) {
            newLocation.description = description.value;
        }

        if (!(newLocation.address && newLocation.name &&
            newLocation.place_id && newLocation.location)) {
                alert('Please select a Google Maps location!');
                return;
        }

        if (!newLocation.description) {
            alert('Please enter a description!');
            return;
        }

        // Create a marker for the new location
        self.newMarker(newLocation);
        let locations = self.neighborhoodList();
        // Update idCount and store in local storage
        const idCount = self.idCount() + 1;
        self.idCount(idCount);
        model.setIdCount(self.idCount());
        // Give the new loctation an id
        newLocation.id = self.idCount();
        // Store new location as currentPlace
        self.setPlace(newLocation);
        // Add new location to ko array
        locations.push(newLocation);
        // Reset autocomplete object
        autoCompleteLocation = {};
        // Add new location array to localStorage
        self.setLocations(locations);
        // Clear form input boxes
        address.value = '';
        description.value = '';
        // Update location list and markers
        self.filterLocations();
        // Dismiss form modal
        $('#myModal').modal('hide');
    }

    // This function is fired when the user hits the submit button
    // and updates the ko array and adds the marker to the map.
    this.editStorage = function(editedLocation) {
        if (address) {
            editedLocation.address = address.value;
        }

        if (description) {
            editedLocation.description = description.value;
        }

        if (!(editedLocation.address && editedLocation.name &&
            editedLocation.place_id && editedLocation.location)) {
                alert('Please select a Google Maps location!');
                return;
        }

        if (!editedLocation.description) {
            alert('Please enter a description!');
            return;
        }

        // If location name changed, create new marker, otherwise,
        // set the currentPlace marker as the edited location marker.
        if (self.currentPlace().name !== editedLocation.name) {
            self.newMarker(editedLocation);
        } else {
            editedLocation.marker = currentPlace().marker;
        }

        let locations = self.neighborhoodList();
        // Set the currentPlace id as the edited location id
        editedLocation.id = self.currentPlace().id;
        // Store edited locatio as current place
        self.setPlace(editedLocation);
        // Get the index of the location in the ko array
        const locationIndex = locations.findIndex(location =>
            location.id == editedLocation.id);
        // Replace old location with the edited location
        locations[locationIndex] = editedLocation;
        // Reset the autocomplete object
        autoCompleteLocation = {};
        // Add new location array to localStorage
        self.setLocations(locations);
        // Clear form input boxes
        address.value = '';
        description.value = '';
        // Update location list and markers
        self.filterLocations();
        // Dismiss form modal
        $('#myModal').modal('hide');
    }

    // Create a new marker when a location is added or edited
    this.newMarker = function(newLocation) {
        // Get the position and name from the locations array
        const position = newLocation.location;
        const title = newLocation.name;
        // Create new marker
        const marker = new gmaps.Marker({
            position: position,
            title: title,
            icon: defaultIcon,
            animation: gmaps.Animation.DROP,
            place_id: newLocation.place_id
        });

        // Create a click event to open an infowindow on marker
        marker.addListener('click', function() {
            // If screen width is small and sidebar open, close the
            // sidebar before loading the infowindow
            if (($(window).width() < 500) &&
                ($('#display').hasClass('toggled'))) {
                    $('#display').removeClass('toggled');
            }
            setTimeout(function(){
                self.populateInfoWindow(marker, largeInfoWindow);
            }, 200);
        });
        // Set event listeners to change marker color on mouseover
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });
        // Add marker to new or edited location object
        newLocation.marker = marker;
    }
}
