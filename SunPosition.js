console.log( 'Hello, world!' );

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
    return rightAscensionFromHours(rad /(2*Math.PI) * 24)
}





var refreshPeriod = 1000;

var timer = setInterval(myOnLoad, refreshPeriod);

var loc = -1;

function getLocation(callback) {
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

function myOnLoad(){
    console.log("Starting OnLoad");

    var today = Date.now();

    var timeText = document.getElementById("dateTimeText");

    timeText.innerHTML = new Date().toLocaleString();

    //today = Date.UTC(2019,06,16,16);

    //30 days between 1970 and 2000
    var daysJ2000 = (today / 1000/365.25/24/3600 - 30) * 365.25;

    console.log(daysJ2000);

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
        shadowText.innerHTML = NaN;
        sunburnText.innerHTML = "But don't worry because you're definitely not getting burned";
    }
    else{
        var heightInput = document.getElementById("height");

        var shadowLength = parseFloat(heightInput.value) * Math.tan(degToRad(angle));

        shadowText.innerHTML = shadowLength.toPrecision(4);

        console.log("shadowLength", shadowLength)
        if (angle < 45){
            sunburnText.innerHTML = "Burn incoming";
        }
        else{
            sunburnText.innerHTML = "You're probably safe";
        }
    }

}
    );
    console.log("Finished");
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
    console.log(d1,r1,d2,r2);
    var a = (Math.sin(0.5*(d2-d1)))**2 + Math.cos(d1)*Math.cos(d2) * (Math.sin(0.5*(r2-r1)))**2;
    console.log(a);
    return 2 * Math.asin(Math.sqrt(a));
}
