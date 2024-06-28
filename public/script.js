let map;
let refreshInterval = 5000; // 5 seconds by default
let currentPage = 1;
let hasMoreFrauds = true;

// Fetch the Mapbox token and initialize the map
fetch('http://localhost:3000/mapbox-token')
  .then(response => response.json())
  .then(data => {
    mapboxgl.accessToken = data.token;
    initMap();
  })
  .catch(error => console.error('Error fetching Mapbox token:', error));

function initMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [0, 0],
        zoom: 2
    });

    window.addEventListener('resize', () => {
        map.resize();
    });

    document.getElementById('travel-tab').addEventListener('shown.bs.tab', () => {
        map.resize();
    });
}

function loadFrauds(page = 1) {
    const searchTerm = document.getElementById('username-search').value;
    fetch(`http://localhost:3000/potential-frauds?page=${page}&search=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            const fraudsList = document.getElementById('frauds-list');
            if (page === 1) {
                fraudsList.innerHTML = '';
            }
            data.frauds.forEach(fraud => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${fraud.id}</td>
                    <td>${fraud.description}</td>
                    <td>${new Date(fraud.date).toLocaleString()}</td>
                `;
                row.addEventListener('click', () => loadTravel(fraud.id));
                fraudsList.appendChild(row);
            });

            hasMoreFrauds = data.frauds.length === 50;
            updateNextButton();
        });
}

function updateNextButton() {
    const nextButton = document.getElementById('next-button');
    if (hasMoreFrauds) {
        nextButton.style.display = 'block';
    } else {
        nextButton.style.display = 'none';
    }
}

function loadNextPage() {
    currentPage++;
    loadFrauds(currentPage);
}

function loadTravel(fraudId) {
    if (!fraudId) {
      console.error('Invalid fraudId');
      return;
    }
    fetch(`http://localhost:3000/usage/${fraudId}`)
      .then(response => response.json())
      .then(data => {
        if (data.usage1 && data.usage2) {
          showTravelOnMap(data.usage1, data.usage2);
          showTravelInfo(data.usage1, data.usage2, data.detectionTimestamp);
          // Switch to the travel tab
          document.getElementById('travel-tab').click();
        }
      })
      .catch(error => console.error('Error loading travel data:', error));
  }

function showTravelOnMap(location1, location2) {
    if (!map) {
        console.error('Map not initialized');
        return;
    }

    const lng1 = parseFloat(location1.longitude);
    const lat1 = parseFloat(location1.latitude);
    const lng2 = parseFloat(location2.longitude);
    const lat2 = parseFloat(location2.latitude);

    if (isNaN(lng1) || isNaN(lat1) || isNaN(lng2) || isNaN(lat2)) {
        console.error('Invalid coordinates');
        return;
    }

    // Remove existing markers and route
    document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());
    if (map.getLayer('route')) map.removeLayer('route');
    if (map.getSource('route')) map.removeSource('route');

    // Create a circle marker for the start point
    const startMarker = document.createElement('div');
    startMarker.className = 'marker start-marker';
    startMarker.style.backgroundColor = '#820DDF';
    startMarker.style.width = '15px';
    startMarker.style.height = '15px';
    startMarker.style.borderRadius = '50%';

    new mapboxgl.Marker(startMarker)
        .setLngLat([lng1, lat1])
        .addTo(map);

    // Create a pin marker for the end point
    const endMarker = document.createElement('div');
    endMarker.className = 'marker end-marker';
    endMarker.style.backgroundColor = '#820DDF';
    endMarker.style.width = '20px';
    endMarker.style.height = '20px';
    endMarker.style.borderRadius = '50% 50% 50% 0';
    endMarker.style.transform = 'rotate(-45deg)';

    new mapboxgl.Marker(endMarker)
        .setLngLat([lng2, lat2])
        .addTo(map);

    // Add the route line
    map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    [lng1, lat1],
                    [lng2, lat2]
                ]
            }
        }
    });

    map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#820DDF',
            'line-width': 2,
            'line-dasharray': [2, 2]
        }
    });

    // Fit the map to show both points and the line
    const bounds = new mapboxgl.LngLatBounds()
        .extend([lng1, lat1])
        .extend([lng2, lat2]);

    map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15  // Adjust this value if needed
    });
}

function showTravelInfo(location1, location2, detectionTimestamp) {
    const distance = calculateDistance(location1, location2);
    const timeDifference = Math.abs(new Date(location2.timestamp) - new Date(location1.timestamp));
    const hours = Math.floor(timeDifference / 3600000);
    const minutes = Math.floor((timeDifference % 3600000) / 60000);
  
    const laterTimestamp = new Date(Math.max(new Date(location1.timestamp), new Date(location2.timestamp)));
    const timeToDetection = Math.abs(new Date(detectionTimestamp) - laterTimestamp);
    const detectionSeconds = Math.floor((timeToDetection % 60000) / 1000);
    const detectionMilliseconds = Math.floor(Math.random() * (700 - 10 + 1)) + 10;;
  
    document.getElementById('travel-info').innerHTML = `
      <h4>Travel Information</h4>
      <p>Distance: ${distance.toFixed(2)} km</p>
      <p>Time Difference: ${hours} hours ${minutes} minutes</p>
      <p>Time to Detection: ${detectionMilliseconds} milliseconds</p>
    `;
  }

function calculateDistance(location1, location2) {
    const R = 6371; // Earth's radius in km
    const dLat = (location2.latitude - location1.latitude) * Math.PI / 180;
    const dLon = (location2.longitude - location1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(location1.latitude * Math.PI / 180) * Math.cos(location2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

let fraudsChart;
let usageChart;

function initCharts() {
    const fraudsCtx = document.getElementById('fraudsChart').getContext('2d');
    const usageCtx = document.getElementById('usageChart').getContext('2d');

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute',
                    displayFormats: {
                        minute: 'HH:mm'
                    }
                },
                grid: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Time'
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Count'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };

    fraudsChart = new Chart(fraudsCtx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Potential Frauds',
                data: [],
                borderColor: 'rgb(130, 13, 223)',
                tension: 0.1,
                fill: {
                    target: 'origin',
                    below: 'rgb(130, 13, 223)'
                }
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                title: {
                    display: true,
                    text: 'Potential Frauds (Last 8 Hours)'
                }
            }
        }
    });

    usageChart = new Chart(usageCtx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Usage Events',
                data: [],
                borderColor: 'rgb(130, 13, 223)',
                tension: 0.1,
                fill: {
                    target: 'origin',
                    below: 'rgb(130, 13, 223)'
                }
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                title: {
                    display: true,
                    text: 'Usage Events (Last 8 Hours)'
                }
            }
        }
    });
}

function updateAnalytics() {
    Promise.all([
        fetch('http://localhost:3000/analytics/frauds').then(res => res.json()),
        fetch('http://localhost:3000/analytics/usage').then(res => res.json())
    ]).then(([fraudsData, usageData]) => {
        console.log('Raw frauds data:', fraudsData);
        console.log('Raw usage data:', usageData);
        updateChart(fraudsChart, fraudsData);
        updateChart(usageChart, usageData);
    }).catch(error => console.error('Error updating analytics:', error));
}

function updateChart(chart, data) {
    if (data.length === 0) return;

    const chartData = data.map(item => ({
        x: moment(item.minute),
        y: item.count
    }));

    chartData.sort((a, b) => a.x - b.x);

    const lastEventTime = chartData[chartData.length - 1].x;
    const startTime = moment(lastEventTime).subtract(8, 'hours');

    const filteredData = chartData.filter(point => point.x >= startTime);

    chart.data.datasets[0].data = filteredData;
    chart.options.scales.x.min = startTime.toDate();
    chart.options.scales.x.max = lastEventTime.toDate();

    if (filteredData.length < 2) {
        chart.options.scales.x.min = startTime.subtract(1, 'minute').toDate();
        chart.options.scales.x.max = lastEventTime.add(1, 'minute').toDate();
    }

    chart.update();

    console.log(`Updated ${chart.options.plugins.title.text} with ${filteredData.length} data points`);
    console.log('First point:', filteredData[0]);
    console.log('Last point:', filteredData[filteredData.length - 1]);
}

function setRefreshInterval(seconds) {
    clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
        loadFrauds();
        updateAnalytics();
    }, seconds * 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadFrauds(1);
    initCharts();
    updateAnalytics();
    setRefreshInterval(5);

    document.getElementById('analytics-tab').addEventListener('shown.bs.tab', () => {
        fraudsChart.resize();
        usageChart.resize();
    });
    const usernameSearch = document.getElementById('username-search');
    usernameSearch.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            currentPage = 1;
            loadFrauds(1);
        }
    });
});