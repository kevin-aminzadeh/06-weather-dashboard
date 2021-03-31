# Weather Dashboard

<p align="center">
  <img src="./assets/img/demo.gif" alt="JavaScript Weather Dashboard Screenshot">
</p>

> <h2 align="center"><a  href="https://kevin-aminzadeh.github.io/weather-dashboard/">Live Demo</a></h2>

## Table of Contents

- [Overview](#overview)
- [Acceptance Criteria](#acceptance-criteria)
- [Approach](#approach)
- [Technologies Used](#technologies-used)
- [License](#license)

## Overview

This project is a weather dashboard web app built using vanilla JavaScript and both the OpenWeather and Google Places web APIs. The purpose of the project is to demonstrate an ability to effectively consume and utilize third-party web APIs.

The application's search interface utilizes the Google Places API to provide type-ahead search functionality, providing the user with helpful suggestions os they type. This feature is also used as a basic form of validation, ensuring the user's search query corresponds to a real city for which geometric coordinates can then be retrieved.

Coordinates retrieved from the Google Places API are then passed to the OpenWeather API in a query, the results from which are filtered and displayed on screen. After each search, the name and coordinates of the city are stored in local storage and presented in the "Previous Searches" section of the page.

## Acceptance Criteria

The following criteria provided in the project brief were used as the requirements specifications when building this project:

```
GIVEN a weather dashboard with form inputs
WHEN I search for a city
THEN I am presented with current and future conditions for that city and that city is added to the search history
WHEN I view current weather conditions for that city
THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
WHEN I view the UV index
THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
WHEN I view future weather conditions for that city
THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity
WHEN I click on a city in the search history
THEN I am again presented with current and future conditions for that city
WHEN I open the weather dashboard
THEN I am presented with the last searched city forecast
```

## Approach

As part of a learning exercise about various cross component/sub-system communication patterns, a basic implementation of the sub-pub messaging pattern was adopted and used in the application.

The various classes/components of the app interact with each other through the use of a simple `EventBus` class. The Event Bus maintains a registry of internal events, as well as the components who are subscribed to those events and their callbacks.

In theory, this approach allows better decoupling of components and enforces the principles of abstraction and separation of concerns. However, in this fairly naive implementation of the pattern it is questionable wether any benefit is gained.

This is due to a combination of the following factors:

- The application is quite simple
- All application components are contained in a single file
- All of the application's various subclasses with the exception of the `EventBus` class are contained in the `App` controller class. (Although were this not the case, as a result of the pub-sub implementation, they would be able to function and communicate with one and other just the same).

## Future Improvements

Due to the simplicity of the current implementation of this project, there are quite a lot of possible future improvements that could be made.

Some of the more obvious areas of improvement include:

- Proper input validation
- Better decoupling of application components
- Providing the user with a way to clear previous searches
- UI/UX improvements
- User Authentication/Authorization
- Persistent Server-Side Storage

## Technologies Used

- HTML5
- CSS3
- JavaScript ES6
- [Bootstrap v5.0](https://getbootstrap.com/docs/5.0/getting-started/introduction/)
- [Google Places Web API](https://developers.google.com/maps/documentation/places/web-service/overview)
- [OpenWeather's One Call Web API](https://openweathermap.org/api/one-call-api)

## License

This project is licensed under the terms of the MIT license.
