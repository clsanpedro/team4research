(function(){
  const lat = 41.4178104;
  const lng = 2.1715023;
  const mapInit = L.map('mapInit').setView( [ lat, lng ], 13 );

  let markers = new L.FeatureGroup().addTo(mapInit);

  let properties = [];

  // Filters

  const filters = {
    category: '',
    price: '',
  }

  const categoriesSelect = document.querySelector("#categories");
  const pricesSelect = document.querySelector("#prices");

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapInit);

  // Apply filter by category and price

  categoriesSelect.addEventListener('change', (e) => {
    filters.category = +e.target.value;
    filterProperties();
  })

  pricesSelect.addEventListener('change', (e) => {
    filters.price = +e.target.value;
    filterProperties();
  })


  const getProperties = async () => {
    try {
      const apiURL = '/api/properties';
      const response = await fetch(apiURL);
      properties = await response.json();

        showProperties(properties);


    } catch (error) {
      console.log(error);
    }
  }

  const showProperties = (properties) => {

    // clear markers
    markers.clearLayers();

    properties.forEach( property => {
      const marker = L.marker( [property?.lat, property?.lng], {
        autoPan: true
      })
      .addTo(mapInit)
      .bindPopup( `
        <p class="text-indigo-600 font-bold">${property?.class.nameCategory}</p>
        <h1 class="text-xl font-extrabold uppercase my-2">${property?.title}</h1>  
        <img src="/uploads/${property?.image}" alt="Imagen de la propiedad ${property?.title}">
        <p class="text-gray-600 font-bold">${property?.price.price}</p>
        <a href="/property/${property.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase">Show property</a>
      ` );

      markers.addLayer(marker);
    });
  }


  const filterProperties = () => {
    const result = properties.filter( filterByCategory ).filter( filterByPrice );
    showProperties(result);
  }

  const filterByCategory = property => filters.category ? property.fkClassId === filters.category : property ;

  const filterByPrice = property => filters.price ? property.fkPriceId === filters.price : property ;

  getProperties();


})()