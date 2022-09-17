(function() {

  const lat = document.querySelector( '#lat' ).value || 41.4178104;
  const lng = document.querySelector( '#lng' ).value || 2.1715023;
  const map = L.map('map').setView( [ lat, lng ], 16 );
  let marker;

  const geocodeService = L.esri.Geocoding.geocodeService();
  

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  //marker

  marker = new L.marker([lat, lng], {
    draggable: true,
    autoPan: true
  }).addTo(map);


  // detect moviment marker and get the new position

  marker.on('moveend', function(e) {
    marker = e.target;
    const position = marker.getLatLng();
    map.panTo(new L.LatLng(position.lat, position.lng));
    // get the street's name and show it in the input field
    geocodeService.reverse().latlng(position, 13).run(function(error, result) {
      // console.log(result);

      marker.bindPopup(result.address.LongLabel).openPopup();

      // fill the input field with the street's name
      document.querySelector('.street').textContent = result?.address?.Address ?? '';
      document.querySelector('#street').value = result?.address?.Address ?? '';
      document.querySelector('#lat').value = result?.latlng?.lat ?? '';
      document.querySelector('#lng').value = result?.latlng?.lng ?? '';
    })
  })



})()

