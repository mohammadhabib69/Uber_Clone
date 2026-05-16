const axios = require('axios');
const captainModel = require('../models/captain.model');

module.exports.getAddressCoordinate = async (address) => {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Uber-Clone/1.0 (your-email@example.com)'
            }
        });
        if (response.data && response.data.length > 0) {
            const location = response.data[0];
            return {
                ltd: parseFloat(location.lat),
                lng: parseFloat(location.lon)
            };
        }
    } catch (error) {
        console.error('Nominatim error, using fallback coordinates:', error.message);
    }
    return { ltd: 22.9006, lng: 89.5000 };
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    try {
        const originCoords = await module.exports.getAddressCoordinate(origin);
        const destCoords = await module.exports.getAddressCoordinate(destination);
        
        const url = `http://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.ltd};${destCoords.lng},${destCoords.ltd}?overview=false`;
        
        const response = await axios.get(url);
        
        if (response.data && response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            return {
                distance: {
                    text: `${(route.distance / 1000).toFixed(2)} km`,
                    value: Math.round(route.distance)
                },
                duration: {
                    text: `${Math.round(route.duration / 60)} min`,
                    value: Math.round(route.duration)
                }
            };
        }
    } catch (err) {
        console.error('OSRM error, using fallback distance/time:', err.message);
    }
    return {
        distance: { text: '5.00 km', value: 5000 },
        duration: { text: '15 min', value: 900 }
    };
}

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=5&addressdetails=1`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Uber-Clone/1.0 (your-email@example.com)'
            }
        });
        if (response.data && response.data.length > 0) {
            return response.data.map(item => item.display_name).filter(value => value);
        }
    } catch (err) {
        console.error('Nominatim suggestions error:', err.message);
    }
    return [
        `${input} Road, Khulna`,
        `${input} Avenue, Dhaka`,
        `${input} Street, Chittagong`
    ].filter(s => s.trim() !== '');
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    try {
        const captains = await captainModel.find({
            location: {
                $geoWithin: {
                    $centerSphere: [ [ ltd, lng ], radius / 6371 ]
                }
            }
        });
        return captains;
    } catch (err) {
        console.error('Error finding captains in radius:', err.message);
        return [];
    }
}
