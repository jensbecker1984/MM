// api/departures.js
export default async function handler(req, res) {
  // CORS-Header setzen, damit das Frontend zugreifen darf
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Keine Haltestellen-ID (id) übergeben.' });
  }

  const apiKey = process.env.RMV_API_KEY; 
  
  // Zusammenbau laut RMV-Dokumentation:
  // format=json erzwingt die JSON-Rückgabe (wichtig!)
  // duration=60 sucht Verbindungen für die nächste Stunde
  const rmvUrl = `https://rmv.de{apiKey}&id=${id}&format=json&duration=60`;

  try {
    const response = await fetch(rmvUrl);
    if (!response.ok) {
      throw new Error(`RMV API antwortet mit Status ${response.status}`);
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}