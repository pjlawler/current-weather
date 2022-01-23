const duluth = {
    searched_name: "Duluth, MN",
    formatted_name: "Duluth, MN, USA",
    lat: 46.50,
    long: -94.0
};

const edina = {
    searched_name: "Edina, MN",
    formatted_name: "Edina, MN, USA",
    lat: 44.9179504206,
    long:  -93.3459846855
};



function getWeatherData(geoLocation) {

    // Gets the weather data for the passed in geolocation, once the data is receive it
    // will then execute the display weather function and pass the weather data to it.

    const geoCity = "lat=" +geoLocation.lat + "&lon=" + geoLocation.long;
    const apiUrl = "https://api.openweathermap.org/data/2.5/onecall?" + geoCity + "&units=imperial&appid=ba8c04ec0a22a04686b4f84de12580c6"



    fetch(apiUrl).then(function(response) {
       if(response.ok) {
           response.json().then(function(data) {
                console.log(data);
                const wxData = [];
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

                wxData.push(current_conditions);

                for (let i = 0; i < 6; i++) {
                    forcast_conditions = {
                        date: data.daily[i].dt,
                        temp: data.daily[i].temp.max,
                        wind_speed: data.daily[i].wind_speed,
                        wind_direction: data.daily[i].wind_deg,
                        humidity: data.daily[i].humidity,
                        weather: data.daily[i].weather[0]
                    }
                    wxData.push(forcast_conditions);
                }
                console.log(wxData);
                displayWeather(wxData);
           });
        } 
    });
};




function getGeoLocationInfo(location) {

    // If the user searches for a particular city, it will look up the geolocation information

    const apiUrl = "https://api.opencagedata.com/geocode/v1/json?q=" + location + "&key=36e0e7a2b5be4c5ab5d0a1055a5a7b06&language=en&pretty=1"

    fetch(apiUrl).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                console.log(data.results[0]);
                resultObj = {
                    searched_name: location,
                    formatted_name: data.results[0].formatted,
                    lat: data.results[0].geometry.lat,
                    long: data.results[0].geometry.lng
                };
                getWeatherData(resultObj);
            });
        } 
     });

};


function displayWeather(weather) {
    if(!location) {
        return false;
    } 
 
    const currentContainerEl = document.querySelector("#current_conditions");
    const forecastContainerEl = document.querySelector("#forecast");
    
    // Display Current Conditions

    for(let i = 0; i < 7; i++) {
        const dateEl = document.createElement("div");
        const wxIconEl = document.createElement("img");
        const tempEl = document.createElement("div");
        const humidityEl = document.createElement("div");
        const wind_dirEl = document.createElement("div");
        const wind_speedEl = document.createElement("div");
        const uviEl = document.createElement("div");

        //Sets the conditions into the elements for display

        const current_block = document.createElement("div");
        const currentHeadlineEl = document.createElement("div");

        const iconImgEl = document.createElement("div");
        iconImgEl.setAttribute("id","icon_container");

        wxIconEl.setAttribute("src", " http://openweathermap.org/img/wn/" + weather[i].weather.icon + "@2x.png");
        wxIconEl.setAttribute("width", "50");
        
        const wxDataEl = document.createElement("div");
        wxDataEl.setAttribute("id", "data_container");


        tempEl.textContent =  "Temp: " + Math.round(parseFloat(weather[i].temp)) + String.fromCodePoint(0x2109);
        wind_dirEl.textContent = "Wind: " + direction(weather[i].wind_direction) + " @ " + Math.round(weather[i].wind_speed) + " MPH";
        humidityEl.textContent = "Humidity: " + weather[i].humidity + "%";
        uviEl.textContent = "UV Index: " + weather[i].uv_index;




        switch(i) {

            case 0:
                // Updates the current conditions for the searched location

                const current_dateEl = document.createElement("h2");
                current_dateEl.setAttribute("id", "#current_header");

                const updated_timeEl = document.createElement("h3");
                updated_timeEl.setAttribute("id", "#updated_time")
                
                // Sets the header to the current location and date
                current_dateEl.textContent = weather[0].city + " - " + moment.unix(weather[i].date).format("dddd M/D/YY");
                
                // Sets the sub-header to the last time it was updated
                updated_timeEl.textContent = "Last updated at: " + moment.unix(weather[i].date).format("Hmm") + " hours."; 

                // Puts the weather elements into the current conditions container
                currentHeadlineEl.appendChild(current_dateEl);
                iconImgEl.appendChild(wxIconEl);
                wxDataEl.appendChild(tempEl);
                wxDataEl.appendChild(wind_dirEl);
                wxDataEl.appendChild(humidityEl);
                wxDataEl.appendChild(uviEl);
                wxDataEl.appendChild(updated_timeEl);
                
                currentContainerEl.appendChild(currentHeadlineEl);
                

                break;
            case 1:
                // Skips the first forecast because that's the same day as the current
                break;
            
            default:

                // Updates the 5-day forecast cards

                const dateEl = document.createElement("div");
                const forecastCard = document.createElement("div");
                forecastCard.classList.add("forecast_card");
                 
                dateEl.textContent = moment.unix(weather[i].date).format("ddd") + " (" + moment.unix(weather[i].date).format("M/D") + ")";
                dateEl.classList.add("card_header");

                forecastCard.appendChild(dateEl)
                forecastCard.appendChild(wxIconEl);
                forecastCard.appendChild(tempEl);
                forecastCard.appendChild(wind_dirEl);
                forecastCard.appendChild(humidityEl);
                forecastContainerEl.appendChild(forecastCard);
        };    
    }

}


function direction(degrees) {
    
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
    }
    else {
        return "N";
    }
}


// getGeoLocationInfo("Minneapolis");

getWeatherData(edina);