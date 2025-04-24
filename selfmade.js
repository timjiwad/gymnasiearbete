const express = require("express");
const app = express();
const { createServer } = require("http");
const server = createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const bcrypt = require("bcryptjs");
const session = require("express-session");
const escape = require("escape-html");
const validator = require("validator");
const fs = require("fs");
const { v7: uuidv7 } = require('uuid');
const path = require("path");
const { cwd, exit } = require("process");
const { createlogin, createpost } = require("./func");
const { password } = require("./DoNotOpen");
const { Console, count } = require("console");
const rateLimit = require('express-rate-limit');


server.listen(7777, () => {


    console.log("http://localhost:7777")
});
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
secret = password()
const sessionMiddleware = session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false, 
        sameSite: 'strict'
    }
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10,
    message: "Too many attempts, please try again later. (max 15 min)"
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);







function uwu(req, res) {

    res.send(render("uwu")); //aron
}
app.get("/login", showlogin)
app.post("/login", authLimiter, login)

app.get("/register", reg);
app.post("/register", authLimiter, register);

app.get("/uwu", uwu)

app.get("/deleteaccount", deleteaccount)
function render(content) {

    let html = fs.readFileSync("template.html").toString();

    return html.replace("{content}", content);

}
app.get("/", index)
function index(req, res) {
    if (req.session.username) return res.redirect("/actualwebsite");
    res.send(render("home page"))
}


let form = `<form action="/register" method="post">
    <input type="email" name="quote" placeholder="email" required>
    <input type="password" name="quote" placeholder="password" required>
    <input type="submit" value="submit">
    
</form>
`;

function reg(req, res) {

    res.send(render(form));
}

async function register(req, res) {
    if (validator.isEmail(req.body.quote[0])) {
    let username = req.body.quote[0];
    let passwordRaw = req.body.quote[1];

        
        let users = JSON.parse(fs.readFileSync("users.json").toString());
        if (users.some(u => u.username === username)) {
            return res.send(render("User already exists"));
        }

        let password = await bcrypt.hash(passwordRaw, 12);
        let id = "id_" + Date.now();
        let uuid = uuidv7();
        let login = { username, password, id, uuid, balance: 1000 };
        createlogin(login);

        res.redirect("/login");
    } else {
        res.send(render("input a valid email"));
    }
}


async function login(req, res) {
    let data = req.body;
    let password = req.body.password;

    let jsonfile = fs.readFileSync("users.json").toString();
        let usersparse = JSON.parse(jsonfile);
        let currentuser = usersparse.find(u => u.username == data.email);

        if (!currentuser) {
            return res.send(render("User not found"));
        }
        let check = await bcrypt.compare(password, currentuser.password);

        if (!check) { return res.send(render("wrong credentials")) }

        req.session.username = currentuser.username;

        req.session.checkpass = true;

        req.session.id = currentuser.id;

    req.session.uuid = currentuser.uuid


        res.redirect("/actualwebsite");

}

function showlogin(req, res) {

    let lol = `<form action="/login" method="post">
    <input type="email" name="email" placeholder="email" required>
    <input type="password" name="password" placeholder="password" required>
    <input type="submit" value="submit">
    
</form>
`;
    res.send(render(lol));
}

app.get("/actualwebsite", (req, res) => {

    if (req.session.checkpass) return res.send(render2("Välkommen " + escape(req.session.username.split("@")[0]) + "!"));

    res.redirect("/login");
});
function render2(content) {
    let html = fs.readFileSync("template2.html").toString();

    return html.replace("{content}", content);
}

app.get("/logout", (req, res) => {

    req.session.destroy();

    res.redirect("/");
});



function makehistory(history) {
    let history1 = JSON.parse(require("fs").readFileSync("history.json").toString())
    history1.push(history)
    require("fs").writeFileSync("history.json", JSON.stringify(history1, null, 2))

}
function part1_dealerhand() {
    if (deck4x.length <= 20) {
        
        intitiate_deck()
        multiply_deck()
        deckshuffle()
    }
    if (dealerhand.length <= 0) {
        dealerhand.push(takecard())
        dealerhand_hidden.push(takecard())
        

    }
    else {
        return
    }
}
function deleteaccount(req, res) {


    if (req.session.checkpass && req.session.uuid) {

        let deleteuuid = req.session.uuid

        let deleteuserjson = JSON.parse(fs.readFileSync("users.json").toString());
        let deleteuserjson2 = deleteuserjson.filter((deleteuserjson) => deleteuserjson.uuid != deleteuuid);
        fs.writeFileSync('users.json', JSON.stringify(deleteuserjson2, null, 3));

        res.redirect("/logout")
    }
    res.redirect("/")
}


function intitiate_deck() {

    deck = [];
    deck4x = []
    let suits = ["spades", "diamonds", "clubs", "hearts"];
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    for (let i = 0; i < suits.length; i++) {
        for (let x = 0; x < values.length; x++) {
            let card = { Value: values[x], Suit: suits[i] };
            deck.push(card);
        }
    }

    return deck4x;

}

function multiply_deck() {

    deck4x = deck4x.concat(deck);
    deck4x = deck4x.concat(deck);
    deck4x = deck4x.concat(deck);
    deck4x = deck4x.concat(deck);

};

function deckshuffle() {

    var m = deck4x.length, t, i;

    while (m) {

        i = Math.floor(Math.random() * m--);

        
        t = deck4x[m];
        deck4x[m] = deck4x[i];
        deck4x[i] = t;
    }

    return deck4x;

}




function takecard() {


    let taken_card = deck4x.pop()


    return taken_card

}
function execute(req, res) {

    if (req.session.checkpass && req.session.uuid) {


        res.render("blackjack2")

    }
    else { res.redirect("/") }
}
app.get("/blackjack", execute);


function handtotal(hand) {

    let total = 0;
    let aceCount = 0;

    for (let card of hand) {
        if (!card || !card.Value) continue; 
        if (card.Value === "A") {
            aceCount++;
            total += 11;
        } else if (["K", "Q", "J"].includes(card.Value)) {
            total += 10;
        } else if (!isNaN(parseInt(card.Value))) {
            total += parseInt(card.Value);
        }
    }

    
    while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount--;
    }

    return total;
}



let deck = [];
let deck4x = []
let dealerhand = []
let dealerhand_hidden = []
const users = new Map()
let allReady;
let status;

let static_timer = 30
let intervall = static_timer
let toggletimer;
let buster;


function resetGame() {
    deck = [];
    deck4x = [];
    dealerhand = [];
    dealerhand_hidden = [];
    allReady = undefined;
    status = undefined;
    intervall = static_timer;
    toggletimer = undefined;
    buster = undefined;
    
    console.log('Game state has been reset.');
}

function startNewRound() {
    dealerhand = [];
    dealerhand_hidden = [];
    part1_dealerhand();
    

}

io.on("connection", (socket) => {


    io.emit("disable_hit")
    io.emit("disable_stay")
    io.emit("disable_start")
    io.emit("disable_savegame")
    io.emit("no_incurance")
    io.emit("disable_double")
    if (socket.request.session.checkpass && socket.request.session.uuid) {

        let user_data = JSON.parse(fs.readFileSync("users.json"));
        let user = user_data.find(data => data.uuid === socket.request.session.uuid);
        if (user) {

            //playerhand,balance,stay,??,insurance, games_played,dublecheck
            users.set(socket.id, [[], [user.balance], [], [], [], [user.games_played], [false]]);

            io.to(socket.id).emit("render_balance", users.get(socket.id)[1])
            

        } else {
            users.set(socket.id, [[], [1000], [], [], [], [0], [false]]);

        }
    }





    socket.on("betreturn", (bet) => {
        
        io.to(socket.id).emit("render_balance", users.get(socket.id)[1])

        if (bet > 0) {

            socket.emit("test_start")
            
            socket.on("start_hand", () => {
                if (dealerhand.length === 0) {
                    
                    startNewRound();
                    users.get(socket.id)[0] = [];
                    users.get(socket.id)[2] = [];
                } 
            
                intervall = static_timer
                
                if (users.get(socket.id)[0].length >= 0) {
                    users.get(socket.id)[0] = []
                    users.get(socket.id)[2] = []
                }

                if (deck4x.length <= 60) {

                    intitiate_deck()
                    multiply_deck()
                    deckshuffle()

                }
                
                if (users.get(socket.id)[0].length === 0) {
                    users.get(socket.id)[0].push(takecard());
                    users.get(socket.id)[0].push(takecard());
                }
                
                pugrender(users.get(socket.id), socket.id)

            })
        }
        else {
            socket.emit("enable_bet_input")
            
            socket.emit("error message")
        }
    })

    socket.on("disconnect", () => {
        
        console.log("this is 1")
        allReady = true
        
        stayfunction(socket.id); 

        
        users.delete(socket.id);

        io.to(socket.id).emit("manual_stay");

       
        if (users.size === 1) {
            let remainingSocketId = Array.from(users.keys())[0];
            stayfunction(remainingSocketId);
        }

       
        if (users.size === 0) {
            resetGame();
        }
    });

  
   

   

    function pugrender(users, socketid) {

        
        let count = cardCounter(users[0])

        let status = instantbust(count)
        if (status) {
            buster = "player bust"
            io.to(socketid).emit("disable_hit")
        }
        let cardcountplayer = cardCounter(users[0])

        let cardcountdealer = cardcountdealerfunction(dealerhand)


        let history = { users, dealerhand, status, cardcountplayer, cardcountdealer }
        
        makehistory(history);
        
        io.to(socket.id).emit("starthand_return", JSON.stringify((users[0])), dealerhand, status, cardcountplayer, cardcountdealer);

        socket.on("returninsurance", (value) => {
            
            if (value) {
                users[4] = true
            }
            else {
                users[4] = false
            }

        })

        io.to(socket.id).emit("render_balance", (users[1]))

    }






    function cardCounter(cardMap) {
        let total = 0;
        let aceCount = 0;

        for (let card of cardMap) {
            let value = card.Value; 

            if (value === "J" || value === "Q" || value === "K") {
                total += 10; 
            } else if (value === "A") {
                aceCount += 1;
                total += 11; 
            } else {
                total += parseInt(value, 10); 
            }
        }

        
        while (total > 21 && aceCount > 0) {
            total -= 10;
            aceCount -= 1;
        }

        return total;
    }
    function determineBlackjackWinner(dealerScore, playerScore, playerCardCount, dealerCardCount) {
       

        if (playerCardCount == 2 && playerScore == 21 && dealerScore < 21) {
            return "instantbackjack";
        }
        if (playerCardCount === 5 && playerScore <= 21) {
            return "Player wins with 5-card rule!";
        }

        
        if (dealerScore === playerScore && [17, 18, 19].includes(dealerScore)) {
            return "Tie!";
        }

       
        if ([20, 21].includes(dealerScore)) {
            return "Dealer wins at 20 or 21!";
        }

       
        if (playerScore > 21) {
            return "Dealer wins! Player busted.";
        } else if (dealerScore > 21) {
            return "Player wins! Dealer busted.";
        } else if (playerScore > dealerScore) {
            return "Player wins!";
        } else if (dealerScore > playerScore) {
            return "Dealer wins!";
        }

        return "Tie!";
    }



    function instantbust(number) {


        if (number > 21) {
            return true
        }
        else {
            return false
        }
    }

    function cardcountdealerfunction(cardMap) {

        let total = 0;
        let aceCount = 0;
        
        for (let card of cardMap) {

            let value = card.Value; 

            if (value === "J" || value === "Q" || value === "K") {
                total += 10;
            } else if (value === "A") {
                aceCount += 1;
                total += 11; 
            } else {
                total += parseInt(value, 10); 
            }
        }

        
        while (total > 21 && aceCount > 0) {
            total -= 10; 
            aceCount -= 1;
        }

        return total;
    }

    socket.on("hitplayerhand", () => {
        


        
        users.get(socket.id)[0].push(takecard())
        
        if (cardCounter(users.get(socket.id)) == 21) {
            users.get(socket.id)[2].push("stay")
            io.to(socket.id).emit("disable_hit")
        }
        pugrender(users.get(socket.id), socket.id)



    })
    socket.on("stay", (msg) => {
        

        stayfunction(socket)
    })


    async function stayfunction(socket) {

        
        if (socket.id) {
            users.get(socket.id)[2].push("stay")
        }



        allReady = [...users.values()].every(userData =>
            userData[2].some(action => action === "stay")
        );

        if (allReady) {
            let toggletimer = false
            if (dealerhand.length === 1) { 
                dealerhand.push(dealerhand_hidden[0]);

                while (cardcountdealerfunction(dealerhand) < 17) {
                    
                    dealerhand.push(takecard())
                }

            }
            

            users.forEach((value, key) => {
               
                const firstSubArray = value[0];
                
                

                io.to(key).emit("stay_return", JSON.stringify(firstSubArray), dealerhand, status, handtotal(firstSubArray), cardcountdealerfunction(dealerhand));
                toggletimer = false
                
                if (users.size > 1) {
                    io.emit("disable_start")
                    
                }
                cardcountdealerfunction(dealerhand)
                cardCounter(firstSubArray)
                let winner = determineBlackjackWinner(cardcountdealerfunction(dealerhand), cardCounter(firstSubArray), firstSubArray.length, dealerhand.length)
                io.to(key).emit("render_winner", winner)
                


                
                const userSocket = io.sockets.sockets.get(key);
                if (userSocket) {
                    userSocket.emit("fetch_betamount");
                    
                }
                
                let arr = value[5]; 
                
                arr = parseInt(arr, 10);
             
                arr = arr + 1;
                value[5] = arr;

                io.emit("disable_double")

              
                users.get(key)[6] = false;
                io.to(key).emit("render_balance", users.get(key)[1]);
                
                io.to(key).emit("enable_bet_input")
                io.to(key).emit("disable_start")
                dealerhand = [];
                dealerhand_hidden = [];

            });
            


        }
    }





    function bet_payout(bet, playerid) {
        
        let firstSubArray = users.get(playerid)[0]
        let insurance = users.get(playerid)[4];
        
        let result = determineBlackjackWinner(cardcountdealerfunction(dealerhand), cardCounter(firstSubArray), firstSubArray.length, dealerhand.length)
        bet = parseInt(bet, 10)
        


       
        if (
            insurance === true &&
            dealerhand.length === 2 &&
            cardCounter(firstSubArray) == 21 &&
            (result == "dealer-win" || result == "Dealer wins! Player busted." || result == "Dealer wins!")
        ) {
            let balance = parseInt(users.get(playerid)[1], 10)
            
            
            if (users.get(socket.id)[6] == true) {
                balance = balance -(bet+bet)
            }else{
                balance = balance - bet
            }

            users.get(playerid)[1] = balance;
            
            
        } else
            if (result == "Player wins with 5-card rule!" || result == "Player wins! Dealer busted." || result == "Player wins!") {
                
                let balance = parseInt(users.get(playerid)[1], 10)
                
                
                if (users.get(socket.id)[6] == true) {
                    balance = balance + bet+bet
                }else{
                    balance = balance +bet
                }
                users.get(playerid)[1] = balance
                
                
            } else
                if (result == "dealer-win" || result == "Dealer wins! Player busted." || result == "Dealer wins!") {
                    let balance = parseInt(users.get(playerid)[1], 10)
                    
                    
                    
                    if (users.get(socket.id)[6] == true) {
                        balance = balance -bet
                    }else{
                        balance = balance - (bet+bet)
                    }
                    users.get(playerid)[1] = balance
                    
                    
                } else
                    if (result == "Tie!") {
                        
                        let balance = parseInt(users.get(playerid)[1], 10)
                        
                        
                        if (users.get(socket.id)[6] == true) {
                            balance = balance - bet
                        }else{
                            balance = balance - (bet+bet)   
                        }
                        users.get(playerid)[1] = balance
                        
                        
                    } else
                        if (result == "Dealer wins at 20 or 21!") {
                            
                            let balance = parseInt(users.get(playerid)[1], 10)
                            
                            
                            if (users.get(socket.id)[6] == true) {
                                balance = balance - (bet+bet)
                            }else{
                                balance = balance - bet
                            }
                            users.get(playerid)[1] = balance
                            
                            
                        } else
                            if (result == "instantbackjack") {
                                
                                let balance = parseInt(users.get(playerid)[1], 10)
                                
                                
                               
                                balance = balance + (bet * 1.5)
                                
                                
                                users.get(playerid)[1] = balance
                                
                                
                            }

        
        
        
        io.to(socket.id).emit("render_balance", users.get(socket.id)[1])
        
        saveaction()

    }


    function infocompiler() {

        let completeinfo = {
            balance: users.get(socket.id)[1],
            gamesplayed: users.get(socket.id)[5]
        }
        return completeinfo
    }

    function savegame(completeinfo) {

        let session = socket.request.session;
        let cookie = session?.username;
        if (!cookie) {
            
            return;
        }

        let rawdata = fs.readFileSync('users.json');

        let userdata = JSON.parse(rawdata);

        let userobj = userdata.find(obj => obj.username === cookie);
        if (!userobj) {
            
            return;
        }



        userobj.balance = completeinfo.balance;

        userobj.games_played = completeinfo.gamesplayed;

        fs.writeFileSync('users.json', JSON.stringify(userdata, null, 2));
        
        io.to(socket.id).emit("render_balance", users.get(socket.id)[1]);
        
    }

    function saveaction() {

        savegame(infocompiler());
    }

    socket.on("savegame", () => {
        

        saveaction()
    });



    socket.on("return_fetch", (bet) => {
        
        bet_payout(bet, socket.id);

    });








    socket.on("double", () => {
        

        users.get(socket.id)[6].push(true)

       
        io.to(socket.id).emit("render_balance", users.get(socket.id)[1]);
        
    });
    socket.on("get_wallet", (bet) => {


        socket.emit("return_wallet", users.get(socket.id)[1], bet)

        

        io.to(socket.id).emit("render_balance", users.get(socket.id)[1]);
        
    })



    socket.on("fetch_balance", () => {
        

        socket.emit("fetch_balance", users.get(socket.id)[1])
        
    })
    socket.on("fetch_balance2", () => {
       

        socket.emit("fetch_balance2", users.get(socket.id)[1])
        
    })
    













    // Simple profanity filter (original): only censors 'fuck', case-insensitive
    

// Place at the very top of the file:



// --- Chat Message Persistence ---
    const CHAT_FILE = 'chat_messages.json';
    // Load messages from file or initialize
    function loadChatMessages() {
        try {
            if (fs.existsSync(CHAT_FILE)) {
                const data = fs.readFileSync(CHAT_FILE, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) { console.error('Failed to load chat messages:', error); }
        return [];
    }
    function saveChatMessages(messages) {
        try {
            fs.writeFileSync(CHAT_FILE, JSON.stringify(messages, null, 2));
        } catch (error) { console.error('Failed to save chat messages:', error); }
    }
    if (!global.chatMessages) global.chatMessages = loadChatMessages();
    // Send all messages to new client
    socket.on('request all messages', () => {
        socket.emit('all chat messages', global.chatMessages);
    });
    // Handle new chat message
    socket.on("chat message", (message) => {
        // Sanitize the message to prevent XSS and filter profanity
        const sanitizedMessage = {
          id: String(Date.now()) + Math.floor(Math.random()*10000),
          username: escape(message.username),
          text: escape(message.text),
        };
        global.chatMessages.push(sanitizedMessage);
        saveChatMessages(global.chatMessages);
        io.emit("chat message", sanitizedMessage);
    });
    // Handle delete message
    socket.on("delete message", (data) => {
        const messageIndex = global.chatMessages.findIndex(m => m.id === data.id);
        if (messageIndex !== -1) {
            global.chatMessages.splice(messageIndex, 1);
            saveChatMessages(global.chatMessages);
            io.emit('delete message', { id: data.id });
        }
    });
    // --- End Chat Message Persistence ---
    
      // User connected event
      socket.on("user connected", (username) => {
        // Store username in socket session
        socket.username = escape(username)
    
        // Notify all users about the new connection
        io.emit("user event", `${socket.username} has joined the chat`)
      })
    
      // Handle disconnection
      const originalDisconnectHandler = socket.listeners("disconnect")[0]
      socket.removeAllListeners("disconnect")
    
      socket.on("disconnect", () => {
        // Run the original disconnect handler for game logic
        if (originalDisconnectHandler) {
          originalDisconnectHandler()
        }
    
        // Notify about user disconnection if username exists
        if (socket.username) {
          io.emit("user event", `${socket.username} has left the chat`)
        }

        // If no users remain, clear chat history
       
      })

      

      socket.on("fetch_username", (chatvalue) => {
        let username = socket.request.session.username;
        username = username.split("@")[0];

        socket.emit("fetch_usernamereturn", username, chatvalue);
    })
})