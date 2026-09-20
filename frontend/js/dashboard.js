// ============================================
// Dashboard Module — All 15 Modules Logic
// ============================================

let currentPage = 'dashboard';
let leafletMap = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) return;

    const user = getUser();
    
    // Set welcome message
    const welcome = document.getElementById('welcomeMsg');
    if (welcome) welcome.textContent = `Welcome, ${user.name}! 👋`;

    // Show admin section
    if (user.role === 'admin') {
        const adminSection = document.getElementById('adminSection');
        if (adminSection) adminSection.style.display = 'block';
    }

    // Load profile
    loadProfile();

    // Sidebar navigation
    document.querySelectorAll('.sidebar-link[data-page]').forEach(link => {
        link.addEventListener('click', () => navigateTo(link.dataset.page));
    });

    // Sidebar toggle (mobile)
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', logout);

    // Load initial data
    loadDashboardStats();
    loadDestinations();

    // Module-specific event listeners
    setupTripPlanner();
    setupBooking();
    setupWeather();
    setupNavigation();
    setupNearby();
    setupEmergency();
    setupExpense();
    setupRoadCondition();
    setupPermit();
    setupNetwork();
    setupBluetooth();
    setupPriceTracker();
    setupChat();
});

// ---- Navigation ----
function navigateTo(page) {
    document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    
    const target = document.getElementById('page-' + page);
    if (target) target.style.display = 'block';
    
    const link = document.querySelector(`[data-page="${page}"]`);
    if (link) link.classList.add('active');

    currentPage = page;

    if (page !== 'chat') stopChatPolling();

    // Load data for specific pages
    if (page === 'explore') loadDestinations();
    if (page === 'trip-planner') loadMyTrips();
    if (page === 'booking') loadMyBookings();
    if (page === 'payment') loadPaymentHistory();
    if (page === 'weather') { /* loaded on search */ }
    if (page === 'navigation') initMap();
    if (page === 'nearby') loadNearby('restaurant');
    if (page === 'emergency') loadSafetyTips();
    if (page === 'expense') loadMyExpenseGroups();
    if (page === 'road-condition') loadRoadAlerts();
    if (page === 'network') loadDeadZones();
    if (page === 'bluetooth') loadBTMessages();
    if (page === 'price-tracker') loadPriceTrends();
    if (page === 'admin') loadAdminUsers();
    if (page === 'chat') {
        loadConversations();
        startChatPolling();
    }

    // Close sidebar on mobile
    document.getElementById('sidebar')?.classList.remove('open');
}

// ---- Dashboard Stats ----
async function loadDashboardStats() {
    try {
        const [trips, bookings, payments, expenses] = await Promise.allSettled([
            api('/trips/my-trips'),
            api('/bookings/my-bookings'),
            api('/payments/history'),
            api('/expenses/my-groups')
        ]);

        if (trips.status === 'fulfilled') document.getElementById('statTrips').textContent = trips.value.count || 0;
        if (bookings.status === 'fulfilled') document.getElementById('statBookings').textContent = bookings.value.count || 0;
        if (payments.status === 'fulfilled') {
            const total = (payments.value.payments || []).reduce((sum, p) => sum + (p.totalAmount || 0), 0);
            document.getElementById('statPayments').textContent = formatCurrency(total);
        }
        if (expenses.status === 'fulfilled') document.getElementById('statExpenses').textContent = expenses.value.count || 0;
    } catch (e) { console.error('Stats error:', e); }
}

// ---- Profile ----
async function loadProfile() {
    try {
        const data = await api('/auth/profile');
        const user = data.user;
        document.getElementById('profName').value = user.name || '';
        document.getElementById('profEmail').value = user.email || '';
        document.getElementById('profPhone').value = user.phone || '';
        document.getElementById('profRole').value = user.role || '';
    } catch (e) { console.error(e); }

    document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api('/auth/profile', {
                method: 'PUT',
                body: { name: document.getElementById('profName').value, phone: document.getElementById('profPhone').value }
            });
            showToast('Profile updated!', 'success');
        } catch (err) { showToast(err.message, 'error'); }
    });
}

// ---- Explore Destinations ----
async function loadDestinations(category = '') {
    const grid = document.getElementById('destinationsGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

    try {
        const search = document.getElementById('searchDest')?.value || '';
        const data = await api(`/explore/destinations?category=${category}&search=${search}`);
        
        if (!data.destinations || data.destinations.length === 0) {
            grid.innerHTML = '<div class="empty-state"><div class="icon">🏔️</div><h3>No destinations found</h3><p>Try different filters</p></div>';
            return;
        }

        grid.innerHTML = data.destinations.map(dest => {
            const categoryIcons = { mountain: '🏔️', beach: '🏖️', desert: '🏜️', forest: '🌲', city: '🏙️', heritage: '🏛️', pilgrimage: '🛕', adventure: '🧗' };
            return `
                <div class="dest-card" onclick="viewDestination('${dest._id}')">
                    <div class="dest-card-img">${categoryIcons[dest.category] || '📍'}</div>
                    <div class="dest-card-body">
                        <h3>${dest.name}</h3>
                        <p class="location">📍 ${dest.state}</p>
                        <p class="rating">⭐ ${dest.rating}/5 · ${dest.bestSeason}</p>
                        <div style="margin-top:8px;display:flex;gap:6px;">
                            <span class="badge badge-primary">${dest.category}</span>
                            ${dest.permitRequired ? '<span class="badge badge-warning">Permit Required</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        grid.innerHTML = '<div class="empty-state"><div class="icon">❌</div><h3>Error loading destinations</h3></div>';
    }
}

// Category tabs
document.getElementById('categoryTabs')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
        document.querySelectorAll('#categoryTabs .tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        loadDestinations(e.target.dataset.cat);
    }
});

// Search
document.getElementById('searchDest')?.addEventListener('input', debounce(() => {
    const activeCat = document.querySelector('#categoryTabs .tab.active')?.dataset.cat || '';
    loadDestinations(activeCat);
}, 400));

function debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

async function viewDestination(id) {
    try {
        const data = await api(`/explore/${id}`);
        const dest = data.destination;
        openModal(`
            <div class="modal-header">
                <h2>${dest.name}</h2>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>
            <p style="color:var(--text-secondary);margin-bottom:16px;">📍 ${dest.state}, ${dest.country} · ⭐ ${dest.rating}/5</p>
            <p style="margin-bottom:16px;">${dest.description}</p>
            <div style="margin-bottom:16px;">
                <span class="badge badge-primary">${dest.category}</span>
                <span class="badge badge-info">Best: ${dest.bestSeason}</span>
                ${dest.permitRequired ? '<span class="badge badge-warning">Permit Required</span>' : '<span class="badge badge-success">No Permit</span>'}
            </div>
            ${dest.attractions && dest.attractions.length ? `
                <h4 style="margin-bottom:12px;">🎯 Attractions</h4>
                ${dest.attractions.map(a => `<div class="settlement-item"><span>${a.name}</span><span style="color:var(--text-muted);margin-left:auto;">${a.timings || ''} ${a.entryFee ? '· ₹' + a.entryFee : ''}</span></div>`).join('')}
            ` : ''}
            ${dest.services && dest.services.hotels && dest.services.hotels.length ? `
                <h4 style="margin:16px 0 12px;">🏨 Hotels Available</h4>
                ${dest.services.hotels.map(h => `<div class="settlement-item"><span>${h.name} ⭐${h.rating}</span><span class="settlement-amount">₹${h.pricePerNight}/night</span></div>`).join('')}
            ` : ''}
            <div style="margin-top:20px;display:flex;gap:10px;">
                <button class="btn btn-primary" onclick="closeModal();document.getElementById('tripDest').value='${dest.name}';navigateTo('trip-planner');">🤖 Plan Trip Here</button>
                <button class="btn btn-secondary" onclick="closeModal();navigateTo('permit');document.getElementById('permitDest').value='${dest.name}';">📋 Check Permit</button>
            </div>
        `);
    } catch (e) { showToast('Error loading destination', 'error'); }
}

// ---- AI Trip Planner ----
function setupTripPlanner() {
    document.getElementById('tripForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const interests = [];
        document.querySelectorAll('#tripForm input[type="checkbox"]:checked').forEach(cb => interests.push(cb.value));

        try {
            showToast('🤖 AI is generating your itinerary...', 'info');
            const data = await api('/trips/plan', {
                method: 'POST',
                body: {
                    destination: document.getElementById('tripDest').value,
                    startDate: document.getElementById('tripStart').value,
                    endDate: document.getElementById('tripEnd').value,
                    budget: parseInt(document.getElementById('tripBudget').value),
                    travelers: parseInt(document.getElementById('tripTravelers').value),
                    travelStyle: document.getElementById('tripStyle').value,
                    interests
                }
            });

            showToast('Itinerary generated!', 'success');
            displayItinerary(data.tripPlan);
            loadMyTrips();
        } catch (e) { showToast(e.message, 'error'); }
    });
}

function displayItinerary(trip) {
    const container = document.getElementById('itineraryResult');
    const timeline = document.getElementById('itineraryTimeline');
    if (!container || !timeline) return;

    container.style.display = 'block';
    container.dataset.tripId = trip._id;

    timeline.innerHTML = trip.itinerary.map(day => `
        <div style="margin-bottom:24px;">
            <h4 style="margin-bottom:12px;color:var(--primary-light);">📅 Day ${day.day} - ${formatDate(day.date)} ${day.weather ? `<span class="badge badge-info">${day.weather.condition} ${day.weather.temperature}°C</span>` : ''}</h4>
            <div class="timeline">
                ${day.activities.map(act => `
                    <div class="timeline-item">
                        <div class="time">${act.time}</div>
                        <div class="activity-name">${act.activity}</div>
                        <div class="activity-details">📍 ${act.location} · ⏱️ ${act.duration} · ${formatCurrency(act.estimatedCost)}</div>
                        ${act.notes ? `<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">💡 ${act.notes}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    // Optimize button
    document.getElementById('optimizeBtn').onclick = async () => {
        try {
            const data = await api(`/trips/${trip._id}/optimize`, { method: 'PUT' });
            showToast('Trip optimized for weather!', 'success');
            displayItinerary(data.trip);
        } catch (e) { showToast(e.message, 'error'); }
    };
}

async function loadMyTrips() {
    try {
        const data = await api('/trips/my-trips');
        const container = document.getElementById('myTrips');
        if (!container) return;
        if (!data.trips || data.trips.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);">No trips planned yet.</p>';
            return;
        }
        container.innerHTML = data.trips.slice(0, 5).map(t => `
            <div class="settlement-item" style="cursor:pointer;" onclick="viewTripDetail('${t._id}')">
                <span>🗺️ ${t.destination}</span>
                <span style="color:var(--text-muted);font-size:12px;">${formatDate(t.startDate)} - ${formatDate(t.endDate)}</span>
                <span class="badge badge-${t.status === 'finalized' ? 'success' : 'primary'}">${t.status}</span>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

async function viewTripDetail(id) {
    try {
        const data = await api(`/trips/${id}`);
        displayItinerary(data.trip);
    } catch (e) { showToast('Error loading trip', 'error'); }
}

// ---- Smart Booking ----
function setupBooking() {
    // Booking tabs
    document.getElementById('bookingTabs')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab')) {
            document.querySelectorAll('#bookingTabs .tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById('tab-' + e.target.dataset.tab)?.classList.add('active');
            if (e.target.dataset.tab === 'my-bookings') loadMyBookings();
        }
    });

    // Hotel booking
    document.getElementById('hotelBookingForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api('/bookings/hotel', {
                method: 'POST',
                body: {
                    destination: document.getElementById('hotelDest').value,
                    hotelName: document.getElementById('hotelName').value,
                    checkIn: document.getElementById('hotelCheckIn').value,
                    checkOut: document.getElementById('hotelCheckOut').value,
                    roomType: document.getElementById('hotelRoom').value,
                    guests: parseInt(document.getElementById('hotelGuests').value),
                    totalAmount: parseInt(document.getElementById('hotelAmount').value)
                }
            });
            showToast('Hotel booked successfully!', 'success');
            e.target.reset();
        } catch (err) { showToast(err.message, 'error'); }
    });

    // Cab booking
    document.getElementById('cabBookingForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api('/bookings/cab', {
                method: 'POST',
                body: {
                    pickupLocation: document.getElementById('cabPickup').value,
                    dropLocation: document.getElementById('cabDrop').value,
                    cabType: document.getElementById('cabType').value,
                    rideDate: document.getElementById('cabDate').value,
                    totalAmount: parseInt(document.getElementById('cabAmount').value)
                }
            });
            showToast('Cab booked!', 'success');
            e.target.reset();
        } catch (err) { showToast(err.message, 'error'); }
    });

    // Adventure booking
    document.getElementById('adventureBookingForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api('/bookings/adventure', {
                method: 'POST',
                body: {
                    activityName: document.getElementById('advName').value,
                    destination: document.getElementById('advDest').value,
                    activityDate: document.getElementById('advDate').value,
                    slots: parseInt(document.getElementById('advSlots').value),
                    totalAmount: parseInt(document.getElementById('advAmount').value)
                }
            });
            showToast('Adventure booked!', 'success');
            e.target.reset();
        } catch (err) { showToast(err.message, 'error'); }
    });
}

async function loadMyBookings() {
    try {
        const data = await api('/bookings/my-bookings');
        const container = document.getElementById('myBookingsList');
        if (!container) return;
        if (!data.bookings || data.bookings.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">🏨</div><h3>No bookings yet</h3></div>';
            return;
        }
        container.innerHTML = data.bookings.map(b => {
            const typeIcons = { hotel: '🏨', cab: '🚕', adventure: '🧗' };
            const statusColors = { pending: 'warning', confirmed: 'success', cancelled: 'danger', completed: 'info' };
            return `
                <div class="glass-card mb-2">
                    <div class="flex-between">
                        <div>
                            <h4>${typeIcons[b.type]} ${b.hotelName || b.activityName || b.cabType + ' Cab'}</h4>
                            <p style="color:var(--text-muted);font-size:13px;">📍 ${b.destination || b.pickupLocation || ''} · ${b.confirmationCode}</p>
                        </div>
                        <div style="text-align:right;">
                            <div class="badge badge-${statusColors[b.status]}">${b.status}</div>
                            <p style="font-size:18px;font-weight:700;color:var(--success);margin-top:4px;">${formatCurrency(b.totalAmount)}</p>
                        </div>
                    </div>
                    ${b.status === 'pending' ? `
                        <div style="margin-top:12px;display:flex;gap:8px;">
                            <button class="btn btn-success btn-sm" onclick="processPayment('${b._id}', ${b.totalAmount})">💳 Pay Now</button>
                            <button class="btn btn-danger btn-sm" onclick="cancelBooking('${b._id}')">❌ Cancel</button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    } catch (e) { console.error(e); }
}

async function cancelBooking(id) {
    try {
        await api(`/bookings/${id}/cancel`, { method: 'PUT' });
        showToast('Booking cancelled', 'success');
        loadMyBookings();
    } catch (e) { showToast(e.message, 'error'); }
}

async function processPayment(bookingId, amount) {
    try {
        const calcData = await api('/payments/calculate', { method: 'POST', body: { bookingId } });
        const breakdown = calcData.breakdown;

        openModal(`
            <div class="modal-header"><h2>💳 Payment</h2><button class="modal-close" onclick="closeModal()">✕</button></div>
            <div class="settlement-item"><span>Base Amount</span><span>${formatCurrency(breakdown.baseAmount)}</span></div>
            <div class="settlement-item"><span>Tax (18% GST)</span><span>${formatCurrency(breakdown.tax)}</span></div>
            <div class="settlement-item"><span>Discount</span><span style="color:var(--success);">-${formatCurrency(breakdown.discount)}</span></div>
            <div class="settlement-item" style="border:2px solid var(--primary);"><span style="font-weight:700;">Total</span><span style="font-weight:700;font-size:20px;color:var(--success);">${formatCurrency(breakdown.totalAmount)}</span></div>
            <div class="form-group mt-2"><label class="form-label">Payment Method</label>
                <select class="form-select" id="payMethod"><option value="upi">UPI</option><option value="card">Card</option><option value="netbanking">Net Banking</option></select>
            </div>
            <button class="btn btn-success btn-lg w-full mt-2" onclick="confirmPayment('${bookingId}', ${breakdown.baseAmount}, ${breakdown.tax}, ${breakdown.discount}, ${breakdown.totalAmount})">✅ Confirm Payment</button>
        `);
    } catch (e) { showToast(e.message, 'error'); }
}

async function confirmPayment(bookingId, amount, tax, discount, totalAmount) {
    try {
        const initData = await api('/payments/initiate', {
            method: 'POST',
            body: { bookingId, amount, tax, discount, totalAmount, method: document.getElementById('payMethod')?.value || 'upi' }
        });

        // Simulate payment verification
        await api('/payments/verify', {
            method: 'POST',
            body: { paymentId: initData.payment._id }
        });

        closeModal();
        showToast('Payment successful! ✅', 'success');
        loadMyBookings();
        loadDashboardStats();
    } catch (e) { showToast(e.message, 'error'); }
}

async function loadPaymentHistory() {
    try {
        const data = await api('/payments/history');
        const container = document.getElementById('paymentHistory');
        if (!container) return;
        if (!data.payments || data.payments.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);">No payments yet.</p>';
            return;
        }
        container.innerHTML = `<div class="table-wrapper"><table class="data-table">
            <thead><tr><th>Transaction ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Receipt</th></tr></thead>
            <tbody>${data.payments.map(p => `
                <tr>
                    <td><code>${p.transactionId}</code></td>
                    <td style="font-weight:700;">${formatCurrency(p.totalAmount)}</td>
                    <td>${p.method?.toUpperCase()}</td>
                    <td><span class="badge badge-${p.status === 'completed' ? 'success' : 'warning'}">${p.status}</span></td>
                    <td>${formatDate(p.createdAt)}</td>
                    <td>${p.receipt ? `<span class="badge badge-info">${p.receipt.receiptNumber}</span>` : '-'}</td>
                </tr>
            `).join('')}</tbody></table></div>`;
    } catch (e) { console.error(e); }
}

// ---- Price Tracker ----
function setupPriceTracker() {
    document.getElementById('priceDestSearch')?.addEventListener('input', debounce(loadPriceTrends, 400));
}

async function loadPriceTrends() {
    const dest = document.getElementById('priceDestSearch')?.value || '';
    try {
        const data = await api(`/prices/trends?destination=${dest}`);
        const container = document.getElementById('priceResults');
        if (!container) return;
        if (!data.trends || data.trends.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">📊</div><h3>No price data available</h3><p>Price data will appear after seeding the database</p></div>';
            return;
        }
        container.innerHTML = data.trends.map(t => {
            const trendIcon = { rising: '📈', falling: '📉', stable: '➡️' };
            return `<div class="glass-card">
                <h4>${t.hotelName}</h4>
                <p style="color:var(--text-muted);font-size:13px;">📍 ${t.destination}</p>
                <p style="font-size:24px;font-weight:700;color:var(--success);margin:8px 0;">${formatCurrency(t.currentPrice)}<span style="font-size:14px;color:var(--text-muted);"> /night</span></p>
                <p>${trendIcon[t.trend]} Trend: ${t.trend}</p>
                <p style="font-size:12px;color:var(--text-muted);">Low: ${formatCurrency(t.lowestPrice)} · High: ${formatCurrency(t.highestPrice)}</p>
            </div>`;
        }).join('');
    } catch (e) { console.error(e); }
}

// ---- Weather ----
function setupWeather() {
    document.getElementById('checkWeatherBtn')?.addEventListener('click', loadWeather);
    document.getElementById('weatherCity')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') loadWeather(); });
}

async function loadWeather() {
    const city = document.getElementById('weatherCity')?.value;
    if (!city) return showToast('Enter a city name', 'warning');

    try {
        const [weatherData, forecastData] = await Promise.all([
            api(`/weather/${city}`),
            api(`/weather/forecast/${city}`)
        ]);

        const w = weatherData.weather;
        document.getElementById('weatherResult').innerHTML = `
            <div class="weather-widget">
                <div class="weather-icon">${w.icon || '🌤️'}</div>
                <div class="weather-temp">${w.temp}°C</div>
                <div class="weather-condition">${w.condition}</div>
                <p style="color:var(--text-muted);margin-bottom:12px;">Feels like ${w.feelsLike}°C</p>
                <div class="weather-details">
                    <span>💧 ${w.humidity}%</span>
                    <span>💨 ${w.wind} km/h</span>
                </div>
            </div>`;

        document.getElementById('weatherSuggestions').innerHTML = `
            <h3 style="margin-bottom:12px;">💡 Activity Suggestions</h3>
            ${weatherData.suggestions.map(s => `<div class="settlement-item">${s}</div>`).join('')}`;

        const forecast = forecastData.forecast;
        document.getElementById('forecastGrid').innerHTML = forecast.map(f => `
            <div class="forecast-card">
                <div class="day">${f.dayName.slice(0, 3)}</div>
                <div class="icon">${f.condition.includes('Rain') ? '🌧️' : f.condition.includes('Cloud') ? '☁️' : '☀️'}</div>
                <div class="temp">${f.tempMax}° / ${f.tempMin}°</div>
                <div style="font-size:11px;color:var(--text-muted);">🌧️ ${f.rainChance}</div>
            </div>
        `).join('');
    } catch (e) { showToast(e.message, 'error'); }
}

// ---- Navigation & Map ----
function setupNavigation() {
    document.getElementById('getRouteBtn')?.addEventListener('click', getRoute);
    loadPopularRoutes();
}

function initMap() {
    if (leafletMap) return;
    setTimeout(() => {
        const mapEl = document.getElementById('map');
        if (!mapEl) return;
        leafletMap = L.map('map').setView([20.5937, 78.9629], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(leafletMap);
    }, 200);
}

async function getRoute() {
    const from = document.getElementById('navFrom')?.value;
    const to = document.getElementById('navTo')?.value;
    if (!from || !to) return showToast('Enter both locations', 'warning');

    try {
        const data = await api(`/navigation/route?fromLat=28.6139&fromLng=77.2090&toLat=32.2396&toLng=77.1887`);
        const route = data.route;
        document.getElementById('routeResult').style.display = 'block';
        document.getElementById('routeResult').innerHTML = `
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-icon blue">📏</div><div class="stat-info"><h3>${route.distance}</h3><p>Distance</p></div></div>
                <div class="stat-card"><div class="stat-icon green">⏱️</div><div class="stat-info"><h3>${route.duration}</h3><p>Duration</p></div></div>
                <div class="stat-card"><div class="stat-icon orange">⛽</div><div class="stat-info"><h3>${route.fuelEstimate}</h3><p>Fuel Cost</p></div></div>
                <div class="stat-card"><div class="stat-icon purple">🛣️</div><div class="stat-info"><h3>${route.roadCondition}</h3><p>Road Status</p></div></div>
            </div>`;

        // Draw route on map
        if (leafletMap && route.waypoints) {
            const latlngs = route.waypoints.map(w => [w.lat, w.lng]);
            L.polyline(latlngs, { color: '#6366f1', weight: 4 }).addTo(leafletMap);
            leafletMap.fitBounds(latlngs);
            L.marker(latlngs[0]).addTo(leafletMap).bindPopup(`📍 ${from}`);
            L.marker(latlngs[latlngs.length - 1]).addTo(leafletMap).bindPopup(`📍 ${to}`);
        }
    } catch (e) { showToast(e.message, 'error'); }
}

async function loadPopularRoutes() {
    try {
        const data = await api('/navigation/popular-routes');
        const container = document.getElementById('popularRoutes');
        if (!container || !data.routes) return;
        container.innerHTML = data.routes.map(r => `
            <div class="settlement-item">
                <span>${r.from} → ${r.to}</span>
                <span style="color:var(--text-muted);font-size:12px;">${r.distance} · ${r.duration}</span>
                ${r.scenic ? '<span class="badge badge-success">Scenic</span>' : ''}
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// ---- Nearby Services ----
function setupNearby() {
    document.getElementById('nearbyTabs')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab')) {
            document.querySelectorAll('#nearbyTabs .tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            loadNearby(e.target.dataset.type);
        }
    });
}

async function loadNearby(type) {
    try {
        const data = await api(`/nearby?type=${type}&lat=32.2396&lng=77.1887`);
        const container = document.getElementById('nearbyResults');
        if (!container) return;
        container.innerHTML = (data.places || []).map(p => `
            <div class="glass-card">
                <h4>${p.name}</h4>
                <p style="color:var(--text-muted);font-size:13px;">📏 ${p.distance} away</p>
                ${p.rating ? `<p>⭐ ${p.rating}/5</p>` : ''}
                ${p.phone ? `<p style="margin-top:4px;"><a href="tel:${p.phone}" style="color:var(--info);">📞 ${p.phone}</a></p>` : ''}
                ${p.cuisine ? `<p style="font-size:13px;color:var(--text-secondary);">🍽️ ${p.cuisine} · ${p.priceRange}</p>` : ''}
                ${p.bank ? `<p style="font-size:13px;color:var(--text-secondary);">🏦 ${p.bank}</p>` : ''}
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// ---- Emergency SOS ----
function setupEmergency() {
    document.getElementById('sosBtn')?.addEventListener('click', sendSOS);
}

async function sendSOS() {
    if (!confirm('🚨 Are you sure you want to send an SOS alert?')) return;

    try {
        let lat = 28.6139, lng = 77.2090;
        if (navigator.geolocation) {
            try {
                const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }));
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
            } catch (e) { /* Use default coordinates */ }
        }

        const data = await api('/emergency/sos', { method: 'POST', body: { lat, lng, message: 'Emergency! Need help!' } });
        showToast('🚨 SOS Alert Sent! Help is on the way!', 'error');

        openModal(`
            <div class="modal-header"><h2>🚨 SOS Alert Sent!</h2><button class="modal-close" onclick="closeModal()">✕</button></div>
            <p style="color:var(--success);font-weight:700;margin-bottom:16px;">Your location has been shared with emergency services</p>
            <h4 style="margin-bottom:12px;">📞 Emergency Numbers</h4>
            <div class="settlement-item"><span>👮 Police</span><a href="tel:100" class="btn btn-danger btn-sm">Call 100</a></div>
            <div class="settlement-item"><span>🚑 Ambulance</span><a href="tel:108" class="btn btn-danger btn-sm">Call 108</a></div>
            <div class="settlement-item"><span>🚒 Fire</span><a href="tel:101" class="btn btn-danger btn-sm">Call 101</a></div>
        `);
    } catch (e) { showToast(e.message, 'error'); }
}

async function loadSafetyTips() {
    try {
        const data = await api('/emergency/safety-tips');
        const container = document.getElementById('safetyTips');
        if (!container) return;
        container.innerHTML = (data.safetyTips || []).map(cat => `
            <div style="margin-bottom:16px;">
                <h4 style="margin-bottom:8px;">${cat.category}</h4>
                ${cat.tips.map(t => `<div class="settlement-item">${t}</div>`).join('')}
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// ---- Expense Splitter ----
function setupExpense() {
    document.getElementById('expenseGroupForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const membersStr = document.getElementById('expMembers').value;
            const members = membersStr.split(',').map(m => ({ name: m.trim(), email: '' }));
            
            await api('/expenses/group', {
                method: 'POST',
                body: {
                    groupName: document.getElementById('expGroupName').value,
                    tripDestination: document.getElementById('expTripDest').value,
                    members
                }
            });
            showToast('Expense group created!', 'success');
            e.target.reset();
            loadMyExpenseGroups();
        } catch (err) { showToast(err.message, 'error'); }
    });
}

async function loadMyExpenseGroups() {
    try {
        const data = await api('/expenses/my-groups');
        const container = document.getElementById('myExpGroups');
        if (!container) return;
        if (!data.groups || data.groups.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);">No expense groups yet.</p>';
            return;
        }
        container.innerHTML = data.groups.map(g => `
            <div class="settlement-item" style="cursor:pointer;" onclick="viewExpenseGroup('${g._id}')">
                <span>💰 ${g.groupName}</span>
                <span style="color:var(--text-muted);font-size:12px;">${g.members.length} members</span>
                <span class="settlement-amount">${formatCurrency(g.totalAmount)}</span>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

async function viewExpenseGroup(id) {
    try {
        const [groupData, splitData] = await Promise.all([
            api(`/expenses/group/${id}`),
            api(`/expenses/split/${id}`)
        ]);
        const container = document.getElementById('expenseDetails');
        if (!container) return;
        container.style.display = 'block';
        container.innerHTML = `
            <div class="flex-between mb-2">
                <h3>💰 ${splitData.groupName}</h3>
                <span style="font-size:24px;font-weight:700;color:var(--success);">${formatCurrency(splitData.totalExpenses)}</span>
            </div>
            <p style="color:var(--text-muted);margin-bottom:16px;">Per person avg: ${formatCurrency(splitData.perPersonAvg)}</p>
            
            <h4 style="margin-bottom:12px;">📊 Expenses</h4>
            ${(splitData.expenseBreakdown || []).map(e => `
                <div class="settlement-item">
                    <span>${e.description}</span>
                    <span style="color:var(--text-muted);font-size:12px;">Paid by: ${e.paidBy}</span>
                    <span class="settlement-amount">${formatCurrency(e.amount)}</span>
                </div>
            `).join('') || '<p style="color:var(--text-muted);">No expenses yet</p>'}

            <h4 style="margin:20px 0 12px;">💸 Settlements (Who Owes Whom)</h4>
            ${(splitData.settlements || []).map(s => `
                <div class="settlement-item">
                    <span>${s.from}</span>
                    <span class="settlement-arrow">→</span>
                    <span>${s.to}</span>
                    <span class="settlement-amount">${formatCurrency(s.amount)}</span>
                </div>
            `).join('') || '<p style="color:var(--text-muted);">No settlements needed</p>'}

            <div style="margin-top:20px;">
                <h4 style="margin-bottom:12px;">➕ Add Expense</h4>
                <form onsubmit="addExpense(event, '${id}')">
                    <div class="form-row">
                        <div class="form-group"><input type="text" class="form-input" id="newExpDesc" placeholder="Description" required></div>
                        <div class="form-group"><input type="number" class="form-input" id="newExpAmount" placeholder="Amount ₹" required></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><select class="form-select" id="newExpCategory"><option value="food">🍽️ Food</option><option value="transport">🚗 Transport</option><option value="accommodation">🏨 Accommodation</option><option value="activities">🎯 Activities</option><option value="shopping">🛍️ Shopping</option><option value="other">📦 Other</option></select></div>
                        <div class="form-group"><button type="submit" class="btn btn-primary w-full">➕ Add</button></div>
                    </div>
                </form>
            </div>
        `;
    } catch (e) { showToast(e.message, 'error'); }
}

async function addExpense(e, groupId) {
    e.preventDefault();
    try {
        await api('/expenses/add', {
            method: 'POST',
            body: {
                groupId,
                description: document.getElementById('newExpDesc').value,
                amount: parseFloat(document.getElementById('newExpAmount').value),
                category: document.getElementById('newExpCategory').value,
                splitType: 'equal'
            }
        });
        showToast('Expense added!', 'success');
        viewExpenseGroup(groupId);
    } catch (err) { showToast(err.message, 'error'); }
}

// ---- Road Condition ----
function setupRoadCondition() {
    document.getElementById('roadReportForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api('/roads/report', {
                method: 'POST',
                body: {
                    location: document.getElementById('roadLocation').value,
                    type: document.getElementById('roadType').value,
                    severity: document.getElementById('roadSeverity').value,
                    description: document.getElementById('roadDesc').value,
                    lat: 32.24, lng: 77.19
                }
            });
            showToast('Road condition report submitted!', 'success');
            e.target.reset();
            loadRoadAlerts();
        } catch (err) { showToast(err.message, 'error'); }
    });
}

async function loadRoadAlerts() {
    try {
        const data = await api('/roads/alerts');
        const container = document.getElementById('roadAlerts');
        if (!container) return;
        if (!data.alerts || data.alerts.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);">No active alerts</p>';
            return;
        }
        const typeIcons = { blocked: '🚧', landslide: '⛰️', waterlogging: '🌊', traffic: '🚗', damaged: '🕳️', construction: '🏗️' };
        const sevColors = { low: 'info', medium: 'warning', high: 'danger', critical: 'danger' };
        container.innerHTML = data.alerts.map(a => `
            <div class="settlement-item">
                <span>${typeIcons[a.type] || '⚠️'} ${a.location}</span>
                <span class="badge badge-${sevColors[a.severity]}">${a.severity}</span>
                <span style="color:var(--text-muted);font-size:12px;">${timeSince(a.createdAt)}</span>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// ---- Permit Checker ----
function setupPermit() {
    document.getElementById('checkPermitBtn')?.addEventListener('click', checkPermit);
}

async function checkPermit() {
    const dest = document.getElementById('permitDest')?.value;
    if (!dest) return showToast('Select a destination', 'warning');

    try {
        const data = await api(`/permits/check?destination=${dest}`);
        const container = document.getElementById('permitResult');
        if (!container) return;

        if (!data.permitRequired) {
            container.innerHTML = `<div class="glass-card"><div class="text-center" style="padding:32px;">
                <div style="font-size:64px;margin-bottom:16px;">✅</div>
                <h3 style="color:var(--success);">No Permit Required</h3>
                <p style="color:var(--text-secondary);">${data.message}</p>
            </div></div>`;
        } else {
            const info = data.permitInfo;
            container.innerHTML = `<div class="glass-card">
                <div class="flex-between mb-2">
                    <h3>📋 ${dest} — Permit Required</h3>
                    <span class="badge badge-warning">${info.type || info.permitType}</span>
                </div>
                ${info.fee !== undefined ? `<p>💰 Fee: ${info.fee === 0 ? 'Free' : '₹' + info.fee}</p>` : ''}
                ${info.processingTime ? `<p>⏱️ Processing Time: ${info.processingTime}</p>` : ''}
                
                <h4 style="margin:16px 0 8px;">📄 Required Documents</h4>
                ${(info.documents || info.requiredDocuments || []).map(d => `<div class="settlement-item">📎 ${d}</div>`).join('')}
                
                ${info.restrictions ? `<h4 style="margin:16px 0 8px;">⚠️ Restrictions</h4>${info.restrictions.map(r => `<div class="settlement-item" style="border-color:rgba(239,68,68,0.2);">⚠️ ${r}</div>`).join('')}` : ''}
                
                ${info.applicationLink ? `<a href="${info.applicationLink}" target="_blank" class="btn btn-primary mt-2">🔗 Apply Online</a>` : ''}
            </div>`;
        }
    } catch (e) { showToast(e.message, 'error'); }
}

// ---- Network Coverage ----
function setupNetwork() {
    document.getElementById('coverageReportForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api('/network/report', {
                method: 'POST',
                body: {
                    location: document.getElementById('covLocation').value,
                    operator: document.getElementById('covOperator').value,
                    signalStrength: parseInt(document.getElementById('covSignal').value),
                    coverageType: document.getElementById('covType').value,
                    lat: 32.24, lng: 77.19
                }
            });
            showToast('Coverage report submitted!', 'success');
            e.target.reset();
        } catch (err) { showToast(err.message, 'error'); }
    });
}

async function loadDeadZones() {
    try {
        const data = await api('/network/deadzones');
        const container = document.getElementById('deadZonesList');
        if (!container) return;
        container.innerHTML = (data.deadzones || []).map(d => `
            <div class="settlement-item">
                <span>📵 ${d.location}</span>
                <span class="badge badge-${d.signalStrength === 0 ? 'danger' : 'warning'}">${d.coverageType === 'none' ? 'No Signal' : d.coverageType}</span>
                <span style="color:var(--text-muted);font-size:12px;">Signal: ${d.signalStrength}%</span>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// ---- Bluetooth Offline Messaging ----
function setupBluetooth() {
    document.getElementById('discoverBtn')?.addEventListener('click', discoverDevices);
    document.getElementById('syncBtn')?.addEventListener('click', syncMessages);
    document.getElementById('btMessageForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await api('/bluetooth/message', {
                method: 'POST',
                body: {
                    recipientName: document.getElementById('btRecipient').value,
                    message: document.getElementById('btMessage').value,
                    type: document.getElementById('btType').value
                }
            });
            showToast('Message sent!', 'success');
            document.getElementById('btMessage').value = '';
            loadBTMessages();
        } catch (err) { showToast(err.message, 'error'); }
    });
}

async function discoverDevices() {
    try {
        const data = await api('/bluetooth/discover');
        const container = document.getElementById('nearbyDevices');
        if (!container) return;
        container.innerHTML = (data.devices || []).map(d => `
            <div class="settlement-item">
                <span>📱 ${d.name}</span>
                <span style="color:var(--text-muted);font-size:12px;">${d.distance} · ${d.signalStrength}</span>
                <button class="btn btn-primary btn-sm" onclick="connectDevice('${d.deviceId}', '${d.name}')">Connect</button>
            </div>
        `).join('');
    } catch (e) { showToast(e.message, 'error'); }
}

async function connectDevice(deviceId, deviceName) {
    try {
        await api('/bluetooth/connect', { method: 'POST', body: { deviceId, deviceName } });
        showToast(`Connected to ${deviceName}!`, 'success');
    } catch (e) { showToast(e.message, 'error'); }
}

async function loadBTMessages() {
    try {
        const data = await api('/bluetooth/messages');
        const container = document.getElementById('btMessages');
        if (!container) return;
        if (!data.messages || data.messages.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);">No messages yet</p>';
            return;
        }
        container.innerHTML = data.messages.map(m => {
            const typeIcons = { text: '📝', sos: '🆘', location: '📍' };
            return `<div class="settlement-item">
                <span>${typeIcons[m.type]} <strong>${m.senderName}</strong>: ${m.message}</span>
                <span style="color:var(--text-muted);font-size:12px;">${timeSince(m.timestamp)}</span>
                <span class="badge badge-${m.synced ? 'success' : 'warning'}">${m.synced ? 'Synced' : 'Pending'}</span>
            </div>`;
        }).join('');
    } catch (e) { console.error(e); }
}

async function syncMessages() {
    try {
        const msgs = await api('/bluetooth/pending');
        if (msgs.messages && msgs.messages.length > 0) {
            const ids = msgs.messages.map(m => m.id);
            await api('/bluetooth/sync', { method: 'PUT', body: { messageIds: ids } });
            showToast(`${ids.length} messages synced!`, 'success');
            loadBTMessages();
        } else {
            showToast('No pending messages to sync', 'info');
        }
    } catch (e) { showToast(e.message, 'error'); }
}

// ---- Admin Panel ----
async function loadAdminUsers() {
    const user = getUser();
    if (user?.role !== 'admin') return;
    try {
        const data = await api('/auth/users');
        const container = document.getElementById('adminContent');
        if (!container) return;
        container.innerHTML = `<div class="table-wrapper"><table class="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
            <tbody>${(data.users || []).map(u => `
                <tr>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td><span class="badge badge-primary">${u.role}</span></td>
                    <td><span class="badge badge-${u.isActive ? 'success' : 'danger'}">${u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>${formatDate(u.createdAt)}</td>
                    <td><button class="btn btn-${u.isActive ? 'danger' : 'success'} btn-sm" onclick="toggleUser('${u._id}')">${u.isActive ? 'Deactivate' : 'Activate'}</button></td>
                </tr>
            `).join('')}</tbody></table></div>`;
    } catch (e) { console.error(e); }
}

async function toggleUser(id) {
    try {
        await api(`/auth/users/${id}/toggle`, { method: 'PUT' });
        showToast('User status updated', 'success');
        loadAdminUsers();
    } catch (e) { showToast(e.message, 'error'); }
}

async function loadAdminReports() {
    try {
        const data = await api('/roads/reports?status=pending');
        const container = document.getElementById('adminContent');
        if (!container) return;
        if (!data.reports || data.reports.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">✅</div><h3>No pending reports</h3></div>';
            return;
        }
        container.innerHTML = data.reports.map(r => `
            <div class="glass-card mb-2">
                <div class="flex-between">
                    <div>
                        <h4>📍 ${r.location}</h4>
                        <p style="color:var(--text-muted);">${r.type} · ${r.severity} · ${r.description}</p>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-success btn-sm" onclick="verifyReport('${r._id}', 'verify')">✅ Verify</button>
                        <button class="btn btn-danger btn-sm" onclick="verifyReport('${r._id}', 'reject')">❌ Reject</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

async function verifyReport(id, action) {
    try {
        await api(`/roads/verify/${id}`, { method: 'PUT', body: { action } });
        showToast(`Report ${action === 'verify' ? 'verified' : 'rejected'}!`, 'success');
        loadAdminReports();
    } catch (e) { showToast(e.message, 'error'); }
}

async function loadAdminBookings() {
    try {
        const data = await api('/bookings/all');
        const container = document.getElementById('adminContent');
        if (!container) return;
        container.innerHTML = `<div class="table-wrapper"><table class="data-table">
            <thead><tr><th>User</th><th>Type</th><th>Details</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>${(data.bookings || []).map(b => `
                <tr>
                    <td>${b.userId?.name || 'N/A'}</td>
                    <td><span class="badge badge-primary">${b.type}</span></td>
                    <td>${b.hotelName || b.activityName || b.cabType || ''}</td>
                    <td style="font-weight:700;">${formatCurrency(b.totalAmount)}</td>
                    <td><span class="badge badge-${b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'warning'}">${b.status}</span></td>
                    <td>${formatDate(b.createdAt)}</td>
                </tr>
            `).join('')}</tbody></table></div>`;
    } catch (e) { console.error(e); }
}

// ---- Helper Utilities ----
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ---- 17. Chat / Real-time Messaging ----
let activeConversationId = null;
let chatPollInterval = null;
let conversationsCache = [];

function setupChat() {
    updateUnreadBadge();
    setInterval(updateUnreadBadge, 30000);
}

function startChatPolling() {
    stopChatPolling();
    chatPollInterval = setInterval(() => {
        if (currentPage === 'chat') {
            loadConversations(true);
            if (activeConversationId) {
                loadMessages(activeConversationId, true);
            }
        }
    }, 4000);
}

function stopChatPolling() {
    if (chatPollInterval) {
        clearInterval(chatPollInterval);
        chatPollInterval = null;
    }
}

async function updateUnreadBadge() {
    try {
        const data = await api('/chat/unread-count');
        const badge = document.getElementById('chatUnreadBadge');
        if (badge) {
            if (data.unreadCount > 0) {
                badge.textContent = data.unreadCount > 99 ? '99+' : data.unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (e) { /* silent catch */ }
}

async function loadConversations(isSilent = false) {
    try {
        const data = await api('/chat/conversations');
        conversationsCache = data.conversations || [];
        renderConversations(conversationsCache);
    } catch (e) {
        console.error('Failed to load conversations:', e);
        if (!isSilent) {
            const listEl = document.getElementById('chatConvList');
            if (listEl) {
                listEl.innerHTML = `
                    <div class="chat-empty-state">
                        <p style="color:var(--text-muted)">Could not load chats. Try again later.</p>
                    </div>`;
            }
        }
    }
}

function renderConversations(conversations) {
    const listEl = document.getElementById('chatConvList');
    if (!listEl) return;

    if (!conversations.length) {
        listEl.innerHTML = `
            <div class="chat-empty-state">
                <div class="icon">💬</div>
                <h3>No conversations yet</h3>
                <p>Start chatting with a service provider!</p>
                <button class="btn btn-primary btn-sm" onclick="openNewChatModal()" style="margin-top:12px;">✏️ Start New Chat</button>
            </div>`;
        return;
    }

    listEl.innerHTML = conversations.map(c => {
        const otherUser = c.otherParticipant || {};
        const isActive = c._id === activeConversationId;
        const roleIcon = otherUser.role === 'service_provider' ? '🏨' : otherUser.role === 'admin' ? '👑' : '👤';
        const roleName = otherUser.role === 'service_provider' ? 'Provider' : otherUser.role === 'admin' ? 'Admin' : 'Traveler';
        
        return `
            <div class="chat-conv-item ${isActive ? 'active' : ''}" onclick="openConversation('${c._id}', '${escapeHtml(otherUser.name || 'User')}', '${roleName}')">
                <div class="chat-avatar">${roleIcon}</div>
                <div class="chat-conv-info">
                    <div class="chat-conv-top">
                        <span class="chat-conv-name">${escapeHtml(otherUser.name || 'User')}</span>
                        <span class="chat-conv-time">${c.lastMessageAt ? formatDate(c.lastMessageAt) : ''}</span>
                    </div>
                    <div class="chat-conv-bottom">
                        <span class="chat-conv-preview">${escapeHtml(c.lastMessage || 'No messages yet')}</span>
                        ${c.unreadCount > 0 ? `<span class="unread-badge">${c.unreadCount}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterConversations() {
    const query = document.getElementById('chatSearchConv')?.value.toLowerCase() || '';
    const filtered = conversationsCache.filter(c => {
        const name = c.otherParticipant?.name?.toLowerCase() || '';
        const msg = c.lastMessage?.toLowerCase() || '';
        return name.includes(query) || msg.includes(query);
    });
    renderConversations(filtered);
}

async function openConversation(convId, otherUserName, otherUserRole) {
    activeConversationId = convId;
    
    document.getElementById('chatThreadPlaceholder').style.display = 'none';
    document.getElementById('chatThreadActive').style.display = 'flex';
    document.getElementById('chatThreadName').textContent = otherUserName;
    document.getElementById('chatThreadRole').textContent = otherUserRole;
    
    const roleIcon = otherUserRole.includes('Provider') ? '🏨' : otherUserRole.includes('Admin') ? '👑' : '👤';
    document.getElementById('chatThreadAvatar').textContent = roleIcon;

    document.getElementById('chatSidebar')?.classList.add('mobile-hidden');
    document.querySelectorAll('.chat-conv-item').forEach(el => el.classList.remove('active'));

    await loadMessages(convId);
    try {
        await api(`/chat/read/${convId}`, { method: 'PUT' });
        updateUnreadBadge();
    } catch (e) {}
}

function closeChatThread() {
    activeConversationId = null;
    document.getElementById('chatThreadPlaceholder').style.display = 'flex';
    document.getElementById('chatThreadActive').style.display = 'none';
    document.getElementById('chatSidebar')?.classList.remove('mobile-hidden');
}

async function loadMessages(convId, isSilent = false) {
    try {
        const data = await api(`/chat/conversations/${convId}/messages`);
        const messages = data.messages || [];
        const msgContainer = document.getElementById('chatMessages');
        if (!msgContainer) return;

        const currentUserId = currentUser?._id;
        
        msgContainer.innerHTML = messages.map(m => {
            const senderId = typeof m.sender === 'object' ? m.sender?._id : m.sender;
            const isSent = senderId === currentUserId;
            const timeStr = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            return `
                <div class="chat-bubble ${isSent ? 'chat-bubble-sent' : 'chat-bubble-received'}">
                    <div class="chat-bubble-text">${escapeHtml(m.text)}</div>
                    <div class="chat-bubble-time">${timeStr} ${isSent ? (m.read ? '✓✓' : '✓') : ''}</div>
                </div>
            `;
        }).join('');

        msgContainer.scrollTop = msgContainer.scrollHeight;
    } catch (e) {
        console.error('Failed to load messages:', e);
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input?.value.trim();
    if (!text || !activeConversationId) return;

    input.value = '';
    const btn = document.getElementById('chatSendBtn');
    if (btn) btn.disabled = true;

    try {
        await api('/chat/send', {
            method: 'POST',
            body: { conversationId: activeConversationId, text }
        });

        await loadMessages(activeConversationId, true);
        loadConversations(true);
    } catch (e) {
        showToast(e.message || 'Failed to send message', 'error');
    } finally {
        if (btn) btn.disabled = false;
        input.focus();
    }
}

function openNewChatModal() {
    showModal(`
        <h2 style="margin-bottom:16px;">💬 Start New Chat</h2>
        <div class="form-group">
            <input type="text" class="form-input" id="chatSearchUserInput" placeholder="🔍 Search users by name or email..." oninput="searchChatUsers()">
        </div>
        <div id="chatUserSearchResults" style="max-height:300px; overflow-y:auto; margin-top:12px;">
            <p style="color:var(--text-muted); text-align:center; padding:20px;">Searching available users...</p>
        </div>
    `);
    searchChatUsers();
}

async function searchChatUsers() {
    const query = document.getElementById('chatSearchUserInput')?.value.trim() || '';
    const resultsEl = document.getElementById('chatUserSearchResults');
    if (!resultsEl) return;

    try {
        const data = await api(`/chat/users?search=${encodeURIComponent(query)}`);
        const users = data.users || [];

        if (!users.length) {
            resultsEl.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:20px;">No users found matching "${escapeHtml(query)}".</p>`;
            return;
        }

        resultsEl.innerHTML = users.map(u => {
            const roleBadge = u.role === 'service_provider' ? 'badge-purple' : u.role === 'admin' ? 'badge-danger' : 'badge-primary';
            const roleIcon = u.role === 'service_provider' ? '🏨' : u.role === 'admin' ? '👑' : '👤';
            const roleLabel = u.role === 'service_provider' ? 'Service Provider' : u.role === 'admin' ? 'Admin' : 'Traveler';
            return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--glass-bg); border:1px solid var(--border-color); border-radius:10px; margin-bottom:8px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:20px;">${roleIcon}</span>
                        <div>
                            <div style="font-weight:600; color:var(--text-main);">${escapeHtml(u.name)}</div>
                            <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(u.email)} • <span class="badge ${roleBadge}">${roleLabel}</span></div>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="startNewChat('${u._id}', '${escapeHtml(u.name)}', '${roleLabel}')">💬 Chat</button>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Search user error:', e);
    }
}

async function startNewChat(userId, userName, userRole) {
    closeModal();
    try {
        const res = await api('/chat/send', {
            method: 'POST',
            body: { recipientId: userId, text: '👋 Hi!' }
        });
        await loadConversations();
        if (res.conversationId) {
            openConversation(res.conversationId, userName, userRole);
        }
    } catch (e) {
        showToast(e.message || 'Could not start chat', 'error');
    }
}

console.log('📊 Dashboard module loaded');
