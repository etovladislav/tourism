$(document).ready(function () {
    var airportLocation = {
        lat: 8.111195,
        lng: 98.306824
    }

    var map;
    var service;
    var infowindow;

    var url = "xl/somename.xls";
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    /*
     Agent name:"SAYAMA PHUKET"
     Birthday:"01.02.1983"
     Citizenship:"RUS"
     Client type:"adult"
     Expiry:"07.06.2022"
     FIO:"RUSANOVA TATIANA"
     Gid name:"Matveev Vladimir"
     Hotel Type:"3"
     Hotel name:"NAITHONBURI RESORT"
     Passport:"719596325"
     Phone:"646650421"
     Room number:"5404"
     Room type:"dbl"
     */
    var clients = [];
    var hotels = new Map();
    oReq.onload = function (e) {
        var arraybuffer = oReq.response;
        var data = new Uint8Array(arraybuffer);
        var arr = new Array();
        for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        var bstr = arr.join("");
        /* Call XLS */
        var workbook = XLS.read(bstr, {type: "binary"});
        var sheet_name_list = workbook.SheetNames;
        var sheet = XLS.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        //For only clients column
        for (var i = 0; i < sheet.length; i++) {
            if (Object.keys(sheet[i]).length > 10) {
                clients.push(sheet[i]);
                var hotel = hotels.get(sheet[i]["Hotel name"]);
                if (hotel) {
                    hotel.push(sheet[i])
                    hotels.set(sheet[i]["Hotel name"], hotel);
                } else {
                    var arr = [];
                    arr.push(sheet[i]);
                    hotels.set(sheet[i]["Hotel name"], arr);

                }

            }
        }
        console.log(hotels);
        fillPanel();
    }
    oReq.send();
    function fillPanel() {
        $('#number-of-hotels').html(hotels.size);
        $('#number-of-people').html(clients.length);
        hotels.forEach(function (value, key, hotels) {
            $('#hotel-list').append('' +
                '<a href="#" class="list-group-item hotel-list-item" data-hotel="' + key + '">' + key + '<span class="badge">' + value.length + '</span></a>' +
                '');
        });
        $('.hotel-list-item').on('click', function () {
            var hotel = $(this).attr('data-hotel');
            var hotelInfo = hotels.get(hotel);
            $('#table-clients').html("");
            $('#modalLabel').html(hotel);
            for (var i = 0; i < hotelInfo.length; i++) {
                $('#table-clients').append(
                    '<tr>' +
                    '<th scope="row">' + (i + 1) + '</th>' +
                    '<td>' + hotelInfo[i]["Agent name"] + '</td>' +
                    '<td>' + hotelInfo[i]["Gid name"] + '</td>' +
                    '<td>' + hotelInfo[i]["Room number"] + '</td>' +
                    '<td>' + hotelInfo[i]["FIO"] + '</td>' +
                    '<td>' + hotelInfo[i]["Phone"] + '</td>' +
                    '</tr>'
                );
            }
            $('#modal').modal();
        });
        initMap();
    }

    var directionsDisplay;
    var directionsService;
//Init google map
    function initMap() {
        directionsService = new google.maps.DirectionsService;
        directionsDisplay = new google.maps.DirectionsRenderer;
        //center of a Phucket
        var phucket = new google.maps.LatLng(7.949229, 98.337);
        map = new google.maps.Map(document.getElementById('map'), {
            center: phucket,
            zoom: 12
        });
        directionsDisplay.setMap(map);
        infoWindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(map);
        var itemsProcessed = 0;
        hotels.forEach(function (value, key, hotels) {
            console.log(key);
            var request = {
                location: phucket,
                query: key
            };
            itemsProcessed++;
            if (itemsProcessed == hotels.size) {
                search(request, value.length, true);
            } else {
                search(request, value.length, false);
            }
        });
    }

    function similarHotels() {
        for (var i = 0; i < resultSearchWithsSveralHotels.length; i++) {
            var radio = "";
            for (var j = 0; j < resultSearchWithsSveralHotels[i].results.length; j++) {
                radio +=
                    '<div class="radio">' +
                    '<label>' +
                    '<input type="radio" name="' + i + '" value="' + j + '">' +
                    resultSearchWithsSveralHotels[i].results[j].name +
                    '</label>' +
                    '</div>';
            }
            var similarHotel =
                '<div class="panel panel-default">' +
                '<div class="panel-heading">' +
                '<h3 class="panel-title">' + resultSearchWithsSveralHotels[i].request.query + '</h3>' +
                '</div>' +
                '<div class="panel-body">' +
                radio +
                '</div>' +
                '</div>';
            $('#modal-similar-hotels-body').append(similarHotel);
        }
        $('#modal-similar-hotels').modal();
    }

    $('#similar-hotels-save').on('click', function () {
        $('#modal-similar-hotels').modal('hide');
        for (var i = 0; i < resultSearchWithsSveralHotels.length; i++) {
            var j = $('input[name=' + i + ']:checked').val();
            addMarker(resultSearchWithsSveralHotels[i].results[j], resultSearchWithsSveralHotels[i].numberOfPeople);
        }
        // calculateAndDisplayRoute(directionsService, directionsDisplay);
    });

    function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        var waypts = [];
        for (var i = 1; i < transports[0].routes.length - 1; i++) {
            waypts.push({
                location: {
                    lat: transports[0].routes[i].geometry.location.lat(),
                    lng: transports[0].routes[i].geometry.location.lng()
                },
                stopover: true
            });
        }

        directionsService.route({
            origin: {
                lat: transports[0].routes[0].geometry.location.lat(),
                lng: transports[0].routes[0].geometry.location.lng()
            },
            waypoints: waypts,
            destination: airportLocation,
            travelMode: google.maps.TravelMode.DRIVING
        }, function (response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            } else {

                window.alert('Directions request failed due to ' + status);
            }
        });
    }

//Query search places
    var resultSearchWithsSveralHotels = [];

    function search(request, numberOfPeople, isLast) {
        service.textSearch(request, function callback(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                if (results.length > 1) {
                    resultSearchWithsSveralHotels.push({
                        results: results,
                        request: request,
                        numberOfPeople: numberOfPeople
                    });
                } else {
                    addMarker(results[0], numberOfPeople);
                }
                if (isLast) {
                    similarHotels();
                }
            }
        });
    }

    var places = [];
//Add marker to map

    function addMarker(place, numberOfPeople) {
        places.push({
            place: place,
            numberOfPeople: numberOfPeople
        });
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            label: numberOfPeople.toString(),
            numberOfPeople: numberOfPeople,
            title: place.name

        });
        google.maps.event.addListener(marker, 'click', function () {
            if (activeTransport != null) {
                //open modal

                var transport = transports[activeTransport];
                transport.routes.push(place);
                transport.freePlaces -= numberOfPeople;

                var ponint =
                    ' <li class="list-group-item completed"><span>' + place.name + '</span></li>';
                $('[data-number="' + activeTransport + '"] .transport-step').append(ponint);
            } else {
                service.getDetails(place, function (result, status) {
                    if (status !== google.maps.places.PlacesServiceStatus.OK) {
                        console.error(status);
                        return;
                    }
                    infoWindow.setContent("<strong>" + result.name + "</strong> <br/> <br/>" + "Number of a people: " + marker.numberOfPeople);
                    infoWindow.open(map, marker);
                    calculateAndDisplayRoute(directionsService, directionsDisplay);

                    map.panTo(marker.position);
                });
            }
        });
        google.maps.event.addListener(marker, 'dblclick', function () {
            map.setZoom(17);
            map.panTo(marker.position);

        });
        google.maps.event.addListener(infoWindow, 'closeclick', function () {
            map.setZoom(12);
        });
    }


    var transports = [];
    var activeTransport;
    $('#add-transport').on('click', function () {
        var capacity = $('#transport-capacity').val();
        transports[transports.length] = {capacity: capacity, routes: [], freePlaces: capacity};
        var transportHTML =
            '<a href="#" class="list-group-item" data-number="' + (transports.length - 1) + '">' +
            '<h4 class="list-group-item-heading">Transoprt ' + transports.length + '</h4>' +
            '<p>Capacity: ' + capacity + '<p/>' +
            '<ol class="list-group vertical-steps transport-step">' +
            '</ol>' +
            '</a>';
        $('#transport-list').append(transportHTML);
    });
    $(document).on('click', '#transport-list a', function () {
        var item = $(this);
        if (item.hasClass('active')) {
            $('#transport-list a.active').removeClass('active');
            activeTransport = null;
        } else {
            $('#transport-list a.active').removeClass('active');
            item.toggleClass('active');
            activeTransport = item.attr('data-number');
        }
        console.log(activeTransport);
    });

});
