# Mastermind README

## Introduction
Hello, welcome to my mastermind game. It's built with an Express Backend, React Frontend, and I'm using a mongoDB database.

### Table of Contents:
1. [Technologies](#technologies-used)
2. [Quick Start](#quickstart-guide)
3. [Features](#featured-code)
4. [Success and Challenges](#successes-and-challenges)

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
5. Open 2 terminal windows, one will be in the backend directory and one will be in the frontend directory. In both terminals, type in ```npm run start``` and a browser should pop up and you should be able to start playing the game.
6. In order to play the game, you need to create an account, so just enter a dummy username, and a dummy password and click create-user. You'll have an account immediately and be able to start playing the game.

## Featured Code

For this project, I used Express for the backend. I used the Model view controller deisgn pattern to create a RESTful API. For this project, I created the Model, then the Controllers, and then created the Routes right after. Within each route, there were also middleware that I had to create in order to use certain features of the code. I will go ahead and explain all of those shortly.

## Express Backend

In order to build the Express backend, I had configure the server, set up any middleware, create Routes, Controllers, and models.

### Express Configuration

The reason I really like using Express is because of how customizeable it is. A developer can set it up in anyway that is beneficial for the application. Here is my express configuration. 

```js
const app = Express();
const port = 5000;

app.use(passport.initialize());
app.use(Express.static(publicDirectoryPath));  

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

app.use('/api/users', userRouter);
app.use('/api/games', gameRouter);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});
```

as you can see I am able to select the port I want, any sort of JavaScript library that I need to use, in this case ```cors, cookieParser, bodyParser```. 

After setting up my configuration, I would create a Model / Schema for anything that I will use. Since I was using MongoDB, I used Mongoose, another JavaScript Library, that also acts as an ORM (Object Relational Mapping). It helps me interact with the database to receive any information that I need. It also helps me organize the Model to my exact liking for the needs of my application.  

```js
import { model, Schema } from 'mongoose';

const gameSchema = new Schema({
    completedGame: {
        type: Boolean,
        required: true,
    },
    attemptsLeft: {
        type: Number,
        max: 10,
        required: true
    },
    masterCode: {
        type: String,
        maxLength: 10,
        minLength: 2,
        required: true
    },
    previousGuesses: {
        type: Array,
        of: String
    },
    players: {
        type: Array,
        of: Schema.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true,
});
```

In this example, I'm showing you my Game Schema / Model. Within this Model, I defined what properties the object would have, what each property would be, as well as any validators that need to be done on this. 

In the backend, I am also using jsonwebtoken or JWT for short. This internet standard helps me with authentication / authorization, as well as for security purposes. It ensures that it is only the using their account and not someone else logging onto it. JWT helped me a lot adding the user into the state and making verifying the usage of the account.

```js
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret,
    ignoreExpiration: !isProduction
}, async (jwtPayload, done) => {
    try {
        console.log('success')
        const user = await User.findOne({userName: jwtPayload.userName})
        if (user) return done(null, user);
        return done(null, false);
    }
    catch(err) {
        console.log('failure')
        done(err);
    }
}));
```

This is how I used jwt library for logging in. I destructured many of the built in methods as well as providing any necessary arguments so JWt would work flawlessly with my application. The JWT would return a token that I would use to compare during log in / registration and if it matched, the user was able to complete the log in function and use the application freely.

I used controllers to handle any requests / responses sent in from my client. Most of the functions that I created deal with game creation and the game logic. 

```js
export const createNewGame = async (req, res, next) => {
    const user = req.user;
    const {mastercodeLength, masterCode} = req.body;

    if (user && !masterCode) {
        try {
            const newGame = new Game({
                completedGame: false,
                masterCode: await createMasterCode(mastercodeLength.length > 0 ? parseInt(masterCode) : 4) ,
                players: [user.id],
                previousGuesses: [],
                attemptsLeft: 10,
            });

            if (newGame) {
                user.gameHistory.push(newGame);
                await newGame.save();
                await user.save();
                res.status(200).json({
                    success:true,
                    data: newGame.id
                })
            };
        } 
        catch (error) {
            console.log(error.message);
        }
    } 
};
```
In this code, I am utilizing my createNewGame controller. It takes in a request, a response, and a next(any callback functions I can call on the response). Using JWT, i was able to create a req.user within my client so any time a request was made, I had a user readily available. Witin the request object, I would add anything I need into the body of the request, whether it's the ```masterCodeLength``` or ```masterCode```. After creating the new game, I'd have to save it so it persisted in my database. I also saved the user since within the user model, I included a gamesHistory property to see all of the games that a player played in the past. I have very basic error handling where it would log the error to the console.

The controller housed all of the necessary functions to ensure this app worked all the time.

### Websocket Backend

Websockets were definitely a challenge for me. Because of the instantenousness of the websockets, I needed to think outside of the box as well as ensuring the communication happened flawlessly.

To use Websockets, I had to first install it using ```npm install websockets```. Afterwards I had to upgrade regular HTTP requests into WebSocket requests using protocol upgrading mechanisms. 

This is how I used WebSockets in my Express server (specifically line ```const wss = new WebSocketServer({server}))```:
```js
const server = app.listen(port, () => console.log(`Now listening on port ${port}`));
const wss = new WebSocketServer({server});

wss.on('connection', async function connection(ws, req) {
    console.log('A new client Connected!');
    const token = cookie.parse(req.headers.cookie).jwt;

    const {userName} = jwt.verify(token, secret);
    const user = await User.findOne({userName});

    assignRole(ws, user.userName);

    ws.on('message', incomingMessage.bind(null, ws, userName));
    
    ws.on('close', () => {
    });
});
```

Here, I am upgrading the protocols as needed, connecting to the WebSocket Server, and then handling any incoming message or functions that I need to run once the WebSockets turn on for the first time. As you can see, I am also using my JWT verifier.

Within my WebSocket configuration, when the WebSockets are turned on, I am binding any WebSocket message to my incomingMessage function. That function acts as the controller for websocket messages. I structured websocket messages to always have a ```type``` and a ```payload``` so I can handle the message depending on the ```type``` and send any necessary information through the ```paylaod```.

The WebSocket handler consists of a ```swtich``` function that tells the server what to do depending on the type of message I receive.

```js
    switch (parsedMessage.type) {
        case 'echo':
            echo(ws, message);
            break;
        case 'sendMasterCode':
            createNewMultiplayerGame(ws, userName, parsedMessage.payload.masterCode);
            break;
        case 'sendUserName':
            joinMultiplayerGame(ws, userName, parsedMessage.payload.userName);
        case 'sendGuess':
            receiveGuess(ws, parsedMessage.payload.guess, parsedMessage.payload.gameId);
            break;
        case 'sendAnalyzation':
            multiPlayerAnalyzeGuess(ws, parsedMessage.payload.humanNearMatch, parsedMessage.payload.humanExactMatch, parsedMessage.payload.gameId, parsedMessage.payload.guess, parsedMessage.payload.userName);
            break;
    };
```

## Successes and Challenges
There were a lot of challenges and successes this time around. I wanted to change things up in comparison to the last time I created this. Last time I created, I didn't have a real authentication set up that was genuinely secure. I also didn't use React. One of the things I wish I could've done was style this a lot better. However, I just simply didn't have time to make it look nice. One of the things I really wanted to use for this project was WebSockets. I have only used WebSockets once before but I felt like I wanted to use it again. I enjoy learning and working with new technologies all the time.