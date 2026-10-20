// api/departures.js
export default async function handler(req, res) {
  // CORS aktivieren
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Keine Haltestellen-ID (id) übergeben.' });
  }

  const apiKey = process.env.RMV_API_KEY; 
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Konfigurationsfehler: Der RMV_API_KEY wurde in den Vercel-Environment-Variables nicht gefunden!' 
    });
  }

  const rmvUrl = `https://rmv.de{apiKey}&id=${id}&format=json&duration=60`;

  try {
    const response = await fetch(rmvUrl);
    
    // Falls der RMV mit einem Fehler (z.B. 401 unbefugt) antwortet
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Der RMV-Server hat mit Status ${response.status} geantwortet. Eventuell ist der API-Key ungültig.` 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    // Fängt Netzwerkfehler oder Node-Abstürze ab
    return res.status(500).json({ error: `Interner Serverfehler im Backend: ${error.message}` });
  }
}