/**
 * Created by etovladislav on 22.01.17.
 */


var ADMINITSTRATIVE_DIVISIONS= {
    mueangPhuket: [
        {
            eng: "Talat Yai",
            th: "ตลาดใหญ่"
        },
        {
            eng: "Talat Nuea",
            th: "ตลาดเหนือ"
        },
        {
            eng: "Ko Kaeo",
            th: "เกาะแก้ว"
        },
        {
            eng: "Ratsada",
            th: "รัษฎา"
        },
        {
            eng: "Wichit",
            th: "วิชิต"
        },
        {
            eng: "Chalong",
            th: "ฉลอง"
        },
        {
            eng: "Rawai",
            th: "ราไวย์"
        },
        {
            eng: "Karon",
            th: "กะรน"
        }],
    kathu: [
        {
            eng: "Kathu",
            th: "กะทู้"
        },
        {
            eng: "Patong",
            th: "ป่าตอง"
        },
        {
            eng: "Kamala",
            th: "กมลา"
        }
    ],
    thalang: [
        {
            eng: "Thep Krasattri",
            th: "เทพกระษัตรี"
        },
        {
            eng: "Si Sunthon",
            th: "ศรีสุนทร"
        },
        {
            eng: "Choeng Thale",
            th: "เชิงทะเล"
        },
        {
            eng: "Pa Khlok",
            th: "ป่าคลอก"
        },
        {
            eng: "Mai Khao",
            th: "ไม้ขาว"
        },
        {
            eng: "Sakhu",
            th: "สาคู"
        }
    ]
}
var AIRPORT_LOCATION = {
    lat: 8.111195,
    lng: 98.306824
}
var map;
var service;
var infowindow;
function initMap() {
    //center of a Phucket
    var phucket = new google.maps.LatLng(7.949229, 98.337);
    map = new google.maps.Map(document.getElementById('map'), {
        center: phucket,
        zoom: 12
    });
    infoWindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    for (var i = 0; i < input.length; i++) {
        var request = {
            location: phucket,
            query: input[i].hotel,
        };
        search(request, input[i].numberOfPeople);
    }

    console.log(places);
}
var countOfPeople = 0;
function search(request, numberOfPeople) {
    countOfPeople += numberOfPeople;
    service.textSearch(request, function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                addMarker(results[i], numberOfPeople);
            }
        }
    });
}
var places = [];
function addMarker(place, numberOfPeople) {
    places.push({
        place: place,
        numberOfPeople: numberOfPeople
    });
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon: {
            url: 'http://maps.gstatic.com/mapfiles/circle.png',
            anchor: new google.maps.Point(10, 10),
            scaledSize: new google.maps.Size(10, 17)
        },
        numberOfPeople: numberOfPeople

    });
    google.maps.event.addListener(marker, 'click', function () {
        service.getDetails(place, function (result, status) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.error(status);
                return;
            }
            infoWindow.setContent(result.name + "<br/>" + "Number of a people: " + marker.numberOfPeople);
            infoWindow.open(map, marker);
        });
    });
}


var rad = function (x) {
    return x * Math.PI / 180;
};

var getDistance = function (p1) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(airportLocation.lat - p1.lat());
    var dLong = rad(airportLocation.lng - p1.lng());
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat())) * Math.cos(rad(airportLocation.lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
};

var maxDistanceToAirport = 0;

//    [{
//        distance: 123,
//        place: ...
//    }]
var distancesWithPlaces = [];
var cars;
function calculateRoutes() {
    for (var i = 0; i < places.length; i++) {
        var distance = getDistance(places[i].place.geometry.location)
        if (distance > maxDistanceToAirport) {
            maxDistanceToAirport = distance;
        }
        distancesWithPlaces.push({
            distance: distance,
            place: places[i]
        });
    }

    distancesWithPlaces.sort(function (a, b) {
        return (a.distance < b.distance) ? 1 : ((b.distance < a.distance) ? -1 : 0);
    });

    var route = [];
    var allRoutes = [
        {
            mueang: [
                {
                    from: "M1",
                    to: ["M2", "M3", "M4", "T4", "T2", "T1", "T6", "T6"]
                },
                {
                    from: "M2",
                    to: ["M3", "M4", "T4", "T2", "T1", "T6", "T6"]
                },

                {
                    from: "M3",
                    to: ["M4", "T4", "T2", "T1", "T6", "T6"]
                },
                {
                    from: "M4",
                    to: ["T4", "T2", "T1", "T6", "T6"]
                },
                {
                    from: "M5",
                    to: ["M1", "M2", "M3", "M4", "T4", "T2", "T1", "T6", "T6"]
                },
                {
                    from: "M6",
                    to: ["K2", "K3", "K1", "T2", "T1", "T4", "T3", "T6", "T5", "M3"]
                },
                {
                    from: "M7",
                    to: ["M6", "K2", "K3", "K1", "T2", "T1", "T4", "T3", "T6", "T5", "M3"]
                },
                {
                    from: "M8",
                    to: ["M6", "K2", "K3", "K1", "T2", "T1", "T4", "T3", "T6", "T5", "M3"]
                }

            ],
            kathu: [
                {
                    from: "K2",
                    to: ["K3", "K1", "T3", "T6", "T5", "M3"]
                },
                {
                    from: "K3",
                    to: ["K1", "T3", "T6", "T5", "M3"]
                },
                {
                    from: "K1",
                    to: ["T3", "T6", "T5", "M3"]
                }
            ],
            thalang: [
                {
                    from: "T1",
                    to: ["T2", "T3", "T6", "T5"]
                },
                {
                    from: "T2",
                    to: ["T3", "T6", "T5"]
                },
                {
                    from: "T3",
                    to: ["T6", "T5"]
                },
                {
                    from: "T4",
                    to: ["T1", "T2", "T3", "T6", "T5"]
                },
                {
                    from: "T6",
                    to: ["T5"]
                },

            ]
        }
    ];
//        for (var i = 0; i < distancesWithPlaces.length; i++) {
    var address = distancesWithPlaces[0].place.place.formatted_address;
    var sector = findInDistrict("mueang", address);
    console.log(sector);
    console.log("first sector");
//        distance
//                :
//                32227.989934255726
//        place
//                :
//                Object
//        numberOfPeople
//                :
//                2
    var candidates = findHotelsInSector(sector);
    for(var i = 0; i < candidates.length; i++) {
        route.push()
    }


//        }

}
function findHotelsInSector(sectorName) {
    var array = [];
    if (sectorName.substr(0, 1) == "K") {
        array = administrativeDivisions.kathu;
    } else if (sectorName.substr(0, 1) == "T") {
        array = administrativeDivisions.thalang;
    } else if (sectorName.substr(0, 1) == "M") {
        array = administrativeDivisions.mueangPhuket;
    }
    var res = [];
    var numberOfDistrict = parseInt(sectorName.substr(1, 2)) - 1;
    for (var i = 0; i < distancesWithPlaces.length; i++) {
        var place = distancesWithPlaces[i].place.place.formatted_address;
        if (~place.indexOf(array[numberOfDistrict].eng.toLowerCase())
            || ~place.indexOf(array[numberOfDistrict].th.toLowerCase())) {
            res.push(distancesWithPlaces[i]);
        }
    }
    console.log("))))))))))");
    console.log(res);
    console.log("))))))))))");
    return res;
}

function findInDistrict(district, placeName) {

    var array = [];

    if (district == "mueang") {
        array = administrativeDivisions.mueangPhuket;
    } else if (district == "thalang") {
        array = administrativeDivisions.thalang;
    } else {
        array = administrativeDivisions.kathu;
    }
    var place = placeName.toLowerCase();

    for (var i = 0; i < array.length; i++) {
        if (~place.indexOf(array[i].eng.toLowerCase()) || ~place.indexOf(array[i].th.toLowerCase())) {
            console.log(placeName);
            console.log(array[i].eng);
            console.log("____________________");
            return district.substr(0, 1).toUpperCase() + (i + 1);
        }
    }
}