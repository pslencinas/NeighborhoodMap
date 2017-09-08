var initialLocations = [
	{	name: 'Pizza Guerrin', lat: -34.6040999, long: -58.3858806	},
	{	name: 'El Palacio de la Papa Frita', lat: -34.60422, long: -58.38867	},
	{	name: 'Pizzería Las Cuartetas', lat: -34.6034618, long: -58.3786976	},
	{	name: 'Sorrento', lat: -34.6033859, long: -58.3759882	},
	{	name: 'El Cuartito', lat: -34.5978494, long: -58.3855708	},
	{	name: 'Santos Manjares', lat: -34.5978805, long: -58.3803445	},
	{	name: 'Paseo La Plaza', lat: -34.6050867, long: -58.3899736	}
];

// Declaring global variables now to satisfy strict mode
var map;
var clientID;
var clientSecret;


var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.long = data.long;
	this.URL = "";
	this.address = "";
	this.city = "";
	this.twitter = "";
	this.facebook = "";

	this.visible = ko.observable(true);

	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

	$.getJSON(foursquareURL).done(function(data) {
		var results = data.response.venues[0];
		self.URL = results.url;
		
		if (typeof self.URL === 'undefined'){
			self.URL = "";
		}

		self.address = results.location.formattedAddress[0];
		self.city = results.location.city;
     	self.twitter = results.contact.twitter;
     	if (typeof self.twitter === 'undefined'){
			self.twitter = "";
		}
      	self.facebook = results.contact.facebookUsername;
      	if (typeof self.facebook === 'undefined'){
			self.facebook = "";
		}
      	
	}).fail(function() {
		alert("There was an error");
	});

	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.long),
			map: map,
			title: data.name
	});
	var largeInfowindow = new google.maps.InfoWindow();

	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(map);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	this.marker.addListener('click', function(){
		
		self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + '</b></div>' +
	        '<div class="content"><a href="' + self.URL +'">' + self.URL + '</a></div>' +
	        '<div class="content">' + self.address + '</div>' +
	        '<div class="content">' + self.city + '</div>' +
	        '<div class="content"><a href="https://www.twitter.com/' + self.twitter +'"><i class="fa fa-twitter" aria-hidden="true"></i></a></div>' +
	        '<div class="content"><a href="https://www.facebook.com/' + self.facebook +'"><i class="fa fa-facebook" aria-hidden="true"></i></a></div></div>';

        self.infoWindow.setContent(self.contentString);

		self.infoWindow.open(map, this);

		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});

	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};



function AppViewModel() {
	var self = this;


	this.search = ko.observable("");
	this.locationList = ko.observableArray([]);

	// Foursquare API settings
	clientID = "0SLCHFWKTH5YD01OPVYABNP3PHD3TPEF5Q2LXFCJGM4YOPJP";
	clientSecret = "JN0M4GCB13EIYGO1BWJAHA4XECUYCX0CAVH0FAWKHCSPXFX0";

	map = new google.maps.Map(document.getElementById('map'), {
			zoom: 16,
			center: {lat: -34.6036682, lng: -58.3816000}
	});


	initialLocations.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	});

	this.arrayList = ko.computed( function() {
		var filter = self.search().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var result = (string.search(filter) >= 0);
				locationItem.visible(result);
				return result;
			});
		}
	}, self);

	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
}

function startApp() {
	ko.applyBindings(new AppViewModel());
}

function errorHandling() {
	alert("Google Maps has failed to load");
}
