const express = require('express');
const router = express.Router();

// Simulated weather data (in production, use OpenWeatherMap API)
const weatherDB = {
    'manali': { temp: 12, condition: 'Partly Cloudy', humidity: 65, wind: 15, icon: '⛅', feelsLike: 9 },
    'goa': { temp: 32, condition: 'Sunny', humidity: 78, wind: 12, icon: '☀️', feelsLike: 35 },
    'jaipur': { temp: 38, condition: 'Hot & Sunny', humidity: 25, wind: 8, icon: '🌞', feelsLike: 40 },
    'shimla': { temp: 15, condition: 'Clear', humidity: 55, wind: 10, icon: '🌤️', feelsLike: 13 },
    'ladakh': { temp: 5, condition: 'Cold & Clear', humidity: 30, wind: 20, icon: '❄️', feelsLike: -2 },
    'rishikesh': { temp: 28, condition: 'Warm', humidity: 60, wind: 5, icon: '🌤️', feelsLike: 30 },
    'darjeeling': { temp: 16, condition: 'Misty', humidity: 80, wind: 12, icon: '🌫️', feelsLike: 14 },
    'ooty': { temp: 18, condition: 'Pleasant', humidity: 70, wind: 8, icon: '🌤️', feelsLike: 17 },
    'udaipur': { temp: 34, condition: 'Sunny', humidity: 35, wind: 10, icon: '☀️', feelsLike: 36 },
    'varanasi': { temp: 36, condition: 'Hot', humidity: 50, wind: 6, icon: '🌞', feelsLike: 39 },
    'munnar': { temp: 20, condition: 'Pleasant', humidity: 75, wind: 8, icon: '🌤️', feelsLike: 19 },
    'andaman': { temp: 30, condition: 'Tropical', humidity: 82, wind: 15, icon: '🌴', feelsLike: 33 },
    'sikkim': { temp: 14, condition: 'Cloudy', humidity: 72, wind: 10, icon: '☁️', feelsLike: 11 },
    'amritsar': { temp: 35, condition: 'Hot & Dry', humidity: 30, wind: 12, icon: '🌞', feelsLike: 37 },
    'coorg': { temp: 22, condition: 'Rainy', humidity: 85, wind: 10, icon: '🌧️', feelsLike: 21 }
};

// Activity suggestions based on weather
function getWeatherSuggestions(weather) {
    const suggestions = [];
    if (weather.temp > 30) {
        suggestions.push('🏊 Visit a water park or pool', '🍦 Try local ice cream', '🏠 Explore indoor museums', '🌅 Plan activities for early morning or evening');
    } else if (weather.temp > 20) {
        suggestions.push('🚶 Perfect for sightseeing walks', '🏔️ Great day for trekking', '📸 Ideal for photography', '🚲 Try cycling around the area');
    } else if (weather.temp > 10) {
        suggestions.push('☕ Enjoy hot chai at a local cafe', '🧥 Carry warm clothes', '🌄 Visit viewpoints for clear views', '🔥 Campfire in the evening');
    } else {
        suggestions.push('🧤 Bundle up with warm clothing', '♨️ Visit hot springs if nearby', '☕ Indoor cafe experience', '🏠 Explore local indoor attractions');
    }

    if (weather.condition.includes('Rain') || weather.condition.includes('rainy')) {
        suggestions.push('☂️ Carry an umbrella', '🏛️ Visit temples & indoor sites', '📖 Read at a cozy cafe');
    }
    if (weather.condition.includes('Clear') || weather.condition.includes('Sunny')) {
        suggestions.push('🌟 Great for stargazing tonight', '🌅 Don\'t miss the sunset');
    }

    return suggestions;
}

// @route   GET /api/weather/:city
router.get('/:city', async (req, res) => {
    try {
        const city = req.params.city.toLowerCase();
        const weather = weatherDB[city];

        if (!weather) {
            // Generate random weather for unknown cities
            const randomWeather = {
                temp: Math.floor(Math.random() * 30) + 10,
                condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Clear', 'Misty'][Math.floor(Math.random() * 5)],
                humidity: Math.floor(Math.random() * 50) + 30,
                wind: Math.floor(Math.random() * 20) + 5,
                icon: '🌤️',
                feelsLike: Math.floor(Math.random() * 30) + 8
            };
            return res.json({
                success: true,
                city: req.params.city,
                weather: randomWeather,
                suggestions: getWeatherSuggestions(randomWeather)
            });
        }

        res.json({
            success: true,
            city: req.params.city,
            weather,
            suggestions: getWeatherSuggestions(weather)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/weather/forecast/:city
router.get('/forecast/:city', async (req, res) => {
    try {
        const city = req.params.city.toLowerCase();
        const baseWeather = weatherDB[city] || { temp: 25, humidity: 50 };
        const forecast = [];
        const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Clear', 'Light Rain', 'Thunderstorm'];

        for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            forecast.push({
                date: date.toISOString().split('T')[0],
                dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
                tempMax: baseWeather.temp + Math.floor(Math.random() * 5),
                tempMin: baseWeather.temp - Math.floor(Math.random() * 8) - 2,
                condition: conditions[Math.floor(Math.random() * conditions.length)],
                humidity: baseWeather.humidity + Math.floor(Math.random() * 20) - 10,
                rainChance: Math.floor(Math.random() * 60) + '%'
            });
        }

        res.json({ success: true, city: req.params.city, forecast });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
