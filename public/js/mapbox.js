// ...
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidmFsZW50aW0xMTEiLCJhIjoiY2xpOTA2eG5uNDBxNzNqbXc0ZGIxMHhvayJ9.FmEfvbfFPZiF1vwkyb8Myg';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/valentim111/cli93a15b00t601pg6s72co5w',
    scrollZoom: false,
    //   center: [-108.0583275564844, 38.256316773758826],
    //   zoom: 4,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add the marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    const popup = new mapboxgl.Popup({
      offset: 30,
      // closeOnClick: false, // Prevent popup from closing when clicking on the map
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Show the popup when hovering over the marker
    el.addEventListener('mouseenter', () => {
      popup.addTo(map);
    });

    // Hide the popup when the mouse leaves the marker
    el.addEventListener('mouseleave', () => {
      popup.remove();
    });

    // Extend the map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
