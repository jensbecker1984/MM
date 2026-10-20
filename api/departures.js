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

  const apiKey = '722c6d52-050f-4238-9542-adecb75193a4'; 

  // URL absolut sauber aufbauen
  const urlObj = new URL('https://rmv.de');
  urlObj.searchParams.append('accessId', apiKey);
  urlObj.searchParams.append('id', id);
  urlObj.searchParams.append('format', 'json');
  urlObj.searchParams.append('duration', '60');

  // Wir fügen zusätzliche Header hinzu, damit die Anfrage wie ein echter Browser aussieht
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/html'
    }
  };

  https.get(urlObj.toString(), options, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        // Testen, ob es JSON ist
        const jsonData = JSON.parse(data);
        
        if (jsonData.errorCode || jsonData.errorMsg) {
          return res.status(400).json({ 
            error: "RMV-Systemmeldung (" + jsonData.errorCode + "): " + (jsonData.errorMsg || "Key oder ID fehlerhaft.")
          });
        }

        return res.status(200).json(jsonData);
      } catch (e) {
        // HIER DIE ÄNDERUNG: Wir senden den ROHE TEXT-INHALT der RMV-Antwort zurück!
        // So sehen wir im roten Kasten genau, ob dort "Access Denied", "Invalid Key" oder ein HTML-Fehler steht.
        return res.status(500).json({ 
          error: "RMV lieferte kein JSON. Roher Server-Antworttext: " + data.replace(/<[^>]*>/g, ' ').substring(0, 150)
        });
      }
    });

  }).on('error', (err) => {
    return res.status(500).json({ error: "Netzwerkfehler zum RMV: " + err.message });
  });
}