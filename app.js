const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 443;

const privateKey = fs.readFileSync('/etc/letsencrypt/live/kamarova.online/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/kamarova.online/fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

app.use(bodyParser.json());
app.use(cors());

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

let players = require('./public/data.json');

app.post('/update-elo', (req, res) => {
  const { playerName, newElo } = req.body;

  const playerIndex = players.people.findIndex(p => p.name === playerName);

  if (playerIndex !== -1) {
    players.people[playerIndex].elo = newElo;

    fs.writeFileSync('./public/data.json', JSON.stringify(players, null, 2));

    res.status(200).json({ success: true, message: 'ELO updated successfully' });
  } else {
    res.status(404).json({ success: false, message: 'Player not found' });
  }
});

// Create an HTTPS server using the credentials and your Express app
const httpsServer = require('https').createServer(credentials, app);

// Listen on port 443 for HTTPS traffic
httpsServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
