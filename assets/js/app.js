// Global Variables
const rootEl = document.getElementById("app-root");
const resultsRootEl = document.getElementById("results-root");
let previousSearches = [];

/* || Abstract Utility Class Definitions || */

// PubSub Utility Class
class EventBus {
  constructor() {
    this.events = [];
  }

  publish(eventName, data) {
    // Check if subscriptions to this eventName exist in the events array
    if (!this.events[eventName]) return;

    console.log(
      `EVENT BUS: Broadcasting Published data for event "${eventName}" to subscribers.\n`
    );
    // If the event for which data is published has registered subscribers, iterate through its subscribers and pass the published data to their respective callback functions
    Object.getOwnPropertySymbols(this.events[eventName]).forEach(
      (subscriber) => {
        this.events[eventName][subscriber](data);
      }
    );
  }

  subscribe(componentName, eventName, callback) {
    // Generate a unique ID
    const id = Symbol("id");

    // If an event by this name doesn't already exist as an element in the subscriptions array, create one
    if (!this.events[eventName]) {
      this.events[eventName] = {};
    }

    // Register callback in event bus
    this.events[eventName][id] = callback;

    console.log(
      `EVENT BUS: ${componentName} just subscribed to event "${eventName}".`
    );
  }

  unsubscribe() {}
}

/* || Data Service Class Definitions || */

// Storage Abstract Service Class Definition
class AppStorageService {
  constructor() {
    this.init();
  }

  init() {
    console.log(`Initializing Storage Service...\n`);

    // Check if previous search data already exists in local storage
    if (
      localStorage.getItem("previousSearches") &&
      JSON.parse(localStorage.getItem("previousSearches")).length
    ) {
      previousSearches = JSON.parse(localStorage.getItem("previousSearches"));
    }

    // Publish the retrieved previous searches to the event bus for consumption by other components
    eventBus.publish("previousSearchesRetrieved", previousSearches);

    // Subscribe to Search Submission Events
    eventBus.subscribe("StorageService", "submitSearch", this.saveItem);
  }

  saveItem(data) {
    // Derive item data from received data
    const searchItem = {
      city: data.name,
      coordinates: { lat: data.coordinates.lat, lon: data.coordinates.lng },
    };

    // Check if the search item already exists in previous searches
    const entryAlreadyExists = previousSearches.findIndex((city) => {
      return JSON.stringify(city) == JSON.stringify(searchItem);
    });

    // If the new search item is unique, save it to the previous searches array
    if (entryAlreadyExists == -1) {
      previousSearches.push(searchItem);
      console.log(`Searched City saved!`);
      eventBus.publish(
        "previousSearchItemAdded",
        previousSearches[previousSearches.length - 1]
      );
    }

    // Update local storage to reflect the new data
    localStorage.setItem("previousSearches", JSON.stringify(previousSearches));
  }
}

// Google Places Autocomplete API Interface Service Class Definition
class PlacesAPIService {
  constructor() {
    // Instance Variables
    this.autocomplete;
    this.place;
    this.locationCoordinates;

    // Create a global reference to the initAutocomplete() method in order to allow the Google Places Autocomplete API to use it as a callback
    window.initAutocomplete = this.initAutocomplete.bind(this);
  }

  initAutocomplete() {
    this.autocomplete = new google.maps.places.Autocomplete(
      document.getElementById("search-input"),
      {
        types: ["(cities)"],
        componentRestrictions: { country: ["AU"] },
        fields: ["name", "geometry.location"],
      }
    );

    this.autocomplete.addListener("place_changed", () => {
      this.place = this.autocomplete.getPlace();
      this.locationCoordinates = JSON.parse(
        JSON.stringify(this.place.geometry.location)
      );

      if (!this.place.geometry) {
        // User did not select a prediction; reset the input field
        document.getElementById("search-input").placeholder = "Enter a city";
      } else {
        // Attach event listener to the search button
        document.getElementById("search-btn").addEventListener("click", () => {
          // Publish a "submitSearch" event to the event bus, using the selected city's coordinates as the event data

          eventBus.publish("submitSearch", {
            name: this.place.name,
            coordinates: JSON.parse(
              JSON.stringify(this.place.geometry.location)
            ),
          });
        });
      }
    });
  }
}

/* || View Class Definitions || */

/* || Controller Class Definitions || */
