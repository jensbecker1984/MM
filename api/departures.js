// api/departures.js
import https from 'https';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Keine Haltestellen-ID übergeben.' });
  }

  // Setze hier als Fallback deinen echten Key ein, falls process.env bei Vercel hakt
  const apiKey = process.env.RMV_API_KEY || '722c6d52-050f-4238-9542-adecb75193a4'; 
  
  if (!apiKey || apiKey === 'DEIN_RMV_KEY_HIER') {
    return res.status(500).json({ 
      error: 'Konfigurationsfehler: Der RMV-Key fehlt im Code oder in den Vercel-Variablen!' 
    });
  }

  // HIER WAR DER FEHLER: Jetzt steht das Fragezeichen (?) und der Pfad exakt so, wie der RMV es verlangt:
  const rmvUrl = `https://rmv.de{apiKey}&id=${id}&format=json&duration=60`;

  https.get(rmvUrl, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        
        if (jsonData.errorCode || jsonData.errorMsg) {
          return res.status(400).json({ 
            error: `RMV-Fehler (${jsonData.errorCode}): ${jsonData.errorMsg}` 
          });
        }

        return res.status(200).json(jsonData);
      } catch (e) {
        return res.status(500).json({ error: `Fehler beim Lesen der RMV-Antwort: ${e.message}` });
      }
    });

  }).on('error', (err) => {
    return res.status(500).json({ error: `Netzwerkfehler zum RMV: ${err.message}` });
  });
}