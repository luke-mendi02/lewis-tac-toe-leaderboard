const express = require('express')
app = express()

const cors = require("cors")

const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000',
  clientID: 'CD0sXFYpCtwkOvGOunA7XgAfW1ETSnKR',
  issuerBaseURL: 'https://dev-dbofanjigstk56gw.us.auth0.com'
};


// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in, go to /index.html to view leaderboard' : 'Logged out, go to /login to login.');
});

const { requiresAuth } = require('express-openid-connect');

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
  console.log(req.user);
});

const port = process.env.PORT || 3000

app.use(express.static('static'))
app.use(cors({ origin: 'http://localhost:3001' }))

let leaderboard = [];

app.get('/GetLewisTacToeLeaders', (req, res) => {
  // Sort leaderboard data by TotalWins (descending)
  leaderboard.sort((a, b) => b.TotalWins - a.TotalWins);

  // Return only top 3 players
  const topPlayers = leaderboard.slice(0, 3);
  res.json(topPlayers);
});

// POST endpoint to add win or tie for authenticated user
app.post('/AddWinOrTie', (req, res) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  const { name } = req.oidc.user;

  const index = leaderboard.findIndex(player => player.UserName === name);
  if (index !== -1) {
    // Increment the wins or ties for the user
    leaderboard[index].TotalWins += 1;
  } else {
    // If the user is not in the leaderboard, add them with 1 win
    leaderboard.push({ UserName: name, TotalWins: 1 });
  }

  res.status(200).send('Win or tie added successfully.');
});


app.options('/AddWinOrTie', cors());



// Custom 404 page.
app.use((request, response) => {
  response.type('text/plain')
  response.status(404)
  response.send('404 - Not Found')
})

// Custom 500 page.
app.use((err, request, response, next) => {
  console.error(err.message)
  response.type('text/plain')
  response.status(500)
  response.send('500 - Server Error')
})

app.listen(port, () => console.log(
  `Express started at \"http://localhost:${port}\"\n` +
  `press Ctrl-C to terminate.`)
)
