function fetchLeaderboard() {
  fetch('https://lewis-tac-toe-leaderboard.azurewebsites.net/GetLewisTacToeLeaders')
    .then(response => response.json())
    .then(data => {
      // Clear existing leaderboard
      document.getElementById('leaderboard').innerHTML = '';

      // Update leaderboard with fetched data
      data.forEach((player, index) => {
        const playerRank = index + 1;
        const playerName = player.UserName;
        const playerWins = player.TotalWins;
        
        const playerElement = document.createElement('div');
        playerElement.textContent = `#${playerRank}: ${playerName} - Wins: ${playerWins}`;
        document.getElementById('leaderboard').appendChild(playerElement);
      });
    })
    .catch(error => console.error('Error fetching leaderboard:', error));
}

function addWinOrTie() {
  fetch('https://lewis-tac-toe-leaderboard.azurewebsites.net/AddWinOrTie', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    // Include credentials to send the Auth0 JWT token
    credentials: 'include'
  })
  .then(() => {
    // Refresh leaderboard after adding win or tie
    fetchLeaderboard();
  })
  .catch(error => console.error('Error adding win or tie:', error));
}

document.getElementById('winOrTieButton').addEventListener('click', addWinOrTie);

fetchLeaderboard();

