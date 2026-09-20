// ============================================
// Shared Demo / Seed Data
// Used by seed script AND as runtime fallback
// when MongoDB is disconnected on Vercel.
// ============================================

const DEMO_USERS = [
    {
        _id: 'demo_admin_001',
        name: 'Abhishek Singh Rawat (Admin)',
        email: 'admin@travelsmart.com',
        password: 'password123',
        role: 'admin',
        phone: '+91 9811122233',
        isActive: true,
        preferences: { interests: [], budget: 'mid-range', travelStyle: 'solo' },
        createdAt: new Date('2024-06-01')
    },
    {
        _id: 'demo_tourist_001',
        name: 'Rahul Sharma (Tourist)',
        email: 'tourist@travelsmart.com',
        password: 'password123',
        role: 'traveller',
        phone: '+91 9876543210',
        isActive: true,
        preferences: { interests: ['trekking', 'culture'], budget: 'mid-range', travelStyle: 'solo' },
        createdAt: new Date('2024-06-01')
    },
    {
        _id: 'demo_vendor_001',
        name: 'Himalayan Adventures (Vendor)',
        email: 'vendor@travelsmart.com',
        password: 'password123',
        role: 'provider',
        phone: '+91 9988776655',
        isActive: true,
        providerDetails: { businessName: 'Himalayan Adventures', businessType: 'adventure', verified: true },
        preferences: { interests: [], budget: 'mid-range', travelStyle: 'solo' },
        createdAt: new Date('2024-06-01')
    }
];

// Minimal destination data for offline explore fallback
const DEMO_DESTINATIONS = [
    {
        _id: 'dest_manali',
        name: 'Manali', state: 'Himachal Pradesh',
        description: 'Beautiful hill station nestled in the mountains of Himachal Pradesh. Known for stunning landscapes, adventure sports, and ancient temples.',
        coordinates: { lat: 32.2396, lng: 77.1887 },
        category: 'mountain', bestSeason: 'Oct - Feb (Snow) / Mar - Jun (Summer)',
        rating: 4.6, popularity: 95, permitRequired: false,
        images: []
    },
    {
        _id: 'dest_goa',
        name: 'Goa', state: 'Goa',
        description: 'India\'s smallest state and a tropical paradise known for stunning beaches, vibrant nightlife, Portuguese heritage architecture.',
        coordinates: { lat: 15.2993, lng: 74.1240 },
        category: 'beach', bestSeason: 'Nov - Feb',
        rating: 4.5, popularity: 98, permitRequired: false,
        images: []
    },
    {
        _id: 'dest_ladakh',
        name: 'Ladakh', state: 'Jammu & Kashmir',
        description: 'Land of high passes with stunning monasteries, crystal-clear lakes, and dramatic mountain landscapes.',
        coordinates: { lat: 34.1526, lng: 77.5771 },
        category: 'mountain', bestSeason: 'Jun - Sep',
        rating: 4.8, popularity: 90, permitRequired: true,
        images: []
    },
    {
        _id: 'dest_jaipur',
        name: 'Jaipur', state: 'Rajasthan',
        description: 'The Pink City, known for majestic forts, palaces, vibrant bazaars, and rich Rajasthani culture.',
        coordinates: { lat: 26.9124, lng: 75.7873 },
        category: 'heritage', bestSeason: 'Oct - Mar',
        rating: 4.5, popularity: 88, permitRequired: false,
        images: []
    },
    {
        _id: 'dest_udaipur',
        name: 'Udaipur', state: 'Rajasthan',
        description: 'The City of Lakes. Beautiful palaces on lake shores, boat rides, and a royal heritage.',
        coordinates: { lat: 24.5854, lng: 73.7125 },
        category: 'heritage', bestSeason: 'Sep - Mar',
        rating: 4.6, popularity: 82, permitRequired: false,
        images: []
    },
    {
        _id: 'dest_darjeeling',
        name: 'Darjeeling', state: 'West Bengal',
        description: 'The Queen of the Hills. Famous for tea gardens, the Darjeeling Himalayan Railway, and views of Kanchenjunga.',
        coordinates: { lat: 27.0360, lng: 88.2627 },
        category: 'mountain', bestSeason: 'Apr - Jun / Sep - Nov',
        rating: 4.4, popularity: 78, permitRequired: false,
        images: []
    },
    {
        _id: 'dest_varanasi',
        name: 'Varanasi', state: 'Uttar Pradesh',
        description: 'One of the world\'s oldest living cities. Spiritual capital of India with ancient ghats on the Ganges.',
        coordinates: { lat: 25.3176, lng: 83.0068 },
        category: 'pilgrimage', bestSeason: 'Oct - Mar',
        rating: 4.3, popularity: 85, permitRequired: false,
        images: []
    },
    {
        _id: 'dest_rishikesh',
        name: 'Rishikesh', state: 'Uttarakhand',
        description: 'Yoga Capital of the World. Adventure sports hub with river rafting, bungee jumping, and spiritual retreats.',
        coordinates: { lat: 30.0869, lng: 78.2676 },
        category: 'adventure', bestSeason: 'Sep - Nov / Feb - May',
        rating: 4.5, popularity: 87, permitRequired: false,
        images: []
    }
];

const DEMO_CATEGORIES = [
    { name: 'mountain', count: 3, icon: '🏔️' },
    { name: 'beach', count: 1, icon: '🏖️' },
    { name: 'heritage', count: 2, icon: '🏛️' },
    { name: 'pilgrimage', count: 1, icon: '🛕' },
    { name: 'adventure', count: 1, icon: '🧗' }
];

module.exports = { DEMO_USERS, DEMO_DESTINATIONS, DEMO_CATEGORIES };
