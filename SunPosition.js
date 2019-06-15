console.log( 'Hello, world!' );

function degToRad(deg)
{
    return deg /180 * Math.PI;
}

function radToDeg(rad)
{
    return rad * 180 / Math.PI;
}

function rightAscensionFromRad(rad)
{
    var h = rad /(2*Math.PI) * 24;
    var ph = Math.floor(h);
    h = h - ph;
    var m = h*60;
    var pm = Math.floor(m);
    var ps = ((m - pm)*60).toFixed(2);

    return ph.toString() + "h " + pm.toString() + "m " + ps.toString() + "s";
}

var today = Date.now();

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

var RA = Math.atan2(y,x);

var printRA = rightAscensionFromRad(RA);

var DEC = radToDeg(Math.asin(Math.sin(eclipticObliquity) * Math.sin(eclipticLongitude)).toFixed(3));

console.log(printRA, DEC);