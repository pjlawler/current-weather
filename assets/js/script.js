
// Declares global variables for elements to be used with eventListeners
const search_text = document.querySelector("#searched_city");
const search_button = document.querySelector("#search_btn");
const recent_area = document.createElement("div");
const search_area = document.querySelector("#search_area");
recent_area.classList.add("recent_searches");

// Creates a global array variable to hold the recent search objects 
let recent_searches = [];

function requestWeatherData(geoLocation) {

    // This promise function requests the weather data from the API for the passed in geolocation, once the data is received it will then execute the display weather function by passing the weather data to it
    
    const geoCity = "lat=" + geoLocation.lat + "&lon=" + geoLocation.long;
    const apiUrl = "https://api.openweathermap.org/data/2.5/onecall?" + geoCity + "&units=imperial&appid=ba8c04ec0a22a04686b4f84de12580c6"
    
    // fetches the data via the apiURL and passed in lat/long
    fetch(apiUrl).then(function(response) {
       if(response.ok) {
           // if the fetch is sucessfull than the retreived data put into a an array that is then to the disaply weather data function to insert in the DOM.

            response.json().then(function(data) {
                const wxData = [];
                // Coverst the received data current conditions to a new object              
                const current_conditions = {
                    city: geoLocation.formatted_name.split(",")[0] + ", " + geoLocation.formatted_name.split(",")[1], 
                    date: data.current.dt,
                    temp: data.current.temp,
                    humidity: data.current.humidity,
                    wind_speed: data.current.wind_speed,
                    wind_direction: data.current.wind_deg,
                    uv_index: data.current.uvi,
                    weather: data.current.weather[0]
                };

                // Adds the ojbect to the wxData array into position (0)
                wxData.push(current_conditions);
                
                // Loops through the daily forecast for current and the next 5-days
                for (let i = 0; i < 6; i++) {
                    forcast_conditions = {
                        date: data.daily[i].dt,
                        temp: data.daily[i].temp.max,
                        wind_speed: data.daily[i].wind_speed,
                        wind_direction: data.daily[i].wind_deg,
                        humidity: data.daily[i].humidity,
                        weather: data.daily[i].weather[0]
                    }

                    // adds each sequentially to the wxData array
                    wxData.push(forcast_conditions);
                }

                // Sends the wxData to be displayed via the displayWeather function
                displayWeather(wxData);
           })
        } 
    })
    // Catches if there's a issue with the network when retreiving the wx
    .catch (function(error) {
        alert("Something went wrong trying to fetch the wx data, please try again! \n" + error)
        return false;
   });
};



function getGeoLocationInfo(location) {

    // If the user searches for a particular city, it fetch the geolocation information based on the city search the user submitted.  If the data is received it will then execute the requestWeatherData function.

    const apiUrl = "https://api.opencagedata.com/geocode/v1/json?q=" + location + "&key=36e0e7a2b5be4c5ab5d0a1055a5a7b06&language=en&pretty=1"

    // Fetches the geolocation data based on the city 
    fetch(apiUrl).then(function(response) {

        if(response.ok) {
            response.json().then(function(data) {
                
                // Handles in the event an empty set is received from the API
                if(data.results.length === 0) {
                    alert("Unable to get weather information for " + location + "! \nPlease re-enter a city to search.")
                    return false;
                }

                // If there's data in the array, then it uses the object in the first position of the array
                resultObj = {
                    searched_name: location,
                    formatted_name: data.results[0].formatted,
                    lat: data.results[0].geometry.lat,
                    long: data.results[0].geometry.lng
                };

                // Puts the search into the array and local storage
                update_recents(resultObj);

                // Gets the weather data
                requestWeatherData(resultObj);
            });
        }
        else {

            // In event the response from the is NOT OK, the it will alert the suer
            alert("Unable to get weather information for " + location + "! \nPlease re-enter a city to search.")
        } 
     })
     .catch(function(error) {
         // Catches if there is an error with the network when fetching the geolocation info
         alert("Something went wrong trying to fetch the city data, please try again! \n" + error)
         return false;
     });

};

function displayWeather(weather) {  
    
    // Declares the DOM element variables to be used to populate the wx data
    const locationEl = document.querySelector("#location");
    const currentTempEl = document.querySelector("#current_temp");
    const currentDateEl = document.querySelector("#current_date");
    const currentConditionsIconEl = document.querySelector("#current_icon");
    const currentWindEl = document.querySelector("#current_wind");
    const currentHumidity = document.querySelector("#current_humidity");
    const currentUvi = document.querySelector("#current_uvi");

    // Poplulates the current condtions to the DOM variables
    locationEl.textContent = weather[0].city
    currentTempEl.textContent = Math.round(parseFloat(weather[0].temp)) + String.fromCodePoint(0x2109);
    currentDateEl.textContent =  moment.unix(weather[0].date).format("dddd M/D/YY");
    currentConditionsIconEl.setAttribute("src", " http://openweathermap.org/img/wn/" + weather[0].weather.icon + "@2x.png");
    currentWindEl.textContent = direction(weather[0].wind_direction) + " " + Math.round(weather[0].wind_speed) + " mph";
    currentHumidity.textContent = weather[0].humidity + "%";
    currentUvi.textContent = uvi_formatted( weather[0].uv_index);
    currentUvi.style.background = uvi_colorCode(weather[0].uv_index);


    // Populates the 5-Day forecast to the 5-day forecast by iterating through each of the forecasts in the array
    for(let i = 2; i < 7; i++) {
        const parentEl = document.querySelector("[data-day='" + (i - 1) + "']");
        const day_dateEl = parentEl.querySelector("h3");
        const day_tempEl = parentEl.querySelector(".high_temp");
        const day_imgEl = parentEl.querySelector("img");
        const day_windEl = parentEl.querySelector(".wind");
        const day_humidityEl = parentEl.querySelector(".humidity")
        day_dateEl.textContent = moment.unix(weather[i].date).format("ddd") + " (" + moment.unix(weather[i].date).format("M/D") +")" ;
        day_tempEl.textContent = Math.round(parseFloat(weather[i].temp)) + String.fromCodePoint(0x2109);
        day_imgEl.setAttribute("src", " https://openweathermap.org/img/wn/" + weather[i].weather.icon + "@2x.png");
        day_windEl.textContent = direction(weather[i].wind_direction) + " " + Math.round(weather[i].wind_speed) + " mph";
        day_humidityEl.textContent = weather[i].humidity + "%";
    }
}

function update_recents(searchObj) {
    
    // If there's data in the searchObj it will add it to the recents and saves the array to local storage
    if(searchObj) {
        recent_searches.unshift(searchObj);
        window.localStorage.setItem("searches", JSON.stringify(recent_searches));
    }

    // Gets anything that is currently stored in localstorage, if nothing then it keeps the array as an empty array
    const localStore = JSON.parse(window.localStorage.getItem("searches"));
    recent_searches = localStore !== null ? localStore : [];

    // Clears out all of the recent elements in the DOM's recent_area
    while(recent_area.firstChild) {
        recent_area.removeChild(recent_area.firstChild);
    }

    // Keeps only the last 8 searchs in memory, pops the last element off until it's 8 or less
    while(recent_searches.length > 8) {
        recent_searches.pop();
    }

    // Iterates through the recents array and creates a button element for each and puts into the recents_area element
    for(let i = 0; i < recent_searches.length; i++) {
        const search = document.createElement("button")
        search.classList.add("recent_btn");
        search.setAttribute("data-index", i);
        search.textContent = recent_searches[i].formatted_name.split(",")[0] + ", " + recent_searches[i].formatted_name.split(",")[1];
        recent_area.appendChild(search);
    }

    // Adds the recent buttons to the DOM
    search_area.appendChild(recent_area);
}

function direction(degrees) {
    // Returns an abbreviated compass direction based on the degrees

    if(degrees => 25 && degrees < 65) {
        return "NE";
    } else if(degrees => 65 && degrees < 115) {
        return "E";
    } else if(degrees => 115 && degrees < 155) {
        return "SE";
    } else if (degrees => 155 && degrees < 215) {
        return "S";
    } else if (degrees => 215 && degrees < 245) {
        return "SW";
    } else if (degrees => 245 && degrees < 295) {
        return "W";
    } else if (degrees => 295 && degrees < 335) {
        return "NW"
    } else {
        return "N";
    }
}

function uvi_formatted(uvi) {
    // Formats the UV Index into a one decial float type string for standardization of the display
    u = Math.round(parseFloat(uvi) * 10)/10
    if (!u) {
        return "0.0";
    } else if (u.length < 3) {
        return u + ".0";
    }
    else {
        return u;
    }
}

function uvi_colorCode(level) {
    // Returns the HTML color name based on the UVI passed in
    if(level < 3) {
        return "lime";  
    } else if (level < 6) {
        return "yellow";
    } else {
        return "tomato"
    }
}


function start_up() {
    // Loads the localstoage and then displays the data in the last search if there is any
    update_recents();
    if (recent_searches === null || recent_searches.length === 0) {
        return false;
    }
    requestWeatherData(recent_searches[0]);
}


// Start Event Listeners 

// Listens for the search button to be clicked
search_button.addEventListener("click", function(e) {
    
    // If nothing is in the text input field, then just returns
    if (!search_text.value) {
        return false;
    }

    // Executes the fucnction to get the geo location of the city and then get the weather for that city
    getGeoLocationInfo(search_text.value);

    // Clears the text field and sets focus for another search
    search_text.value = "";
    search_text.focus();
});


// Listens for any recent search button to be clicked
recent_area.addEventListener('click', function(e) {

    // Gets the data_index of the button which is the index of the object in the recent_searches array and then requests the data if it was recent search button that was clicked
    const button_clicked = e.target.getAttribute("data-index");
    if(button_clicked) {
        requestWeatherData(recent_searches[button_clicked]);
    }
})

// Calls when the page is loaded/reloaded
start_up();