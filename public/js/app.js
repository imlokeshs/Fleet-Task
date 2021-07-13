/**
 *
 *Filename : app.js
 *@description This JS file has functions for mapping event
 * Author : Logesh
 **/

/*
|--------------------------------------------------------------------------
| Declare global variables
|--------------------------------------------------------------------------
*/
var objectID = "";
var totalDistance = "";
var storeLatLong = [];
let latLong = {};

/*
|--------------------------------------------------------------------------
| API KEY
|--------------------------------------------------------------------------
*/
const mapAPI = "Gamk6viBYo5tDnM2VN-lrZ4GHnI87z-k_1ipBiMWMec";
/*
|--------------------------------------------------------------------------
| Declare global Functions
|--------------------------------------------------------------------------
*/
//Loader for request & response
$(document).ajaxSend(function() {
    $("#overlay").fadeIn(300);
});

//Bootstrap DatePicker
$(".date").datepicker({
    format: "yyyy-mm-dd",
    autoclose: true,
    orientation: "bottom",
    todayHighlight: true,
});

/**
 * @function
 * @name getCSRFtoken
 * @description This is used to get CSRF token for ajax call
 **/
function getCSRFtoken() {
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": jQuery('meta[name="csrf-token"]').attr("content"),
        },
    });
}

/**
 * @function
 * @name removeSingleQuotes
 * @description Removes single quotes from string
 *
 **/
function removeSingleQuotes($value) {
    var outputStr = $value.replace(/'/g, "");
    return outputStr;
}

/**
 * @function
 * @name errorMsg
 * @description Display error messages on toast
 **/
function errorMsg() {
    $(".alert").show();
    setTimeout(function() {
        $(".alert").hide();
    }, 2000);
}

/**
 * @function
 * @name loaderFadeOut
 * @description Disable loader
 **/
function loaderFadeOut() {
    setTimeout(function() {
        $("#overlay").fadeOut(300);
    }, 500);
}

/**
 * @function
 * @name restrictUsage
 * @description restrict blocks
 **/
function restrictUsage() {
    $("#dateInput").css("display", "none");
    $("#tbdata").hide();
    $("#vcdata").empty();
    $("#ajax-alert").css("display", "block");
}

/**
 * @function
 * @name onError
 * @description Append dynamic error messages based on the API call
 **/
function onError(data) {
    loaderFadeOut();
    var validateText = "Either API Key / Date is empty";
    if (data.responseText == "") {
        data.responseText = validateText;
    }
    $("#ajax-alert").html(data.responseText);
    restrictUsage();
    errorMsg();
}

/**
 * @function
 * @name secondsToDhms
 * @description Converts DateTime to Days, Hours, Mins, Secs
 *
 **/
function secondsToDhms(value) {
    var lastUpdate = "";
    var d = new Date() - new Date(value);
    var date = new Date(d);
    var seconds = date.getTime() / 1000; //1440516958
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " day ago " : " days ago ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? "h ago " : "h ago ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " min ago " : " mins ago ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " sec ago" : " sec ago") : "";
    if (dDisplay != "") {
        lastUpdate = dDisplay;
    } else if (hDisplay != "") {
        lastUpdate = "over " + hDisplay;
    } else if (mDisplay != "") {
        lastUpdate = mDisplay;
    } else {
        lastUpdate = sDisplay;
    }
    return lastUpdate;
}

/*
|--------------------------------------------------------------------------
| Map Functions
|--------------------------------------------------------------------------
*/
jQuery(document).ready(function($) {
    //Ajax call for Loading Last vechile data
    $("#go").click(function(e) {
        getCSRFtoken();
        e.preventDefault();
        var formData = {
            apiKey: $("#apiKey").val(),
        };
        var type = "POST";
        var ajaxurl = "vehicles";
        $.ajax({
            type: type,
            url: ajaxurl,
            data: formData,
            dataType: "json",
            success: function(data) {
                $("#tbdata").find("tbody").remove();
                $("#tbdata").show();
                plotMarkers(data);
            },
            error: function(data) {
                onError(data);
            },
        }).done(function() {
            loaderFadeOut();
        });
    });

    //Select Vehicle Data for routes navigated
    $(".vehicleDataTable").on("click", "tr", function() {
        var currentRow = $(this).closest("tr");
        var getObjectID = currentRow.find(".objectID").html();
        objectID = getObjectID;
        $("#dateInput").css("display", "block");
        $(".selected").removeClass("selected");
        $(this).addClass("selected");
    });
});

/**
 * @function
 * @name plotMarkers
 * @description This is used to plot multiple markers based on Lat/Lng
 **/
function plotMarkers(data) {
    var i = 0;
    var tableData = [];
    $.each(data, function() {
        var speed = data[i].speed == null ? "0 km/h" : data[i].speed + " km/h";
        tableData = {
            objectName: "'" + data[i].objectName + "'",
            speed: "'" + speed + "'",
            lastEngineOnTime: "'" + secondsToDhms(data[i].lastEngineOnTime) + "'",
            objectId: "'" + data[i].objectId + "'",
        };
        $("<tr>", { html: formatItem(tableData) }).appendTo($("#tbdata"));
        addInfoBubble(data[i].latitude, data[i].longitude, data[i].address);
        i++;
    });
    $("#noData").hide();
}

//Ajax call for vehicles navigated on selected date
$("#selectedDate").click(function(e) {
    getCSRFtoken();
    e.preventDefault();
    var formData = {
        date: $("#date").val(),
        objectID: objectID,
        apiKey: $("#apiKey").val(),
    };
    var type = "POST";
    var ajaxurl = "directions";
    $.ajax({
        type: type,
        url: ajaxurl,
        data: formData,
        dataType: "json",
        success: function(data) {
            var t = loopData(data);
            navigateToRoute(t);
        },
        error: function(data) {
            onError(data);
        },
    }).done(function() {
        loaderFadeOut();
    });
});

/**
 * @function
 * @name loopData
 * @description Retrieves Latitude, Longitude and stops from API
 * [Remove Duplicates Lat/ Lng]
 **/
function loopData($array) {
    $array.forEach(function(item, index) {
        storeLatLong.push({ lat: item.Latitude, lng: item.Longitude });
    });
    const totalStops = $array.filter((a) => a.EngineStatus == null).length;
    var filtered = storeLatLong.reduce((filtered, item) => {
        if (!filtered.some(
                (filteredItem) =>
                JSON.stringify(filteredItem) == JSON.stringify(item)
            ))
            filtered.push(item);
        return filtered;
    }, []);
    let $combine = { latlng: storeLatLong, stops: totalStops };
    return $combine;
}

/**
 * @function
 * @name navigateToRoute
 * @description Append vehicles Data based on the route travelled
 *
 **/
function navigateToRoute(n) {
    map.removeObjects(map.getObjects());
    addPolylineToMap(map, n.latlng);
    $("#vcdata").empty();
    $("#vcdata").append(
        '<tr class="child"><td>Total Distance</td><td>' +
        totalDistance +
        "</td></tr><tr><td>Number of stops</td><td>" +
        n.stops +
        "</td></tr><tr><td>Shortest possible distance</td><td>" +
        totalDistance +
        "</td></tr>"
    );
}

/**
 * @function
 * @name formatItem
 * @description Format vehicles List Data
 *
 **/
function formatItem(item) {
    return (
        "<td>" +
        removeSingleQuotes(item.objectName) +
        "</td> <td> " +
        removeSingleQuotes(item.speed) +
        " </td> <td> " +
        removeSingleQuotes(item.lastEngineOnTime) +
        ' </td> <td class="objectID" style="display:none"> ' +
        removeSingleQuotes(item.objectId) +
        " </td>"
    );
}

function calculateShortestRoute() {
    const platform = configPlatform();
    var routingService = platform.getRoutingService();
    var routingParameters = {
        mode: "fastest;car",
        waypoint0: "geo!50.1120423728813,8.68340740740811",
        waypoint1: "geo!52.5309916298853,13.3846220493377",
        representation: "display",
    };

    routingService.calculateRoute(routingParameters, (success) => {
        console.log(success);
    });
}
//################################## @begins Place Markers based on Lat/ Lng ######################################################//

/**
 * Creates a new marker and adds it to a group
 * @param {H.map.Group} group       The group holding the new marker
 * @param {H.geo.Point} coordinate  The location of the marker
 * @param {String} html             Data associated with the marker
 */
function addMarkerToGroup(group, coordinate, html) {
    var marker = new H.map.Marker(coordinate);
    // add custom data to the marker
    marker.setData(html);
    group.addObject(marker);
}

/**
 * Add two markers showing the position of given Lat / Lng.
 * Clicking on a marker opens an infobubble which holds HTML content related to the marker.
 * @param {H.Map} map A HERE Map instance within the application
 */
function addInfoBubble(vehicleLatitude, vehicleLongitude, vehicleAddress) {
    var group = new H.map.Group();
    map.addObject(group);
    // add 'tap' event listener, that opens info bubble, to the group
    group.addEventListener(
        "tap",
        function(evt) {
            // event target is the marker itself, group is a parent event target
            // for all objects that it contains
            var bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
                // read custom data
                content: evt.target.getData(),
            });
            // show info bubble
            ui.addBubble(bubble);
        },
        false
    );
    addMarkerToGroup(
        group, { lat: vehicleLatitude, lng: vehicleLongitude },
        "<div>" + vehicleAddress + "</div>"
    );
}

// initialize communication with the platform
var platform = new H.service.Platform({
    apikey: mapAPI,
});
var defaultLayers = platform.createDefaultLayers();
// initialize a map - this map is centered over Europe
var map = new H.Map(
    document.getElementById("map"),
    defaultLayers.vector.normal.map, {
        center: { lat: 58.5953, lng: 25.0136 },
        zoom: 7,
        pixelRatio: window.devicePixelRatio || 1,
    }
);
// add a resize listener to make sure that the map occupies the whole container
window.addEventListener("resize", () => map.getViewPort().resize());
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
// create default UI with layers provided by the platform
var ui = H.ui.UI.createDefault(map, defaultLayers);
// Now use the map as required...
addInfoBubble(map);

//##################################@begins Navigate Lat / Lng ###############################################################//

/**
 * Adds a polyline between given Lat / Lng to the map
 *
 * @param  {H.Map} map A HERE Map instance within the application
 */
function addPolylineToMap(map, ts) {
    var lineString = new H.geo.LineString();
    ts.forEach(function(t) {
        lineString.pushPoint(t);
    });
    // Initialize a polyline with the linestring:
    var polyline = new H.map.Polyline(lineString, {
        style: { lineWidth: 4, strokeColor: "blue" },
    });
    // Add the polyline to the map:
    map.addObject(polyline);
    // Zoom the map to fit the rectangle:
    map.getViewModel().setLookAtData({ bounds: polyline.getBoundingBox() });
    var distance = getPolylineLength(polyline);
    var km = distance / 1000;
    totalDistance = km.toFixed(1) + " km";
}

/**
 * @function
 * @name getPolylineLength
 * @description Get distance for the selected route
 *
 **/
function getPolylineLength(polyline) {
    const geometry = polyline.getGeometry();
    let distance = 0;
    let last = geometry.extractPoint(0);
    for (let i = 1; i < geometry.getPointCount(); i++) {
        const point = geometry.extractPoint(i);
        distance += last.distance(point);
        last = point;
    }
    if (polyline.isClosed()) {
        distance += last.distance(geometry.extractPoint(0));
    }
    // distance in meters
    return distance;
}
// initialize communication with the platform
var platform = new H.service.Platform({
    apikey: mapAPI,
});
var defaultLayers = platform.createDefaultLayers();
// add a resize listener to make sure that the map occupies the whole container
window.addEventListener("resize", () => map.getViewPort().resize());
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
// Create the default UI components
var ui = H.ui.UI.createDefault(map, defaultLayers);
// Now use the map as required...
addPolylineToMap(map);