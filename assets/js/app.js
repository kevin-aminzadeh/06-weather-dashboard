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

// Open Weather API Interface Service Class Definition
class WeatherAPIService {
  constructor() {
    this.initSubscriptions();
  }

  initSubscriptions() {
    // Subscribe to the "submitSearch" event on the event bus so we know when to request forecast data from Open Weather's API
    eventBus.subscribe("WeatherAPIService", "submitSearch", this.getForecast);

    // Subscribe to the "submitSearch" event on the event bus so we know when to request forecast data from Open Weather's API
    eventBus.subscribe(
      "WeatherAPIService",
      "searchItemClicked",
      this.getForecast
    );
  }

  async getForecast(city) {
    const res = await $.ajax({
      url: "https://api.openweathermap.org/data/2.5/onecall",
      method: "GET",
      data: {
        lat: city.coordinates.lat,
        lon: city.coordinates.lng,
        units: "metric",
        exclude: "minutely,hourly",
        appid: "efaf1d8fa4ca195ff9a3f999a58db79f",
      },
    });
    res.city = city.name;

    eventBus.publish("weatherDataReceived", res);
  }
}

/* || View Class Definitions || */

// Previous Searches View Class Definition
class PreviousSearchesView {
  constructor(rootEl) {
    this.rootEl = rootEl;
    this.template = document.createRange().createContextualFragment(`
      <!-- Sidebar -->
      <nav
        id="sidebarMenu"
        class="collapse col-md-3 col-lg-3 col-xl-2 bg-light sidebar d-md-block position-fixed"
      >
        <!-- Sidebar Content Wrapper -->
        <div class="position-sticky pt-5 pt-md-3">
          <!-- Search History Section -->

          <ul class="nav flex-column pt-2 pt-md-0" id="previous-search-list">
            <h2 class="h4 nav-link ">Previous Searches</h2>
            <p class="fs-6 nav-link text-center text-muted" id="search-placeholder-text">No data to display.</p>
          </ul>

        </div>
      </nav>
    `);

    this.init();
  }

  init() {
    this.rootEl.append(this.template);
    eventBus.subscribe(
      "PreviousSearchesView",
      "previousSearchesRetrieved",
      this.render
    );

    eventBus.subscribe(
      "PreviousSearchesView",
      "previousSearchItemAdded",
      this.update
    );
  }

  update(data) {
    // Store a reference to the placehoder text element
    const placeHolderText = document.getElementById("search-placeholder-text");

    // Hide the placeholder text element
    placeHolderText.classList.add("invisible");

    const ul = document.getElementById("previous-search-list");
    const li = document.createElement("li");
    li.classList.add("nav-item", "d-grid");

    const btn = document.createElement("button");
    btn.classList.add(
      "list-group-item",
      "list-group-action",
      "text-start",
      "text-secondary"
    );
    btn.innerText = data.city;
    btn.dataset.lat = data.coordinates.lat;
    btn.dataset.lon = data.coordinates.lon;
    btn.addEventListener("click", () => {
      const city = {
        name: data.city,
        coordinates: {
          lat: btn.dataset.lat,
          lng: btn.dataset.lon,
        },
      };

      eventBus.publish("searchItemClicked", city);
    });
    li.append(btn);
    ul.append(li);
  }

  render(data) {
    // Store a reference to the placehoder text element
    const placeHolderText = document.getElementById("search-placeholder-text");

    // If previous search data exists, hide the placeholder text element
    if (data.length) {
      placeHolderText.classList.add("invisible");
    }

    // Store a reference to the previous searches <ul> element
    const ul = document.getElementById("previous-search-list");

    // For each previous search object in LocalStorage, generate an <li> element with its corresponding data and append it to the <ul>
    for (const item of data) {
      const li = document.createElement("li");
      li.classList.add("nav-item", "d-grid");

      const btn = document.createElement("button");
      btn.classList.add(
        "list-group-item",
        "list-group-action",
        "text-start",
        "text-secondary"
      );
      btn.innerText = item.city;
      btn.dataset.lat = item.coordinates.lat;
      btn.dataset.lon = item.coordinates.lon;
      btn.addEventListener("click", () => {
        const city = {
          name: item.city,
          coordinates: {
            lat: btn.dataset.lat,
            lng: btn.dataset.lon,
          },
        };

        eventBus.publish("searchItemClicked", city);
      });
      li.append(btn);

      ul.append(li);
    }
  }
}

/* || Controller Class Definitions || */
