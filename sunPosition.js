function degToRad(deg)
{
    return deg /180 * Math.PI;
}

function radToDeg(rad)
{
    return rad * 180 / Math.PI;
}

function rightAscensionFromHours(hours, precision)
{
    var h = hours;
    var ph = Math.floor(h);
    h = h - ph;
    var m = h*60;
    var pm = Math.floor(m);
    var ps = ((m - pm)*60).toFixed(precision === undefined ? 5 : precision);

    return ph.toString() + "h " + pm.toString() + "m " + ps.toString() + "s";
}

function rightAscensionFromRad(rad, precision)
{
    return rightAscensionFromHours(rad /(2*Math.PI) * 24, precision)
}

function getMyLocation(callback) {
    if (loc === -1) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(x => {loc=x;});
            navigator.geolocation.getCurrentPosition(callback);
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }
    else {
        callback(loc);
    }
}

function getLocation(callback) {
    let locationradio = document.querySelector('input[name="location"]:checked').value;
    switch(locationradio) {
        case "auto" :
            getMyLocation(callback);
            break;
        case "manual" :
            let input_latitude = document.getElementById("input-latitude").value;
            let input_longitude = document.getElementById("input-longitude").value;
            callback({coords: {latitude: parseFloat(input_latitude), longitude: parseFloat(input_longitude)}})
            break;
        case "google":
            let input_map_latitude = document.getElementById("locationMapLat").innerHTML;
            let input_map_longitude = document.getElementById("locationMapLong").innerHTML;
            callback({coords: {latitude: parseFloat(input_map_latitude), longitude: parseFloat(input_map_longitude)}})
            break;
        default:
            callback({coords: {latitude: 0, longitude: 0}})
    }
}

function parseDateTime(date, time) {
    var b = date.split(/\D/);
    var a = time.split(":");
    return new Date(b[0], --b[1], b[2], a[0], a[1], a[2]);
}


function myOnLoad(){
    var today = new Date();


    var inputDate = document.getElementById("input-date");
    var inputTime = document.getElementById("input-time");

    if (inputDate !== null){
        today = parseDateTime(inputDate.value, inputTime.value);
        //console.log("INSIDE", today);
    }

    //console.log("OUTSIDE", today);
    var daysJ2000 = (today / 1000/365.25/24/3600 - 30) * 365.25;

    var timeText = document.getElementById("dateTimeText");

    if (timeText !== null)
        timeText.innerHTML = today.toLocaleString();

    //today = Date.UTC(2019,06,16,16);

    //30 days between 1970 and 2000


    var sunLongitude = 280.461 + 0.9856474*daysJ2000;

    sunLongitude = degToRad(sunLongitude % 360);

    var anomaly = 357.528 + 0.9856003 * daysJ2000;

    anomaly = degToRad(anomaly % 360);

    var eclipticLongitude = sunLongitude + degToRad(1.915 * Math.sin(anomaly) + 0.020 * Math.sin(2*anomaly));

    var eclipticObliquity = degToRad(23.439 - 0.0000004*daysJ2000);

    var y = Math.cos(eclipticObliquity) * Math.sin(eclipticLongitude);

    var x = Math.cos(eclipticLongitude);

    var sunRA = Math.atan2(y,x);

    var sunDEC = radToDeg(Math.asin(Math.sin(eclipticObliquity) * Math.sin(eclipticLongitude)).toFixed(3));

    getLocation(x =>
        {
            var latText = document.getElementById("locationLatitude");
            var longText = document.getElementById("locationLongitude");

            latText.innerHTML = x.coords.latitude.toFixed(2).toString() + (x.coords.latitude > 0 ? "N" : "S");
            longText.innerHTML = x.coords.longitude.toFixed(2).toString() + (x.coords.longitude > 0 ? "E" : "W");


            var zenDecText = document.getElementById("ZenithDec");
            var zenRAText = document.getElementById("ZenithRA");

            zenDecText.innerHTML = x.coords.latitude.toFixed(2).toString();
            zenRAText.innerHTML = rightAscensionFromHours(localSiderealTime(x, daysJ2000),1);


            var sunDecText = document.getElementById("sunDec");
            var sunRAText = document.getElementById("sunRA");

            sunDecText.innerHTML = sunDEC.toFixed(2);
            sunRAText.innerHTML = rightAscensionFromRad(sunRA,2);


            var angleText = document.getElementById("angleValue");

            var angle = radToDeg(haversine(degToRad(x.coords.latitude), degToRad(localSiderealTime(x, daysJ2000)*15), degToRad(sunDEC), sunRA));
            angleText.innerHTML = angle.toFixed(3);

            var shadowText = document.getElementById("outputHeight");
            var sunburnText = document.getElementById("sunBurn");

            if (angle > 90) {
                shadowText.innerHTML = "∞";
                sunburnText.innerHTML = "But don't worry because you're definitely not getting burned";
            }
            else{
                var heightInput = document.getElementById("height");

                var shadowLength = parseFloat(heightInput.value) * Math.tan(degToRad(angle));

                shadowText.innerHTML = shadowLength.toPrecision(4);

                if (angle < 45){
                    sunburnText.innerHTML = "Burn incoming";
                }
                else{
                    sunburnText.innerHTML = "You're probably safe";
                }
            }
        }
    );
}

function initMap() {
    // The location of Uluru
    var London = {lat: 51, lng: 0};
    // The map, centered at Uluru
    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 4, center: London});
    // The marker, positioned at Uluru
    var marker = new google.maps.Marker({position: London, map: map});


    google.maps.event.addListener(map, "click", function (e) {

        //lat and lng is available in e object
        var latLng = e.latLng;
        document.getElementById('locationMapLat').innerHTML = latLng.lat().toFixed(2) + (latLng.lat()>0 ? "N" : "S");
        document.getElementById('locationMapLong').innerHTML = latLng.lng().toFixed(2) + (latLng.lng()>0 ? "E" : "W");
        marker.setPosition(latLng);
    });
}


function changeTimeButton(){
    console.log("Changing Time");

    var d = new Date();
    var datestring =   d.getFullYear() + "-" + (d.getMonth()+1).toString().padStart(2, "0") + "-" + d.getDate().toString().padStart(2, "0") ;
    var timestring = d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0");

    document.getElementById('dateTime').innerHTML = `Time travel to:
    <label for="input-date">Date:</label>
    <input type="date" id="input-date" value="` + datestring + `"/>
        <p style="display: inline-block"></p>

        <label for="input-time">Time:</label>
    <input type="time" id="input-time" value="` + timestring + `"/>
        <p style="display: inline-block"></p>
        <button type="button" onclick="nowTimeButton()">Now</button>
    `
}

function nowTimeButton(){
    console.log("Going to now");
    document.getElementById('dateTime').innerHTML = `
        <p id="dateTime">The current date and time is <span class="avoidwrap"><span id="dateTimeText" >0</span></span> <button type="button" onclick="changeTimeButton()">Change</button> </p>

    `
}

function localSiderealTime(location, daysJ2000) {
    //https://en.wikibooks.org/wiki/Astrodynamics/Time
    var days0 = Math.floor(daysJ2000);
    var hoursSinceNoon = (daysJ2000 - days0)*24;
    if (hoursSinceNoon >= 12){
        days0 = Math.floor(daysJ2000) + 0.5;
    } else {
        days0 = Math.floor(daysJ2000) - 0.5;
    }

    var centuries = daysJ2000 / 36525;

    var GMST = (6.697374558 + 0.06570982441908*days0  + 1.00273790935*((hoursSinceNoon+12)%24) +  0.000026*(centuries**2))%24;
    GMST = GMST % 24;

    return GMST + location.coords.longitude / 15;

}

function haversine(d1,r1, d2,r2){
    var a = (Math.sin(0.5*(d2-d1)))**2 + Math.cos(d1)*Math.cos(d2) * (Math.sin(0.5*(r2-r1)))**2;
    return 2 * Math.asin(Math.sqrt(a));
}


var refreshPeriod = 50;

var timer = setInterval(myOnLoad, refreshPeriod);

var loc = -1;