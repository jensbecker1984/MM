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

  // Setze hier als absolute Absicherung deinen echten Key ein
  const apiKey = process.env.RMV_API_KEY || '722c6d52-050f-4238-9542-adecb75193a4'; 
  
  if (!apiKey || apiKey === 'DEIN_RMV_KEY_HIER') {
    return res.status(500).json({ 
      error: 'Konfigurationsfehler: Der RMV_API_KEY fehlt im Code oder in den Vercel-Variablen!' 
    });
  }

  const rmvUrl = `https://rmv.de{apiKey}&id=${id}&format=json&duration=60`;

  // Optionen für die RMV-API: Wichtig ist der User-Agent!
  const options = {
    headers: {
      'User-Agent': 'MaintalMobilAbfahrtstafel/1.0 (Kontakt via Vercel)'
    }
  };

  https.get(rmvUrl, options, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        // Falls der RMV kein JSON schickt, fängt das der catch-Block ab
        const jsonData = JSON.parse(data);
        
        // Falls die RMV-API intern einen Fehler meldet (z.B. falscher Key)
        if (jsonData.errorCode || jsonData.errorMsg) {
          return res.status(400).json({ 
            error: `RMV-Systemmeldung (${jsonData.errorCode}): ${jsonData.errorMsg || 'Key ungültig.'}` 
          });
        }

        return res.status(200).json(jsonData);
      } catch (e) {
        // Zeigt uns den rohen Text, falls der RMV eine Fehler-Webseite schickt
        return res.status(500).json({ 
          error: `Der RMV hat kein sauberes JSON geliefert. Inhalt: ${data.substring(0, 120)}` 
        });
      }
    });

  }).on('error', (err) => {
    return res.status(500).json({ error: `Netzwerkfehler zum RMV: ${err.message}` });
  });
}
