# Lewis Tac-Toe Leaderboard
This application functions as a leaderboard for players of my Lewis-Tac-Toe website. 
The leaderboard currently works as a standalone, but at the moment does not add wins when playing the tic-tac-toe game. 

Link: https://lewis-tac-toe-leaderboard.azurewebsites.net/

I was able to test my APIs by testing the "I Just Won" button without logging in, and testing it after logging in. I also tried to call the API from another website, without having the website listed in my approved origins list, and the website was blocked from calling the API. 

You can locally test this website by cloning this repository, and changing line 31 in index.js to "http://localhost:3000/", line 2 in script.js to "http://localhost:3000/GetLewisTacToeLeaders" and line 29 in script.js to "http://localhost:3000/AddWinOrTie". But, since you do not have the needed credentials to access the database, you will have to ask me to create a filler username/password for you on MongoDB Atlas. You will first need to login through Auth0 if not already logged in by going to "http://localhost:3000/login", then go to ".../index.html". Here, you can click the "I Just Won (Or Tied)" button and your name profile username and win will be added to the database. If it is already in the database, your wins will increment by 1 each time you press it. 
