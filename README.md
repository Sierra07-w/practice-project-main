# FitTrack – Workout Tracker

FitTrack is a web application to track workouts. Users can create, view, update, and delete exercises. Built with Node.js, Express, MongoDB, and a simple HTML/CSS/JS frontend. The frontend communicates with the backend using `fetch()` to provide a dynamic table of exercises.

## Features
- Full CRUD functionality through the web interface
- Data stored in MongoDB
- Add new exercises via a form
- Edit and delete existing exercises directly in the table

## Project Structure
app.js # Main server
database/mongo.js # MongoDB connection
routes/workouts.js # CRUD API routes
frontend/ # HTML, CSS, JS files
package.json # Dependencies and scripts
.env # Environment variables (not pushed to GitHub)


## Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/Sierra07-w/practice-project.git
cd practice-project
Install dependencies:

npm install
Create a .env file in the root folder with your configuration:

PORT=3000
MONGO_URI=mongodb+srv://Sara:1S2A3R4A@cluster0.txqxytk.mongodb.net/workouts?retryWrites=true&w=majority
Start the server locally:

npm start
Open the app in your browser:

http://localhost:3000

Deployed Application
You can access the live web application here: https://practice-project-3ysd.onrender.com
