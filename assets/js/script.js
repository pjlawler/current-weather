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



function requestWeatherData(geoLocation) {

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
    
    const locationEl = document.querySelector("#location");
    const currentTempEl = document.querySelector("#current_temp");
    const currentDateEl = document.querySelector("#current_date");
    const currentConditionsIconEl = document.querySelector("#current_icon");
    const currentWindEl = document.querySelector("#current_wind");
    const currentHumidity = document.querySelector("#current_humidity");
    const currentUvi = document.querySelector("#current_uvi");

    // Poplulates the current condtions
    locationEl.textContent = weather[0].city
    currentTempEl.textContent = Math.round(parseFloat(weather[0].temp)) + String.fromCodePoint(0x2109);
    currentDateEl.textContent =  moment.unix(weather[0].date).format("dddd M/D/YY");
    currentConditionsIconEl.setAttribute("src", " http://openweathermap.org/img/wn/" + weather[0].weather.icon + "@2x.png");
    currentWindEl.textContent = direction(weather[0].wind_direction) + " " + Math.round(weather[0].wind_speed) + " mph";
    currentHumidity.textContent = weather[0].humidity + "%";
    currentUvi.textContent = weather[0].uv_index;


    // Populates the 5-Day forecast
    for(let i = 2; i < 7; i++) {
        const parentEl = document.querySelector("[data-day='" + (i - 1) + "']");
        const day_dateEl = parentEl.querySelector("h3");
        const day_tempEl = parentEl.querySelector(".high_temp");
        const day_imgEl = parentEl.querySelector("img");
        const day_windEl = parentEl.querySelector(".wind");
        const day_humidityEl = parentEl.querySelector(".humidity")
        
        
        day_dateEl.textContent = moment.unix(weather[i].date).format("ddd") + " (" + moment.unix(weather[i].date).format("M/D") +")" ;
        day_tempEl.textContent = Math.round(parseFloat(weather[i].temp)) + String.fromCodePoint(0x2109);
        day_imgEl.setAttribute("src", " http://openweathermap.org/img/wn/" + weather[i].weather.icon + "@2x.png");
        day_windEl.textContent = direction(weather[i].wind_direction) + " " + Math.round(weather[i].wind_speed) + " mph";
        day_humidityEl.textContent = weather[i].humidity + "%";


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
    } else {
        return "N";
    }
}


// getGeoLocationInfo("Minneapolis");

requestWeatherData(edina);

