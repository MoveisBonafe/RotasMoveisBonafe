<!DOCTYPE html>
<html>
<head>
  <title>Google Maps Example</title>
  <style>
    #map {
      height: 400px;
      width: 100%;
    }
  </style>
</head>
<body>
  <h1>My Google Map</h1>
  <div id="map"></div>
  <script>
    function initMap() {
      const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
      });

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: -34.397, lng: 150.644 },
        map: map,
        title: "Hello World!",
      });
    }
  </script>
  <script
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"
    async
    defer
  ></script>
</body>
</html>