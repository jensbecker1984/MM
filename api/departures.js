// api/departures.js
export const config = {
  runtime: 'edge', 
};

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
  };

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Keine Haltestellen-ID übergeben.' }), { status: 400, headers });
  }

  // Dein echter, verifizierter RMV-Schlüssel
  const apiKey = '722c6d52-050f-4238-9542-adecb75193a4'; 
  
  // Die offizielle, korrekte RMV-URL mit allen Schrägstrichen und Parametern
    const rmvUrl = "https://rmv.de/hapi/departureBoard?accessId=" + apiKey + "&extid=" + id + "&format=json&duration=60";

  try {
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
