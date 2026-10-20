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

  // Hier bleibt dein Key stehen
  const apiKey = '722c6d52-050f-4238-9542-adecb75193a4'; 

  // HIER IST DIE KORREKTUR: Der vollständige und exakte Pfad zur RMV-Schnittstelle!
  const rmvUrl = "https://rmv.de" + apiKey + "&id=" + id + "&format=json&duration=60";

  const options = {
    headers: {
      'User-Agent': 'MaintalMobilAbfahrtstafel/1.0'
    }
  };

  https.get(rmvUrl, options, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        
        if (jsonData.errorCode || jsonData.errorMsg) {
          return res.status(400).json({ 
            error: "RMV-Systemmeldung (" + jsonData.errorCode + "): " + (jsonData.errorMsg || "Key oder ID ungültig.")
          });
        }

        return res.status(200).json(jsonData);
      } catch (e) {
        return res.status(500).json({ 
          error: "Der RMV hat kein sauberes JSON geliefert. Inhalt: " + data.substring(0, 120) 
        });
      }
    });

  }).on('error', (err) => {
    return res.status(500).json({ error: "Netzwerkfehler zum RMV: " + err.message });
  });
}