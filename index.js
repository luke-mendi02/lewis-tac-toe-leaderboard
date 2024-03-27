const express = require('express');
app = express();
const dotenv = require("dotenv")
dotenv.config()
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { auth } = require('express-openid-connect');


// Replace the uri string with your connection string.
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@lewis-tac-toe-leaderboa.zzh6c3q.mongodb.net/?retryWrites=true&w=majority&appName=lewis-tac-toe-leaderboard`;
const client = new MongoClient(uri);
// MongoDB setup
async function setupMongoDB() {
  try {
    const database = client.db('leaderboard');
    playerWinsCollection = database.collection('playerWins');
    const query = { wins: 1 };
    const wins = await playerWinsCollection.findOne(query);
    console.log("MongoDB setup complete");
    console.log(wins)
  } catch (err) {
    console.error("Error setting up MongoDB:", err);
  }
}

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'https://lewis-tac-toe-leaderboard.azurewebsites.net/',
  clientID: 'CD0sXFYpCtwkOvGOunA7XgAfW1ETSnKR',
  issuerBaseURL: 'https://dev-dbofanjigstk56gw.us.auth0.com'
};


// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in, go to /index.html to view leaderboard' : 'Logged out, go to /login to login, or /index.html to view leaderboard.');
});

const { requiresAuth } = require('express-openid-connect');

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
  console.log(req.user);
});

const port = process.env.PORT || 3000
app.use(express.static('static'))
app.use(cors({ origin: 'https://ambitious-sky-0c3e83e10.4.azurestaticapps.net/' }))

let leaderboard = [];
// MongoDB collection reference
let playerWinsCollection;

// Function to get the player's profile and wins from MongoDB
async function getPlayerWins(name) {
  try {
    const result = await playerWinsCollection.findOne({ UserName: name });
    return result;
  } catch (err) {
    console.error("Error fetching player's wins:", err);
    return null;
  }
}


app.get('/GetLewisTacToeLeaders', async (req, res) => {
  try {
    // Fetch the top 3 players based on TotalWins from MongoDB
    const topPlayers = await playerWinsCollection.find().sort({ TotalWins: -1 }).limit(3).toArray();
    res.json(topPlayers);
  } catch (err) {
    console.error("Error fetching top players:", err);
    res.status(500).send('Internal Server Error');
  }
});

// POST endpoint to add win or tie for authenticated user
app.post('/AddWinOrTie', async (req, res) => {
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

  try {
    // Ensure playerWinsCollection is initialized before accessing it
    if (!playerWinsCollection) {
      return res.status(500).send('Internal Server Error');
    }
    // Get player's profile and wins from MongoDB
    const player = await getPlayerWins(name);

    if (player) {
      // If player exists, update the wins count
      await playerWinsCollection.updateOne({ UserName: name }, { $inc: { TotalWins: 1 } });
    } else {
      // If player doesn't exist, insert a new document
      await playerWinsCollection.insertOne({ UserName: name, TotalWins: 1 });
    }

  } catch (err) {
    console.error("Error adding win or tie:", err);
  }

});

setupMongoDB();

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
