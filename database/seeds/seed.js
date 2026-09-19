const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const EmergencyContact = require('../models/EmergencyContact');
const PriceHistory = require('../models/PriceHistory');
const NetworkCoverage = require('../models/NetworkCoverage');
const User = require('../models/User');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');
};

const destinations = [
    {
        name: 'Manali', state: 'Himachal Pradesh', country: 'India',
        description: 'Manali is a beautiful hill station nestled in the mountains of Himachal Pradesh. Known for its stunning landscapes, adventure sports, and ancient temples. A perfect gateway to Rohtang Pass, Solang Valley, and Old Manali.',
        coordinates: { lat: 32.2396, lng: 77.1887 },
        category: 'mountain', bestSeason: 'Oct - Feb (Snow) / Mar - Jun (Summer)', climate: 'Cold Alpine', altitude: '2,050m',
        rating: 4.6, popularity: 95, permitRequired: false,
        attractions: [
            { name: 'Rohtang Pass', type: 'viewpoint', description: 'High mountain pass at 3,978m', entryFee: 550, timings: '7 AM - 3 PM' },
            { name: 'Solang Valley', type: 'adventure', description: 'Paragliding, skiing, and zipline', entryFee: 0, timings: 'All day' },
            { name: 'Hadimba Temple', type: 'temple', description: 'Ancient wooden temple in deodar forest', entryFee: 0, timings: '8 AM - 6 PM' },
            { name: 'Old Manali', type: 'area', description: 'Cafes, street shopping, river walks', entryFee: 0, timings: 'All day' },
            { name: 'Jogini Waterfall', type: 'nature', description: 'Beautiful waterfall trek from Vashisht', entryFee: 0, timings: 'Daytime' }
        ],
        services: {
            hotels: [
                { name: 'Snow Valley Resort', rating: 4.5, pricePerNight: 4500, hotelType: 'luxury', amenities: ['WiFi', 'Spa', 'Restaurant'] },
                { name: 'Hotel Mountain Trail', rating: 4.0, pricePerNight: 2500, hotelType: 'mid-range', amenities: ['WiFi', 'Parking'] },
                { name: 'Backpacker\'s Hostel', rating: 3.8, pricePerNight: 800, hotelType: 'budget', amenities: ['WiFi', 'Common Kitchen'] },
                { name: 'The Himalayan', rating: 4.7, pricePerNight: 8000, hotelType: 'luxury', amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'] }
            ],
            cabs: [
                { cabType: 'sedan', pricePerKm: 12, provider: 'Manali Cabs' },
                { cabType: 'suv', pricePerKm: 18, provider: 'Mountain Rides' }
            ],
            adventures: [
                { name: 'Paragliding at Solang', price: 2500, duration: '15 min', difficulty: 'Easy', description: 'Tandem paragliding with instructor' },
                { name: 'River Rafting on Beas', price: 1500, duration: '1.5 hr', difficulty: 'Moderate', description: 'Grade 2-3 rapids' },
                { name: 'Trekking to Bhrigu Lake', price: 3500, duration: '2 days', difficulty: 'Hard', description: 'High altitude lake trek' }
            ]
        }
    },
    {
        name: 'Goa', state: 'Goa', country: 'India',
        description: 'Goa is India\'s smallest state and a tropical paradise known for its stunning beaches, vibrant nightlife, Portuguese heritage architecture, and delicious seafood. From serene North Goa beaches to party hubs in South Goa.',
        coordinates: { lat: 15.2993, lng: 74.1240 },
        category: 'beach', bestSeason: 'Nov - Feb', climate: 'Tropical', altitude: 'Sea Level',
        rating: 4.5, popularity: 98, permitRequired: false,
        attractions: [
            { name: 'Baga Beach', type: 'beach', description: 'Popular beach with water sports', entryFee: 0, timings: 'All day' },
            { name: 'Basilica of Bom Jesus', type: 'heritage', description: 'UNESCO World Heritage Site', entryFee: 0, timings: '9 AM - 6:30 PM' },
            { name: 'Dudhsagar Falls', type: 'waterfall', description: 'Four-tiered waterfall on Goa-Karnataka border', entryFee: 400, timings: '8 AM - 5 PM' },
            { name: 'Fort Aguada', type: 'fort', description: '17th century Portuguese fort', entryFee: 0, timings: '8 AM - 5:30 PM' }
        ],
        services: {
            hotels: [
                { name: 'Taj Exotica', rating: 4.8, pricePerNight: 15000, hotelType: 'luxury', amenities: ['Pool', 'Beach Access', 'Spa'] },
                { name: 'Goa Beach Resort', rating: 4.2, pricePerNight: 3500, hotelType: 'mid-range', amenities: ['WiFi', 'Pool'] },
                { name: 'Anjuna Beach Hostel', rating: 3.9, pricePerNight: 600, hotelType: 'budget', amenities: ['WiFi', 'AC'] }
            ],
            adventures: [
                { name: 'Scuba Diving', price: 3500, duration: '2 hr', difficulty: 'Easy', description: 'Discover underwater marine life' },
                { name: 'Jet Skiing', price: 800, duration: '15 min', difficulty: 'Easy', description: 'High speed water sport' }
            ]
        }
    },
    {
        name: 'Ladakh', state: 'Ladakh', country: 'India',
        description: 'Ladakh, the "Land of High Passes", is a stunning cold desert landscape with dramatic mountains, pristine lakes, and ancient Buddhist monasteries. A paradise for adventure seekers and spiritual travelers.',
        coordinates: { lat: 34.1526, lng: 77.5771 },
        category: 'mountain', bestSeason: 'Jun - Sep', climate: 'Cold Desert', altitude: '3,524m',
        rating: 4.8, popularity: 92, permitRequired: true,
        permitDetails: { permitType: 'Inner Line Permit (ILP)', requiredDocuments: ['Valid Photo ID', 'Passport-size photos', 'Travel itinerary'], processingTime: '1-2 days', fee: 0, applicationLink: 'https://lahdclehpermit.in' },
        attractions: [
            { name: 'Pangong Lake', type: 'lake', description: 'Famous blue lake from 3 Idiots movie', entryFee: 300, timings: 'Daytime' },
            { name: 'Nubra Valley', type: 'valley', description: 'Sand dunes and Bactrian camels', entryFee: 0, timings: 'All day' },
            { name: 'Thiksey Monastery', type: 'monastery', description: 'Beautiful Buddhist monastery', entryFee: 50, timings: '6 AM - 6 PM' },
            { name: 'Khardung La Pass', type: 'pass', description: 'One of world\'s highest motorable passes', entryFee: 0, timings: 'Daytime' }
        ],
        services: {
            hotels: [
                { name: 'The Grand Dragon', rating: 4.6, pricePerNight: 7000, hotelType: 'luxury', amenities: ['Oxygen', 'Restaurant', 'WiFi'] },
                { name: 'Ladakh Guest House', rating: 3.8, pricePerNight: 1500, hotelType: 'budget', amenities: ['WiFi', 'Heater'] }
            ]
        }
    },
    {
        name: 'Jaipur', state: 'Rajasthan', country: 'India',
        description: 'The Pink City of India, Jaipur is a vibrant blend of old-world charm and modern vitality. Magnificent forts, ornate palaces, and colorful bazaars make it a must-visit destination.',
        coordinates: { lat: 26.9124, lng: 75.7873 },
        category: 'heritage', bestSeason: 'Oct - Mar', climate: 'Semi-arid', altitude: '431m',
        rating: 4.4, popularity: 88, permitRequired: false,
        attractions: [
            { name: 'Amber Fort', type: 'fort', description: 'Magnificent hilltop fort', entryFee: 500, timings: '8 AM - 5:30 PM' },
            { name: 'Hawa Mahal', type: 'palace', description: 'Palace of Winds with 953 windows', entryFee: 200, timings: '9 AM - 5 PM' },
            { name: 'City Palace', type: 'palace', description: 'Royal residence museum', entryFee: 700, timings: '9:30 AM - 5 PM' },
            { name: 'Nahargarh Fort', type: 'fort', description: 'Fort with panoramic city views', entryFee: 200, timings: '10 AM - 5:30 PM' }
        ],
        services: {
            hotels: [
                { name: 'Rambagh Palace', rating: 4.9, pricePerNight: 25000, hotelType: 'luxury', amenities: ['Pool', 'Spa', 'Heritage'] },
                { name: 'Hotel Pearl Palace', rating: 4.3, pricePerNight: 2000, hotelType: 'mid-range', amenities: ['WiFi', 'Restaurant'] },
                { name: 'Zostel Jaipur', rating: 4.0, pricePerNight: 500, hotelType: 'budget', amenities: ['WiFi', 'Common Area'] }
            ]
        }
    },
    {
        name: 'Rishikesh', state: 'Uttarakhand', country: 'India',
        description: 'The Yoga Capital of the World, Rishikesh sits on the banks of the holy Ganges. Known for adventure sports, ancient ashrams, and spiritual retreats.',
        coordinates: { lat: 30.0869, lng: 78.2676 },
        category: 'adventure', bestSeason: 'Sep - Nov / Feb - May', climate: 'Subtropical', altitude: '372m',
        rating: 4.5, popularity: 86, permitRequired: false,
        attractions: [
            { name: 'Laxman Jhula', type: 'bridge', description: 'Iconic hanging bridge over Ganges', entryFee: 0, timings: 'All day' },
            { name: 'Triveni Ghat', type: 'ghat', description: 'Sacred bathing ghat for Ganga Aarti', entryFee: 0, timings: '6 PM Aarti' },
            { name: 'Beatles Ashram', type: 'ashram', description: 'Where The Beatles stayed in 1968', entryFee: 150, timings: '9 AM - 4 PM' }
        ],
        services: {
            adventures: [
                { name: 'White Water Rafting', price: 1200, duration: '2 hr', difficulty: 'Moderate', description: 'Grade 3-4 rapids' },
                { name: 'Bungee Jumping', price: 3550, duration: '30 min', difficulty: 'Hard', description: '83m highest bungee in India' },
                { name: 'Cliff Jumping', price: 1500, duration: '1 hr', difficulty: 'Moderate', description: 'Jump from 30ft cliffs' }
            ]
        }
    },
    {
        name: 'Shimla', state: 'Himachal Pradesh', country: 'India',
        description: 'The former summer capital of British India. Shimla offers colonial architecture, pleasant weather, toy train rides, and stunning Himalayan views.',
        coordinates: { lat: 31.1048, lng: 77.1734 },
        category: 'mountain', bestSeason: 'Mar - Jun / Dec - Feb (Snow)', climate: 'Subtropical Highland', altitude: '2,276m',
        rating: 4.3, popularity: 85, permitRequired: false,
        attractions: [
            { name: 'Mall Road', type: 'market', description: 'Main shopping and walking street', entryFee: 0, timings: 'All day' },
            { name: 'Ridge', type: 'viewpoint', description: 'Open space with mountain views', entryFee: 0, timings: 'All day' },
            { name: 'Jakhoo Temple', type: 'temple', description: 'Hanuman temple on highest peak', entryFee: 0, timings: '5 AM - 9 PM' },
            { name: 'Toy Train', type: 'experience', description: 'UNESCO heritage Kalka-Shimla railway', entryFee: 300, timings: 'Various' }
        ],
        services: {
            hotels: [
                { name: 'Wildflower Hall', rating: 4.8, pricePerNight: 18000, hotelType: 'luxury', amenities: ['Spa', 'Pool', 'Fine Dining'] },
                { name: 'Hotel Combermere', rating: 4.1, pricePerNight: 3000, hotelType: 'mid-range', amenities: ['WiFi', 'Restaurant'] }
            ]
        }
    },
    {
        name: 'Udaipur', state: 'Rajasthan', country: 'India',
        description: 'The City of Lakes, Udaipur is one of the most romantic cities in India. Beautiful palaces on lake shores, boat rides, and a royal heritage await you.',
        coordinates: { lat: 24.5854, lng: 73.7125 },
        category: 'heritage', bestSeason: 'Sep - Mar', climate: 'Hot Semi-arid', altitude: '598m',
        rating: 4.6, popularity: 82, permitRequired: false,
        attractions: [
            { name: 'City Palace', type: 'palace', description: 'Largest palace complex in Rajasthan', entryFee: 300, timings: '9:30 AM - 5:30 PM' },
            { name: 'Lake Pichola', type: 'lake', description: 'Sunset boat ride on the lake', entryFee: 400, timings: '10 AM - 6 PM' },
            { name: 'Jag Mandir', type: 'island', description: 'Island palace on Lake Pichola', entryFee: 500, timings: '10 AM - 6 PM' }
        ],
        services: {
            hotels: [
                { name: 'Taj Lake Palace', rating: 4.9, pricePerNight: 35000, hotelType: 'luxury', amenities: ['Lake View', 'Spa', 'Heritage'] },
                { name: 'Hotel Lakend', rating: 4.2, pricePerNight: 3500, hotelType: 'mid-range', amenities: ['Lake View', 'WiFi'] }
            ]
        }
    },
    {
        name: 'Darjeeling', state: 'West Bengal', country: 'India',
        description: 'The Queen of the Hills. Famous for tea gardens, the Darjeeling Himalayan Railway, and breathtaking views of Kanchenjunga.',
        coordinates: { lat: 27.0360, lng: 88.2627 },
        category: 'mountain', bestSeason: 'Apr - Jun / Sep - Nov', climate: 'Temperate', altitude: '2,042m',
        rating: 4.4, popularity: 78, permitRequired: false,
        attractions: [
            { name: 'Tiger Hill', type: 'viewpoint', description: 'Sunrise view of Kanchenjunga', entryFee: 30, timings: '4 AM - 6 AM' },
            { name: 'Tea Garden Visit', type: 'experience', description: 'Happy Valley Tea Estate', entryFee: 100, timings: '8 AM - 4 PM' },
            { name: 'Darjeeling Himalayan Railway', type: 'experience', description: 'UNESCO World Heritage toy train', entryFee: 1500, timings: 'Multiple schedules' }
        ],
        services: {
            hotels: [
                { name: 'Mayfair Darjeeling', rating: 4.5, pricePerNight: 6500, hotelType: 'luxury', amenities: ['Heritage', 'Restaurant', 'Spa'] },
                { name: 'Hotel Sinclairs', rating: 3.9, pricePerNight: 2200, hotelType: 'mid-range', amenities: ['WiFi', 'Restaurant'] }
            ]
        }
    },
    {
        name: 'Varanasi', state: 'Uttar Pradesh', country: 'India',
        description: 'One of the oldest living cities in the world. Varanasi is the spiritual capital of India, famous for its ghats, temples, and the mesmerizing Ganga Aarti.',
        coordinates: { lat: 25.3176, lng: 82.9739 },
        category: 'pilgrimage', bestSeason: 'Oct - Mar', climate: 'Humid Subtropical', altitude: '80m',
        rating: 4.3, popularity: 80, permitRequired: false,
        attractions: [
            { name: 'Dashashwamedh Ghat', type: 'ghat', description: 'Famous for evening Ganga Aarti', entryFee: 0, timings: 'Aarti at 7 PM' },
            { name: 'Kashi Vishwanath Temple', type: 'temple', description: 'One of twelve Jyotirlingas', entryFee: 0, timings: '3 AM - 11 PM' },
            { name: 'Sarnath', type: 'heritage', description: 'Where Buddha gave his first sermon', entryFee: 20, timings: '7 AM - 5 PM' }
        ],
        services: {
            hotels: [
                { name: 'Taj Ganges', rating: 4.5, pricePerNight: 8000, hotelType: 'luxury', amenities: ['Pool', 'Spa', 'Restaurant'] },
                { name: 'Hotel Alka', rating: 3.8, pricePerNight: 1200, hotelType: 'budget', amenities: ['Ghat View', 'WiFi'] }
            ]
        }
    },
    {
        name: 'Munnar', state: 'Kerala', country: 'India',
        description: 'A hill station surrounded by rolling hills, tea plantations, and misty mountains. Munnar is South India\'s most beautiful hill retreat.',
        coordinates: { lat: 10.0889, lng: 77.0595 },
        category: 'mountain', bestSeason: 'Sep - May', climate: 'Tropical Highland', altitude: '1,532m',
        rating: 4.5, popularity: 76, permitRequired: false,
        attractions: [
            { name: 'Tea Museum', type: 'museum', description: 'History of tea production', entryFee: 125, timings: '9 AM - 4 PM' },
            { name: 'Eravikulam National Park', type: 'nature', description: 'Home of Nilgiri Tahr', entryFee: 125, timings: '7 AM - 4 PM' },
            { name: 'Top Station', type: 'viewpoint', description: 'Highest point in Munnar', entryFee: 0, timings: 'Daytime' }
        ],
        services: {
            hotels: [
                { name: 'Tea County', rating: 4.3, pricePerNight: 5500, hotelType: 'luxury', amenities: ['Valley View', 'Spa'] },
                { name: 'Green Valley Vista', rating: 4.0, pricePerNight: 2000, hotelType: 'mid-range', amenities: ['WiFi', 'Restaurant'] }
            ]
        }
    },
    {
        name: 'Jaisalmer', state: 'Rajasthan', country: 'India',
        description: 'The Golden City rising from the Thar Desert. Jaisalmer enchants with its golden fort, desert safaris, and sand dune experiences.',
        coordinates: { lat: 26.9157, lng: 70.9083 },
        category: 'desert', bestSeason: 'Oct - Mar', climate: 'Hot Desert', altitude: '225m',
        rating: 4.5, popularity: 74, permitRequired: false,
        attractions: [
            { name: 'Jaisalmer Fort', type: 'fort', description: 'Living fort with shops and hotels inside', entryFee: 250, timings: '8 AM - 6 PM' },
            { name: 'Sam Sand Dunes', type: 'desert', description: 'Camel safari and desert camping', entryFee: 0, timings: 'Evening sunset' },
            { name: 'Patwon Ki Haveli', type: 'heritage', description: 'Ornate merchant mansions', entryFee: 100, timings: '8 AM - 5 PM' }
        ],
        services: {
            adventures: [
                { name: 'Desert Safari', price: 2000, duration: '4 hr', difficulty: 'Easy', description: 'Camel ride + sunset + folk dance' },
                { name: 'Night Camping', price: 3000, duration: 'Overnight', difficulty: 'Easy', description: 'Under the stars in desert' }
            ]
        }
    },
    {
        name: 'Andaman Islands', state: 'Andaman and Nicobar Islands', country: 'India',
        description: 'Pristine tropical islands with crystal-clear waters, white sand beaches, and amazing marine life. Perfect for scuba diving and water sports.',
        coordinates: { lat: 11.7401, lng: 92.6586 },
        category: 'beach', bestSeason: 'Nov - May', climate: 'Tropical', altitude: 'Sea Level',
        rating: 4.7, popularity: 70, permitRequired: true,
        permitDetails: { permitType: 'Restricted Area Permit (RAP)', requiredDocuments: ['Valid Photo ID', 'Flight ticket', 'Hotel booking'], processingTime: 'On arrival', fee: 0 },
        attractions: [
            { name: 'Radhanagar Beach', type: 'beach', description: 'Asia\'s best beach', entryFee: 0, timings: '5 AM - 5 PM' },
            { name: 'Cellular Jail', type: 'heritage', description: 'National memorial for freedom fighters', entryFee: 30, timings: '9 AM - 5 PM' },
            { name: 'Havelock Island', type: 'island', description: 'Scuba diving and snorkeling', entryFee: 0, timings: 'All day' }
        ],
        services: {
            adventures: [
                { name: 'Scuba Diving', price: 4500, duration: '2 hr', difficulty: 'Easy', description: 'Explore coral reefs' },
                { name: 'Sea Walking', price: 3500, duration: '30 min', difficulty: 'Easy', description: 'Walk on the ocean floor' }
            ]
        }
    }
];

const emergencyData = [
    {
        region: 'Himachal Pradesh',
        state: 'Himachal Pradesh',
        coordinates: { lat: 32.2396, lng: 77.1887 },
        policeStations: [
            { name: 'Manali Police Station', phone: '01902-252340', address: 'Mall Road, Manali', coordinates: { lat: 32.2420, lng: 77.1890 } },
            { name: 'Tourist Police Booth', phone: '1363', address: 'Bus Stand, Manali', coordinates: { lat: 32.2400, lng: 77.1880 } }
        ],
        hospitals: [
            { name: 'Civil Hospital Manali', phone: '01902-252211', address: 'NH3, Manali', type: 'government', coordinates: { lat: 32.2450, lng: 77.1870 } },
            { name: 'Mission Hospital', phone: '01902-253344', address: 'Old Manali Road', type: 'private', coordinates: { lat: 32.2480, lng: 77.1860 } }
        ],
        shelters: [
            { name: 'Tourist Shelter Home', phone: '01902-252340', address: 'Near Bus Stand', capacity: 50, coordinates: { lat: 32.2410, lng: 77.1875 } }
        ],
        safetyTips: [
            'Carry warm clothes even in summer — temperatures drop at night',
            'Don\'t trek alone in remote areas',
            'Check road conditions before traveling to Rohtang Pass',
            'Keep altitude sickness medicine handy',
            'Carry cash — ATMs may not work in remote areas'
        ]
    }
];

const priceHistoryData = [
    {
        hotelName: 'Snow Valley Resort', destination: 'Manali', roomType: 'deluxe', currentPrice: 4500,
        lowestPrice: 2800, highestPrice: 7500, trend: 'stable',
        prices: Array.from({length: 30}, (_, i) => ({ date: new Date(Date.now() - i * 86400000), price: 4500 + Math.floor(Math.random() * 2000 - 1000), source: 'platform' }))
    },
    {
        hotelName: 'Hotel Mountain Trail', destination: 'Manali', roomType: 'standard', currentPrice: 2500,
        lowestPrice: 1800, highestPrice: 4000, trend: 'falling',
        prices: Array.from({length: 30}, (_, i) => ({ date: new Date(Date.now() - i * 86400000), price: 2500 + Math.floor(Math.random() * 1000 - 500), source: 'platform' }))
    },
    {
        hotelName: 'Taj Exotica', destination: 'Goa', roomType: 'suite', currentPrice: 15000,
        lowestPrice: 10000, highestPrice: 22000, trend: 'rising',
        prices: Array.from({length: 30}, (_, i) => ({ date: new Date(Date.now() - i * 86400000), price: 15000 + Math.floor(Math.random() * 5000 - 2000), source: 'platform' }))
    },
    {
        hotelName: 'Goa Beach Resort', destination: 'Goa', roomType: 'standard', currentPrice: 3500,
        lowestPrice: 2000, highestPrice: 6000, trend: 'stable',
        prices: Array.from({length: 30}, (_, i) => ({ date: new Date(Date.now() - i * 86400000), price: 3500 + Math.floor(Math.random() * 1500 - 750), source: 'platform' }))
    },
    {
        hotelName: 'The Grand Dragon', destination: 'Ladakh', roomType: 'deluxe', currentPrice: 7000,
        lowestPrice: 5000, highestPrice: 12000, trend: 'rising',
        prices: Array.from({length: 30}, (_, i) => ({ date: new Date(Date.now() - i * 86400000), price: 7000 + Math.floor(Math.random() * 3000 - 1000), source: 'platform' }))
    },
    {
        hotelName: 'Rambagh Palace', destination: 'Jaipur', roomType: 'heritage', currentPrice: 25000,
        lowestPrice: 18000, highestPrice: 35000, trend: 'stable',
        prices: Array.from({length: 30}, (_, i) => ({ date: new Date(Date.now() - i * 86400000), price: 25000 + Math.floor(Math.random() * 8000 - 4000), source: 'platform' }))
    },
    {
        hotelName: 'Taj Lake Palace', destination: 'Udaipur', roomType: 'lake-view', currentPrice: 35000,
        lowestPrice: 25000, highestPrice: 50000, trend: 'rising',
        prices: Array.from({length: 30}, (_, i) => ({ date: new Date(Date.now() - i * 86400000), price: 35000 + Math.floor(Math.random() * 10000 - 5000), source: 'platform' }))
    }
];

async function seedDatabase() {
    try {
        await connectDB();

        console.log('🗑️  Clearing existing data...');
        await Destination.deleteMany({});
        await EmergencyContact.deleteMany({});
        await PriceHistory.deleteMany({});

        console.log('🌍 Seeding destinations...');
        await Destination.insertMany(destinations);
        console.log(`   ✅ ${destinations.length} destinations added`);

        console.log('🚨 Seeding emergency contacts...');
        await EmergencyContact.insertMany(emergencyData);
        console.log(`   ✅ ${emergencyData.length} emergency regions added`);

        console.log('📊 Seeding price history...');
        await PriceHistory.insertMany(priceHistoryData);
        console.log(`   ✅ ${priceHistoryData.length} hotel price records added`);

        console.log('👤 Seeding demo users...');
        await User.deleteMany({ email: { $in: ['tourist@travelsmart.com', 'admin@travelsmart.com', 'vendor@travelsmart.com'] } });
        
        await User.create({
            name: 'Rahul Sharma (Tourist)',
            email: 'tourist@travelsmart.com',
            password: 'password123',
            role: 'traveller',
            phone: '+91 9876543210',
            preferences: { interests: ['trekking', 'culture'], budget: 'mid-range', travelStyle: 'solo' }
        });

        await User.create({
            name: 'Abhishek Singh Rawat (Admin)',
            email: 'admin@travelsmart.com',
            password: 'password123',
            role: 'admin',
            phone: '+91 9811122233'
        });

        await User.create({
            name: 'Himalayan Adventures (Vendor)',
            email: 'vendor@travelsmart.com',
            password: 'password123',
            role: 'provider',
            phone: '+91 9988776655',
            providerDetails: { businessName: 'Himalayan Adventures', businessType: 'adventure', verified: true }
        });
        console.log('   ✅ 3 demo users created');

        console.log('\n🎉 Database seeded successfully!');
        console.log('📊 Summary:');
        console.log(`   - ${destinations.length} destinations`);
        console.log(`   - ${emergencyData.length} emergency regions`);
        console.log(`   - ${priceHistoryData.length} price history records`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seedDatabase();
