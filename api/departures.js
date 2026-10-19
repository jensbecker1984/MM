// api/departures.js (Für Vercel ausgelegt)
export default async function handler(req, res) {
  // CORS-Header erlauben, damit dein Frontend darauf zugreifen darf
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Keine Haltestellen-ID (id) übergeben.' });
  }

  // Dein Key wird später sicher in Vercel als Umgebungsvariable "RMV_API_KEY" hinterlegt
  const apiKey = process.env.RMV_API_KEY; 
  
  // Die offizielle RMV HAFAS Abfahrtstafel-URL (JSON-Format)
  const rmvUrl = `https://rmv.de{apiKey}&extId=${id}&format=json`;

  try {
    const response = await fetch(rmvUrl);
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der RMV-Daten');
    }
    const data = await response.json();
    
    // Wir senden die rohen RMV-Daten an dein Frontend zurück
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
