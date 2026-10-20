// api/departures.js
export const config = {
  runtime: 'edge', // Zwingt Vercel, das globale Edge-Netzwerk zu nutzen
};

export default async function handler(req) {
  // CORS-Header für den Browser setzen
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
  };

  // ID aus der URL auslesen
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Keine Haltestellen-ID übergeben.' }), { status: 400, headers });
  }

  // Dein RMV-Key direkt im Code hinterlegt
  const apiKey = '722c6d52-050f-4238-9542-adecb75193a4'; 
  const rmvUrl = `https://rmv.de{apiKey}&id=${id}&format=json&duration=60`;

  try {
    // Die Anfrage an den RMV senden – getarnt als normaler Browser
    const response = await fetch(rmvUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `RMV meldet Status-Fehler ${response.status}` }), { status: response.status, headers });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200, headers });

  } catch (error) {
    return new Response(JSON.stringify({ error: `Edge-Verbindungsfehler: ${error.message}` }), { status: 500, headers });
  }
}