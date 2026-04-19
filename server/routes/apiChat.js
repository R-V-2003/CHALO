// AI-Powered Smart Navigation Chat — Groq (Llama 3)
const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken } = require('./apiAuth');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// ─── Known landmarks / places in Ahmedabad with approximate coords ───
const KNOWN_PLACES = [
  // Stops (these are exact)
  { name: 'Gujarat University', lat: 23.0339, lng: 72.5467, type: 'stop' },
  { name: 'Gurukul Road', lat: 23.0365, lng: 72.5395, type: 'stop' },
  { name: 'Drive-in Road', lat: 23.0465, lng: 72.5335, type: 'stop' },
  { name: 'Thaltej', lat: 23.0520, lng: 72.5080, type: 'stop' },
  { name: 'Akbarnagar', lat: 23.0400, lng: 72.5550, type: 'stop' },
  { name: 'Memnagar', lat: 23.0420, lng: 72.5480, type: 'stop' },
  { name: 'Vijay Cross Roads', lat: 23.0350, lng: 72.5350, type: 'stop' },
  { name: 'Satellite Road', lat: 23.0260, lng: 72.5140, type: 'stop' },
  { name: 'Gurukul Metro', lat: 23.0370, lng: 72.5400, type: 'stop' },
  { name: 'Anand Nagar', lat: 23.0340, lng: 72.5330, type: 'stop' },
  { name: 'Vastrapur Lake', lat: 23.0310, lng: 72.5230, type: 'stop' },
  { name: 'Vastrapur', lat: 23.0290, lng: 72.5180, type: 'stop' },
  { name: 'Paldi', lat: 23.0170, lng: 72.5650, type: 'stop' },
  { name: 'Ashram Road', lat: 23.0240, lng: 72.5590, type: 'stop' },
  { name: 'Income Tax', lat: 23.0300, lng: 72.5580, type: 'stop' },
  { name: 'Navrangpura', lat: 23.0330, lng: 72.5560, type: 'stop' },

  // Additional Ahmedabad landmarks
  { name: 'IIM Ahmedabad', lat: 23.0325, lng: 72.5247, type: 'landmark' },
  { name: 'Iskcon Temple', lat: 23.0275, lng: 72.5170, type: 'landmark' },
  { name: 'Ahmedabad Railway Station', lat: 23.0225, lng: 72.5714, type: 'landmark' },
  { name: 'Sabarmati Ashram', lat: 23.0607, lng: 72.5804, type: 'landmark' },
  { name: 'Law Garden', lat: 23.0290, lng: 72.5600, type: 'landmark' },
  { name: 'CG Road', lat: 23.0275, lng: 72.5560, type: 'landmark' },
  { name: 'Panjrapole', lat: 23.0210, lng: 72.5600, type: 'landmark' },
  { name: 'SG Highway', lat: 23.0360, lng: 72.5060, type: 'landmark' },
  { name: 'Bodakdev', lat: 23.0420, lng: 72.5040, type: 'landmark' },
  { name: 'Prahlad Nagar', lat: 23.0135, lng: 72.5120, type: 'landmark' },
  { name: 'Shivranjani', lat: 23.0130, lng: 72.5280, type: 'landmark' },
  { name: 'Nehru Nagar', lat: 23.0440, lng: 72.5520, type: 'landmark' },
  { name: 'Helmet Cross Roads', lat: 23.0480, lng: 72.5500, type: 'landmark' },
  { name: 'Jodhpur', lat: 23.0330, lng: 72.5090, type: 'landmark' },
  { name: 'Ambawadi', lat: 23.0280, lng: 72.5480, type: 'landmark' },
  { name: 'Polytechnic', lat: 23.0280, lng: 72.5510, type: 'landmark' },
  { name: 'Science City', lat: 23.0725, lng: 72.5109, type: 'landmark' },
  { name: 'Kankaria Lake', lat: 23.0064, lng: 72.5975, type: 'landmark' },
  { name: 'Maninagar', lat: 22.9996, lng: 72.5990, type: 'landmark' },
  { name: 'Vastral', lat: 23.0104, lng: 72.6389, type: 'landmark' },
  { name: 'Chandkheda', lat: 23.1092, lng: 72.5944, type: 'landmark' },
  { name: 'Gota', lat: 23.1025, lng: 72.5450, type: 'landmark' },
  { name: 'Bopal', lat: 23.0350, lng: 72.4650, type: 'landmark' },
  { name: 'South Bopal', lat: 23.0200, lng: 72.4700, type: 'landmark' },
  { name: 'Ghuma', lat: 23.0600, lng: 72.4750, type: 'landmark' },
  { name: 'Sola', lat: 23.0550, lng: 72.5350, type: 'landmark' },
  { name: 'Naranpura', lat: 23.0450, lng: 72.5560, type: 'landmark' },
  { name: 'Usmanpura', lat: 23.0430, lng: 72.5640, type: 'landmark' },
  { name: 'Stadium', lat: 23.0245, lng: 72.5650, type: 'landmark' },
  { name: 'Ellis Bridge', lat: 23.0240, lng: 72.5650, type: 'landmark' },
  { name: 'Lal Darwaja', lat: 23.0260, lng: 72.5820, type: 'landmark' },
  { name: 'Manek Chowk', lat: 23.0260, lng: 72.5850, type: 'landmark' },
  { name: 'Teen Darwaja', lat: 23.0240, lng: 72.5810, type: 'landmark' },
  { name: 'Alpha One Mall', lat: 23.0310, lng: 72.5170, type: 'landmark' },
  { name: 'Sindhu Bhavan', lat: 23.0400, lng: 72.5010, type: 'landmark' },
  { name: 'Judges Bungalow', lat: 23.0410, lng: 72.5110, type: 'landmark' },
];

// ─── Haversine distance in km ───
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Estimate walking time (avg 5 km/h) ───
function walkingTime(distKm) {
  const mins = Math.round((distKm / 5) * 60);
  if (mins < 1) return 'less than 1 min';
  return `${mins} min`;
}

// ─── Build all routes + stops from DB ───
function getRouteData() {
  const routes = db.prepare('SELECT * FROM routes').all();
  const allStops = db.prepare('SELECT * FROM stops ORDER BY route_id, sort_order').all();
  const drivers = db.prepare(`
    SELECT d.name, d.vehicle_number, d.rating, d.total_rides, r.name as route_name
    FROM drivers d LEFT JOIN routes r ON d.route_id = r.id
  `).all();

  const routeMap = {};
  for (const r of routes) {
    routeMap[r.id] = { ...r, stops: [] };
  }
  for (const s of allStops) {
    if (routeMap[s.route_id]) {
      routeMap[s.route_id].stops.push(s);
    }
  }
  return { routes: Object.values(routeMap), drivers };
}

// ─── Find nearest stop to a given lat/lng ───
function findNearestStops(lat, lng, allStops, topN = 5) {
  return allStops
    .map(s => ({ ...s, dist: haversineKm(lat, lng, s.lat, s.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, topN);
}

// ─── Resolve a place name to coordinates ───
function resolvePlace(placeName) {
  const q = placeName.toLowerCase().trim();
  // First try known places
  const found = KNOWN_PLACES.find(p => q.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(q));
  if (found) return found;

  // Try DB stops
  const stops = db.prepare('SELECT * FROM stops').all();
  const stopMatch = stops.find(s => q.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(q));
  if (stopMatch) return { name: stopMatch.name, lat: stopMatch.lat, lng: stopMatch.lng, type: 'stop' };

  return null;
}

// ─── Core: Find best travel plan between two places ───
function findTravelPlan(fromPlace, toPlace) {
  const { routes } = getRouteData();
  const allStops = routes.flatMap(r => r.stops.map(s => ({ ...s, routeName: r.name, routeId: r.id, fare: r.fare, color: r.color })));

  const nearFrom = findNearestStops(fromPlace.lat, fromPlace.lng, allStops, 10);
  const nearTo = findNearestStops(toPlace.lat, toPlace.lng, allStops, 10);

  const plans = [];

  // ─── Try direct routes (same route covers both origin and destination) ───
  for (const fromStop of nearFrom) {
    for (const toStop of nearTo) {
      if (fromStop.route_id === toStop.route_id && fromStop.id !== toStop.id) {
        const walkDistFrom = haversineKm(fromPlace.lat, fromPlace.lng, fromStop.lat, fromStop.lng);
        const walkDistTo = haversineKm(toPlace.lat, toPlace.lng, toStop.lat, toStop.lng);
        const route = routes.find(r => r.id === fromStop.route_id);

        plans.push({
          type: 'direct',
          walkToStop: { name: fromStop.name, distance: walkDistFrom.toFixed(2), walkTime: walkingTime(walkDistFrom) },
          boardRoute: route.name,
          fare: route.fare,
          alightAt: { name: toStop.name, distance: walkDistTo.toFixed(2), walkTime: walkingTime(walkDistTo) },
          totalWalk: (walkDistFrom + walkDistTo).toFixed(2),
          score: walkDistFrom * 3 + walkDistTo * 2 // Weighted score (penalize walking more to board)
        });
      }
    }
  }

  // ─── Try transfer routes (two different routes with transfer at shared/nearby stops) ───
  for (const fromStop of nearFrom.slice(0, 5)) {
    const firstRoute = routes.find(r => r.id === fromStop.route_id);
    if (!firstRoute) continue;

    for (const firstRouteStop of firstRoute.stops) {
      // Find stops on OTHER routes that are near this stop (potential transfer points)
      const transferCandidates = allStops.filter(s =>
        s.route_id !== firstRoute.id &&
        haversineKm(firstRouteStop.lat, firstRouteStop.lng, s.lat, s.lng) < 0.8 // within 800m
      );

      for (const transferStop of transferCandidates) {
        const secondRoute = routes.find(r => r.id === transferStop.route_id);
        if (!secondRoute) continue;

        // Check if the second route has a stop near the destination
        for (const destStop of nearTo) {
          if (destStop.route_id === secondRoute.id) {
            const walkDistFrom = haversineKm(fromPlace.lat, fromPlace.lng, fromStop.lat, fromStop.lng);
            const transferDist = haversineKm(firstRouteStop.lat, firstRouteStop.lng, transferStop.lat, transferStop.lng);
            const walkDistTo = haversineKm(toPlace.lat, toPlace.lng, destStop.lat, destStop.lng);

            plans.push({
              type: 'transfer',
              walkToStop: { name: fromStop.name, distance: walkDistFrom.toFixed(2), walkTime: walkingTime(walkDistFrom) },
              firstRoute: firstRoute.name,
              firstFare: firstRoute.fare,
              alightAt: firstRouteStop.name,
              transferWalk: { distance: transferDist.toFixed(2), walkTime: walkingTime(transferDist) },
              boardAt: transferStop.name,
              secondRoute: secondRoute.name, 
              secondFare: secondRoute.fare,
              finalStop: { name: destStop.name, distance: walkDistTo.toFixed(2), walkTime: walkingTime(walkDistTo) },
              totalFare: firstRoute.fare + secondRoute.fare,
              totalWalk: (walkDistFrom + transferDist + walkDistTo).toFixed(2),
              score: walkDistFrom * 3 + transferDist * 4 + walkDistTo * 2 + 2 // Extra penalty for transfers
            });
          }
        }
      }
    }
  }

  // Sort by score (lower = better)
  plans.sort((a, b) => a.score - b.score);

  // Deduplicate plans by route combination
  const seen = new Set();
  const uniquePlans = [];
  for (const p of plans) {
    const key = p.type === 'direct'
      ? `direct:${p.boardRoute}:${p.walkToStop.name}->${p.alightAt.name}`
      : `transfer:${p.firstRoute}:${p.alightAt}->${p.secondRoute}:${p.finalStop.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePlans.push(p);
    }
  }

  return uniquePlans.slice(0, 3); // Return top 3 plans
}

// ─── Build full context for the AI ───
function buildContext() {
  try {
    const { routes, drivers } = getRouteData();

    let ctx = '=== CHALO RIDE-HAILING APP — AHMEDABAD, INDIA ===\n\n';

    ctx += 'ROUTES & STOPS (with GPS coordinates):\n';
    for (const r of routes) {
      ctx += `\n📍 Route: "${r.name}" | Fare: ₹${r.fare} | Distance: ${r.distance}km | Duration: ${r.duration}\n`;
      ctx += `   Stops (in order): `;
      ctx += r.stops.map(s => `${s.name} [${s.lat},${s.lng}]`).join(' → ');
      ctx += '\n';
    }

    ctx += '\nDRIVERS:\n';
    drivers.forEach(d => {
      ctx += `- ${d.name}, Vehicle: ${d.vehicle_number}, Route: ${d.route_name || 'Unassigned'}, Rating: ${d.rating}/5\n`;
    });

    ctx += '\nCONNECTION POINTS (stops near each other on different routes — transfer options):\n';
    const allStops = routes.flatMap(r => r.stops.map(s => ({ ...s, routeName: r.name })));
    const transfers = [];
    for (let i = 0; i < allStops.length; i++) {
      for (let j = i + 1; j < allStops.length; j++) {
        if (allStops[i].route_id !== allStops[j].route_id) {
          const d = haversineKm(allStops[i].lat, allStops[i].lng, allStops[j].lat, allStops[j].lng);
          if (d < 0.8) {
            transfers.push(`"${allStops[i].name}" (${allStops[i].routeName}) ↔ "${allStops[j].name}" (${allStops[j].routeName}) — ${(d * 1000).toFixed(0)}m walk`);
          }
        }
      }
    }
    if (transfers.length) {
      ctx += transfers.join('\n') + '\n';
    } else {
      ctx += 'No direct transfer points within 800m.\n';
    }

    ctx += '\nGENERAL INFO:\n';
    ctx += '- App: CHALO shared auto-rickshaw ride-hailing in Ahmedabad\n';
    ctx += '- Payment: Cash payment to driver after ride\n';
    ctx += '- Operating hours: 6:00 AM to 11:00 PM daily\n';
    ctx += '- Users can track shuttles in real-time on the map\n';

    return ctx;
  } catch (err) {
    console.error('Context build error:', err);
    return 'CHALO is a ride-hailing app in Ahmedabad, India.';
  }
}

// ─── Build travel plan context for a specific navigation query ───
function buildTravelContext(userMessage) {
  // Try to extract origin and destination from the message
  const msg = userMessage.toLowerCase();

  // Common patterns: "from X to Y", "X to Y", "go to Y", "reach Y", "get to Y", "how to go to Y"
  let from = null, to = null;

  // Pattern: "from X to Y"
  const fromToMatch = msg.match(/from\s+(.+?)\s+to\s+(.+?)(?:\?|$|\.|\!)/i);
  if (fromToMatch) {
    from = resolvePlace(fromToMatch[1]);
    to = resolvePlace(fromToMatch[2]);
  }

  // Pattern: "X to Y"
  if (!from || !to) {
    const xToYMatch = msg.match(/(.+?)\s+to\s+(.+?)(?:\?|$|\.|\!)/i);
    if (xToYMatch) {
      from = from || resolvePlace(xToYMatch[1]);
      to = to || resolvePlace(xToYMatch[2]);
    }
  }

  // Pattern: "go to Y", "reach Y", "get to Y", "want to go Y", "take me to Y", "how to reach Y"
  if (!to) {
    const goToMatch = msg.match(/(?:go\s+to|reach|get\s+to|going\s+to|want\s+to\s+go\s+to|take\s+me\s+to|how\s+to\s+reach|how\s+to\s+go\s+to|want\s+to\s+reach|want\s+to\s+visit|visit|heading\s+to)\s+(.+?)(?:\?|$|\.|\!)/i);
    if (goToMatch) {
      to = resolvePlace(goToMatch[1]);
    }
  }

  // Pattern: "near X", "nearest stop to X", "closest stop to X"
  let nearQuery = null;
  const nearMatch = msg.match(/(?:near|nearest\s+stop\s+to|closest\s+stop\s+to|stops?\s+near)\s+(.+?)(?:\?|$|\.|\!)/i);
  if (nearMatch) {
    nearQuery = resolvePlace(nearMatch[1]);
  }

  let travelInfo = '';

  // If we have at least a destination, build travel plans
  if (to) {
    travelInfo += `\n\n=== NAVIGATION QUERY DETECTED ===\n`;
    travelInfo += `Destination: ${to.name} (${to.lat}, ${to.lng})\n`;

    if (from) {
      travelInfo += `Origin: ${from.name} (${from.lat}, ${from.lng})\n`;
      const plans = findTravelPlan(from, to);
      if (plans.length > 0) {
        travelInfo += `\nBEST TRAVEL OPTIONS:\n`;
        plans.forEach((p, i) => {
          if (p.type === 'direct') {
            travelInfo += `\nOption ${i + 1} — DIRECT ROUTE:\n`;
            travelInfo += `  1. Walk ${p.walkToStop.distance}km (~${p.walkToStop.walkTime}) to "${p.walkToStop.name}" stop\n`;
            travelInfo += `  2. Board "${p.boardRoute}" shuttle (Fare: ₹${p.fare})\n`;
            travelInfo += `  3. Alight at "${p.alightAt.name}" stop\n`;
            if (parseFloat(p.alightAt.distance) > 0.15) {
              travelInfo += `  4. Walk ${p.alightAt.distance}km (~${p.alightAt.walkTime}) to destination\n`;
            }
            travelInfo += `  Total fare: ₹${p.fare} | Total walking: ${p.totalWalk}km\n`;
          } else {
            travelInfo += `\nOption ${i + 1} — WITH TRANSFER:\n`;
            travelInfo += `  1. Walk ${p.walkToStop.distance}km (~${p.walkToStop.walkTime}) to "${p.walkToStop.name}" stop\n`;
            travelInfo += `  2. Board "${p.firstRoute}" shuttle (Fare: ₹${p.firstFare})\n`;
            travelInfo += `  3. Alight at "${p.alightAt}" stop\n`;
            travelInfo += `  4. Walk ${p.transferWalk.distance}km (~${p.transferWalk.walkTime}) to "${p.boardAt}" stop\n`;
            travelInfo += `  5. Board "${p.secondRoute}" shuttle (Fare: ₹${p.secondFare})\n`;
            travelInfo += `  6. Alight at "${p.finalStop.name}" stop\n`;
            if (parseFloat(p.finalStop.distance) > 0.15) {
              travelInfo += `  7. Walk ${p.finalStop.distance}km (~${p.finalStop.walkTime}) to destination\n`;
            }
            travelInfo += `  Total fare: ₹${p.totalFare} | Total walking: ${p.totalWalk}km\n`;
          }
        });
      } else {
        travelInfo += `\nNO DIRECT OR TRANSFER ROUTES FOUND between these locations.\n`;
        travelInfo += `Suggest the user consider alternative transport or check if they are near any stops.\n`;

        // Show nearest stops to both places
        const allStops = db.prepare('SELECT s.*, r.name as route_name FROM stops s JOIN routes r ON s.route_id = r.id ORDER BY s.sort_order').all();
        const nearFromStops = findNearestStops(from.lat, from.lng, allStops, 3);
        const nearToStops = findNearestStops(to.lat, to.lng, allStops, 3);
        travelInfo += `\nNearest stops to origin "${from.name}": ${nearFromStops.map(s => `${s.name} (${s.route_name}, ${s.dist.toFixed(2)}km)`).join(', ')}\n`;
        travelInfo += `Nearest stops to destination "${to.name}": ${nearToStops.map(s => `${s.name} (${s.route_name}, ${s.dist.toFixed(2)}km)`).join(', ')}\n`;
      }
    } else {
      // No origin, just show nearest stops to destination
      const allStops = db.prepare('SELECT s.*, r.name as route_name FROM stops s JOIN routes r ON s.route_id = r.id ORDER BY s.sort_order').all();
      const nearToStops = findNearestStops(to.lat, to.lng, allStops, 3);
      travelInfo += `\nNearest stops to "${to.name}": ${nearToStops.map(s => `${s.name} (${s.route_name}, ${s.dist.toFixed(2)}km away)`).join(', ')}\n`;
      travelInfo += `\nNote: The user didn't specify where they are coming from. Ask them for their current location or suggest the nearest stops to their destination.\n`;
    }
  }

  if (nearQuery) {
    const allStops = db.prepare('SELECT s.*, r.name as route_name FROM stops s JOIN routes r ON s.route_id = r.id ORDER BY s.sort_order').all();
    const nearby = findNearestStops(nearQuery.lat, nearQuery.lng, allStops, 4);
    travelInfo += `\n\n=== NEAREST STOPS TO "${nearQuery.name}" ===\n`;
    nearby.forEach(s => {
      travelInfo += `- ${s.name} (${s.route_name}) — ${s.dist.toFixed(2)}km away (~${walkingTime(s.dist)} walk)\n`;
    });
  }

  return travelInfo;
}

// ─── System prompt ───
const SYSTEM_PROMPT = `You are Bhaya 🚐, an intelligent AI navigation assistant for the CHALO ride-hailing app in Ahmedabad, India.

YOUR PRIMARY CAPABILITY: Help users navigate from point A to point B using CHALO shuttles in Ahmedabad.

WHEN A USER ASKS HOW TO GET FROM A TO B, YOU MUST USE THIS EXACT FORMAT:

For a SINGLE route option:
1. Walk 🚶 [distance] (~[time]) to "[stop name]" stop 📍
2. Board 🚐 "[route name]" shuttle (Fare: ₹[amount]) 💰
3. Alight at "[stop name]" stop 📍
4. Walk 🚶 [distance] (~[time]) to "[destination]" 📍
Total fare: ₹[amount] | Total walking: [distance]

For MULTIPLE route options, format each like this:
Option 1:
1. Walk 🚶 [distance] (~[time]) to "[stop]" stop 📍
2. Board 🚐 "[route name]" shuttle (Fare: ₹[amount]) 💰
3. Alight at "[stop]" stop 📍
Total fare: ₹[amount] | Total walking: [distance]

Option 2:
1. Walk 🚶 [distance] (~[time]) to "[stop]" stop 📍
...

CRITICAL FORMATTING RULES:
- ALWAYS use numbered steps (1. 2. 3.)
- Walk steps MUST start with "Walk 🚶"
- Board steps MUST start with "Board 🚐"
- Alight steps MUST start with "Alight at" or "Get down at"
- ALWAYS include "Total fare:" and "Total walking:" at the end of each option
- For multiple options, ALWAYS prefix with "Option 1:", "Option 2:", etc.
- After listing options, add a brief recommendation line

WHEN A USER ASKS ABOUT NEAREST STOPS:
- Use numbered list: 1. [StopName] ([routeName]) — [X]km away (~[Y] min walk) 📍
- List the 3 closest stops

WHEN A USER ASKS GENERAL QUESTIONS:
- Answer about routes, fares, stops, drivers, timings based on the data below.
- Be concise (3-4 sentences max for simple questions).

IMPORTANT RULES:
- If the user says where they want to go but NOT where they are, ask them where they are starting from.
- Distances and times are approximate.
- Always be friendly, helpful, and use a conversational Indian English tone.
- If the question is completely unrelated to CHALO or Ahmedabad transport, politely redirect.`;

// ─── Chat endpoint ───
router.post('/', verifyToken, async (req, res) => {
  const { message, history } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'AI service not configured. Set GROQ_API_KEY.' });
  }

  try {
    const baseContext = buildContext();
    const travelContext = buildTravelContext(message);
    const fullContext = baseContext + travelContext;

    // Build message history for multi-turn conversation
    const messages = [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\nCONTEXT DATA:\n${fullContext}`
      }
    ];

    // Include conversation history (up to last 6 messages) for context
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        messages.push({
          role: h.isUser ? 'user' : 'assistant',
          content: h.text
        });
      }
    }

    messages.push({ role: 'user', content: message.trim() });

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Groq API error:', JSON.stringify(err));
      return res.status(502).json({ error: 'AI service unavailable' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Failed to process your message' });
  }
});

module.exports = router;
