# Mastermind README

## Introduction
Hello, welcome to my mastermind game. It's built with an Express Backend, React Frontend, and I'm using a mongoDB database.

### Table of Contents:
1. [Technologies](#technologies-used)
2. [Quick Start](#quickstart-guide)
3. [Features](#features)
4. [Featured Code](#featured-code)

## Technologies Used

### Backend:
1. Express
2. Node.js

### Frontend:
1. React
2. Redux

### APIs
1. Random.org generator
2. WebSocket API
3. Cookie-Parser / js-cookie
4. Mongoose
5. jsonwebtoken

### Database
1. MongoDB

## QuickStart Guide
Here's how to get started on testing out this project:
1. Clone the repository from your terminal using command ```git clone https://github.com/joshua-lee-sf/LIMastermindv2.git```
2. Type the command ```cd backend``` and when youre in the backend directory type ```npm install``` to install all dependencies for the backend.
3. Once that's done, from the same terminal type ```cd frontend``` to head to the frontend directory and type ```npm install``` to install all frontend dependencies.
4. You will have to set up a ```.env``` file in your backend to connect a MongoDB and to create a Secret Key for the Authorization of the JWT.
5. Open 2 terminal windows, one will be in the backend directory and one will be in the frontend directory. In both windows, type in ```npm run start``` and a browser should pop up and you should be able to start playing the game.

## Featured Code