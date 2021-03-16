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
  }

  saveItem(data) {}
}

/* || View Class Definitions || */

/* || Controller Class Definitions || */
