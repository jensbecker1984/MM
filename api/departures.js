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

  // 1. ZUERST: Vercel-Key prüfen. 
  // Falls Vercel den Key nicht findet, nutzen wir deinen direkt als Fallback hier im Code!
  // ERSETZE 'DEIN_RMV_KEY_HIER' MIT DEINEM ECHTEN KEY, falls process.env leer bleibt!
  const apiKey = process.env.RMV_API_KEY || 'DEIN_RMV_KEY_HIER'; 
  
  if (!apiKey || apiKey === 'DEIN_RMV_KEY_HIER') {
    return res.status(500).json({ 
      error: 'Konfigurationsfehler: Der RMV-Key fehlt im Backend-Code und in den Vercel-Variablen!' 
    });
  }

  const rmvUrl = `https://rmv.de{apiKey}&id=${id}&format=json&duration=60`;

  // Zuverlässige Abfrage mit dem nativen HTTPS-Modul (läuft auf jeder Node-Version)
  https.get(rmvUrl, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        
        // Falls der RMV eine Fehlermeldung im JSON mitsendet
        if (jsonData.errorCode || jsonData.errorMsg) {
          return res.status(400).json({ 
            error: `RMV-Fehler (${jsonData.errorCode}): ${jsonData.errorMsg || 'Eventuell ist der API-Key unzulässig.'}` 
          });
        }

        return res.status(200).json(jsonData);
      } catch (e) {
        return res.status(500).json({ error: `Fehler beim Lesen der RMV-Antwort: ${e.message}. Inhalt war: ${data.substring(0, 100)}` });
      }
    });

  }).on('error', (err) => {
    return res.status(500).json({ error: `Netzwerkfehler zum RMV: ${err.message}` });
  });
}