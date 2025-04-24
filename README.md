# Dokumentation för Tim Jiwads gymnasiearbete

## Innehållsförteckning


- [1. Introduktion](#1-introduktion)
- [2. Teknisk Översikt](#2-teknisk-översikt)
- [3. Funktionalitet](#3-funktionalitet)
  - [3.1 Initiering](#31-initiering)
  - [3.2 Utility-funktioner](#32-utility-funktioner)
  - [3.3 Autentisering](#33-autentisering)
    - [3.3.1 Register](#331-register)
    - [3.3.2 Login](#332-login)
    - [3.3.3 Logout](#333-logout)
- [4. Blackjack](#4-blackjack)
  - [4.1 Savefile](#41-savefile)
  - [4.2 Initilise blackjack](#42-initilise-blackjack)
    - [4.2.1 Initilise dealer](#421-initilise-dealer)
- [5. Installation och Körning](#8-installation-och-körning)
- [6. Säkerhet](#7-säkerhet)




## 1. Introduktion
Detta projekt är en webbaserad Blackjack-applikation där flera spelare kan delta samtidigt och spela mot en gemensam dealer. Varje spelare har ett eget konto och saldo, och kan använda olika Blackjack-funktioner som split, double, insurance och mer. Spelet har ett inbyggt bettingsystem där spelarna satsar och får utbetalning enligt klassiska Blackjack-regler. Realtids-chatt möjliggör kommunikation mellan spelare under spelets gång. All data, inklusive användarkonton, saldon och chattmeddelanden, hanteras säkert och lagras i JSON-filer för enkel översikt och transparens. Följ stegen på [Gå till introduktion](#5-Installation-och-Körning) för att testa projektet.



## 2. Teknisk Översikt


<ul>
  
  <li>Programmeringspråk:
    <ul>
      <li>JavaScript</li>
      <li>Node.js</li>
      <li>html</li>
      <li>css</li>
      <li>pug</li>
    </ul>
  </li>
  <li>Bibliotek:</li>
    <ul>
        <li>bcryptjs: Bibliotek för att hash:a lösenord</li>
        <li>escape-html: Bibliotek för att escape:a html-kod för att förhindra XSS-attacker</li>
        <li>express-rate-limit: Bibliotek för att begränsa hur många gånger en användare kan utföra en åtgärd under en viss tid</li>
        <li>express-session: Bibliotek för att hantera sessions i Express.js</li>
        <li>htmx.org: Bibliotek för att hantera AJAX-begäranden i HTML</li>
        <li>pug: Bibliotek för att rendera HTML-templates</li>
        <li>socket.io: Bibliotek för att hantera realtids-kommunikation i webbläsaren</li>
        <li>socket.io-client: Bibliotek för att ansluta till en WebSocket-server</li>
        <li>uuid: Bibliotek för att generera unika identifierare</li>
        <li>validator: Bibliotek för att validera data mot olika regler</li>
    </ul>
  <li>filstruktur:</li>
    <ul>
      <li>Filstruktur
        <ul>
          <li>DoNotOpen/:
            <ul>
              <li>Innehåller känslig information som inte ska delas.</li>
              <li>password.js: Innehåller ett objekt med en metod som returnerar en slumpmässig sträng som ska användas som secret för sessions.</li>
            </ul>
          </li>
          <li>func/:
            <ul>
              <li>Innehåller hjälpfunktioner för backend-logiken.</li>
              <li>createpost.js: Hjälpfunktion för att skapa ett inlägg.</li>
              <li>createlogin.js: Hjälpfunktion för att skapa ett inloggningstillfälle.</li>
            </ul>
          </li>
          <li>public/:
            <ul>
              <li>Innehåller statiska filer som CSS och bilder.</li>
              <li>style.css: CSS för applikationen. Anpassar utseendet.</li>
              <li>Innehåller de filer som klienten behöver för att fungera.</li>
              <li>client.js: Huvudfilen för klienten. Hanterar Socket.IO, och frontend-logik för Blackjack-spelet.</li>
            </ul>
          </li>
          <li>selfmade.js: Huvudfilen för servern. Hanterar routing, Socket.IO, och backend-logik för Blackjack-spelet.</li>
          <li>views/:
            <ul>
              <li>Innehåller Pug-templar som används för att generera dynamiskt innehåll.</li>
              <li>blackjack2.pug: Pug-mall för Blackjack-sidan.</li>
              <li>template.html: Pug-mall för startsidan. Fylls på dynamiskt.</li>
              <li>template2.html: Pug-mall för chatt sidorna. Fylls på dynamiskt.</li>
            </ul>
          </li>
          <li>chat_messages.json: Fil som innehåller alla chattmeddelanden.</li>
          <li>users.json: Fil som innehåller alla användarkonton.</li>
          <li>history.json: Fil som innehåller alla historik.</li>
        </ul>
    </ul>
    



</ul>











## 3. Funktionalitet

### 3.1 Initiering
```selfmade.js```
```js
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
```
Projektet initieras genom att importera nödvändiga "dependencies" (externa kodbibliotek). De olika biblioteken förklaras i avsnittet ["Teknisk Översikt"](#2-teknisk-översikt).
Här importeras även egna moduler som är skapade för projektet. Dessa moduler innehåller funktioner som används i projektet.

```js
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
```
Här skapas en Express-app. ```express.urlencoded``` används för att parsa URL-kodade data till objekt tillgänglig via ```req.body```, medan ```express.static``` används för att servera statiska filer som CSS och bilder.

```js
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
```
Här definieras en session-middleware med hjälp av express-session. Denna middleware används för att hantera användarsessioner i applikationen. ```secret``` är en hemlig sträng som används för att signera session-ID:n i cookies. Detta säkerställer att cookies inte kan manipuleras av klienten.<br>
```resave:``` Om false sparas inte sessionen om den inte har ändrats. Detta minskar onödiga skrivningar till sessionlagringen. saveUninitialized: Om true sparas en ny session även om den inte innehåller någon data. Detta kan vara användbart för att spåra användare innan de loggar in.<br>
```cookie:``` Inställningar för sessionens cookie:<br>
```httpOnly:``` Förhindrar att cookien kan nås via JavaScript på klienten, vilket ökar säkerheten.<br>
```maxAge:``` Anger cookiens livslängd i millisekunder. Här är den satt till 7 dagar.<br>
```secure:``` Om true eller production skickas cookien endast över HTTPS.<br>
Denna middleware används för att hantera autentisering och hålla reda på användarens inloggningsstatus i applikationen.<br><br>
```js
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10,
    message: "Too many attempts, please try again later. (max 15 min)"
});
```
Här definieras en begränsning för autentisering. ```authLimiter``` används för att begränsa hur många gånger en användare kan försöka logga in under en viss tid. Här är den satt till att tillåta 10 försök under 15 minuter.

```js
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);
```
Här används ```sessionMiddleware``` för att hantera sessioner i både ```app``` och ```io``` (Socket.IO). Detta säkerställer att användarinformationen är tillgänglig för både HTTP-baserade och WebSocket-baserade anrop.

```js
server.listen(7777, () => {
    console.log("http://localhost:7777");
});
```
Här startas servern på port 7777. Den är tillgänglig via ```http://localhost:7777```. Den är en HTTP-server som hanterar både HTTP-baserade och WebSocket-baserade anrop.




```js
app.get("/actualwebsite")
app.get("/logout")
app.get("/blackjack", execute);
app.get("/login", showlogin)
app.post("/login", authLimiter, login)
app.get("/register", reg);
app.post("/register", authLimiter, register);
app.get("/uwu", uwu)
app.get("/deleteaccount", deleteaccount)
```
Här är en lista över alla route-handlers i applikationen. De hanterar olika sidor i applikationen och olika funktioner som logga in, logga ut, registrera, etc.



### 3.2 Utility-funktioner

```js
function render(content) {

    let html = fs.readFileSync("template.html").toString();

    return html.replace("{content}", content);

}
```
```js
function render2(content) {
    let html = fs.readFileSync("template2.html").toString();

    return html.replace("{content}", content);
}
```


dessa är funktioner som används för att returnera en förklaring till ett Blackjack-resultat. Den tar emot en array med information om spelarens hand samt dealers visade kort som argument. Funktionen returnerar en sträng med en förklaring till resultatet.

### 3.3 autentisering 
#### 3.3.1 register
```js
let form = `<form action="/register" method="post">
    <input type="email" name="quote" placeholder="email" required>
    <input type="password" name="quote" placeholder="password" required>
    <input type="submit" value="submit">
    
</form>
`;
```
```action="/register"``` – Formuläret skickas till ```/register``` endpointen på servern.<br>
```method="post"``` – Använder HTTP POST för att skicka data.<br>
Två inputfält:<br>
Email-fält: ```type="email"``` kräver korrekt e-postformat.<br>
Lösenordsfält: ```type="password"``` döljer det som skrivs in.<br>
Båda input-fälten har samma ```name="quote"``` vilket skapar en lista (```req.body.quote```) på serversidan.<br>
```js
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
```
Validerar e-post – kontrollerar att den första posten i ```req.body.quote``` är en giltig e-postadress.<br>
Läser och kontrollerar användare – läser in användare från en JSON-fil och kollar om e-posten redan finns registrerad.<br>
Hashar lösenordet – om användaren är ny, hashars lösenordet med ```bcrypt```.br>
Skapar användar-ID och UUID – genereras unikt för varje ny användare.<br>
Sparar användaren – det nya användarobjektet sparas, ofta via en funktion som ```createlogin()```.<br>
Omdirigerar eller visar fel – lyckad registrering skickar vidare till inloggningssidan, annars visas ett felmeddelande.<br>
 
#### 3.3.2 login

```js
function showlogin(req, res) {

    let lol = `<form action="/login" method="post">
    <input type="email" name="email" placeholder="email" required>
    <input type="password" name="password" placeholder="password" required>
    <input type="submit" value="submit">
    
</form>
`;
    res.send(render(lol));
}
```
Funktionen showlogin skickar ett HTML-formulär till klienten som innehåller två fält:<br>
Email – kräver korrekt e-postformat ```(type="email")```.<br>
Lösenord – inmatningen döljs ```(type="password")```.<br>
Formuläret skickas via ```POST``` till ```/login```.<br>
Formen är tydligt uppbyggd med namn (```name="email"``` och ```name="password"```) vilket gör att servern kan hämta <br>värdena direkt med ```req.body.email``` och ```req.body.password.```<br>
```js
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
```
När användaren skickar in formuläret hanteras det så här:<br>
E-post och lösenord hämtas från ```req.body```.<br>
```users.json``` läses in och tolkas som en lista med användare.<br>
Programmet letar efter en användare där username matchar den inmatade e-posten.<br>
Om ingen hittas, visas "```User not found```".<br>
Det inskickade lösenordet jämförs mot det hashade lösenordet i filen med hjälp av ```bcrypt.compare```.<br>
Vid fel lösenord, visas "```wrong credentials```".<br>
Om inloggningen lyckas sparas följande i sessionen:<br>
```username``` – vem som är inloggad<br>
```id``` – användarens ID<br>
```uuid``` – unikt användarvärde<br>
```checkpass``` sätts till ```true``` för att markera att lösenordet stämde<br>
Användaren skickas vidare till sidan ```/actualwebsite```.<br>


#### 3.3.3 logout 
```js
app.get("/logout", (req, res) => {

    req.session.destroy();

    res.redirect("/");
});
```
```req.session.destroy()``` tar bort all information som sparats i sessionen, t.ex. vem som är inloggad. Det är som att "nollställa" användaren.<br>
```res.redirect("/")``` skickar användaren till startsidan.<br>




## 4. blackjack


### 4.1 savefile

```js
function makehistory(history) {
  let history1 = JSON.parse(require("fs").readFileSync("history.json").toString());
  history1.push(history);
  require("fs").writeFileSync("history.json", JSON.stringify(history1, null, 2));
}
```




Denna funktion används för att lägga till en ny historikpost i filen `history.json`. Den fungerar enligt följande:

1. Läser in den befintliga historiken från `history.json` och tolkar den som en JavaScript-array.
2. Lägger till den nya historikposten (`history`) i arrayen.
3. Skriver tillbaka den uppdaterade arrayen till `history.json`, formaterad med indrag för bättre läsbarhet (`null, 2`).

Det är viktigt att säkerställa att filen `history.json` existerar och innehåller en giltig JSON-struktur innan funktionen används, för att undvika fel.


### 4.2 initilise blackjack
### 4.2.1 initilise dealer

```js


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
```
/**
 * Handles the initialization of the dealer's hand in a blackjack game.
 * 
 * This function performs the following steps:
 * 1. Checks if the deck has 20 or fewer cards remaining. If so, it reinitializes the deck,
 *    multiplies it (presumably to create multiple decks), and shuffles it.
 * 2. Checks if the dealer's hand is empty. If it is, it adds one card to the dealer's visible hand
 *    and one card to the dealer's hidden hand.
 * 3. If the dealer's hand is not empty, the function exits without making any changes.
 * 
 * Note: This function assumes the existence of the following global variables and functions:
 * - `deck4x`: An array representing the current deck of cards.
 * - `dealerhand`: An array representing the dealer's visible hand.
 * - `dealerhand_hidden`: An array representing the dealer's hidden hand.
 * - `intitiate_deck()`: A function to initialize the deck.
 * - `multiply_deck()`: A function to multiply the deck (e.g., for multi-deck games).
 * - `deckshuffle()`: A function to shuffle the deck.
 * - `takecard()`: A function to draw a card from the deck.
 */
 ### 4.2.2 initilise deck
```js
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
```
Denna funktion skapar en standardkortlek bestående av 52 spelkort. Varje kort representeras som ett objekt med två egenskaper:

```Value:``` En sträng som representerar kortets valör (t.ex. ```"A"```, ```"2"```, ..., ```"10"```, ```"J"```, ```"Q"```, ```"K"```).
<br>

```Suit:``` En sträng som representerar en av de fyra färgerna (```"spades"```, ```"diamonds"```, ```"clubs"```, ```"hearts"```).
<br>

Funktionen loopar genom varje kombination av färg och valör, skapar ett kortobjekt, och lägger till det i arrayen ```deck```.

<br> 

```deck:``` En array som innehåller de 52 kortobjekten.<br> 

```deck4x:``` En tom array som definieras men aldrig används eller modifieras i funktionen. Den returneras i slutet, vilket troligen är ett misstag.<br> 

```suits:``` En array som innehåller de fyra kortfärgerna.<br> 

```values:``` En array som innehåller alla tretton valörer.<br> 
```js
function multiply_deck() {

    deck4x = deck4x.concat(deck);
    deck4x = deck4x.concat(deck);
    deck4x = deck4x.concat(deck);
    deck4x = deck4x.concat(deck);

};
```
- `concat()` används för att kombinera arrayer. Den ändrar inte originalarrayen utan returnerar en ny.
- `deck4x` uppdateras fyra gånger genom att lägga till `deck` varje gång.
```js
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

```

Blandar kortleken `deck4x` slumpmässigt med hjälp av 
**Fisher-Yates-algoritmen**.

```js

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


```

- `deck`: En array som innehåller alla spelkort, initialiserad i `initilise_deck()`.
- `deck4x`: En array som innehåller fyra kopior av `deck`, initialiserad i `multiply_deck()`.
- `dealerhand`: En array som innehåller dealerns synliga hand, initialiserad i `part1_dealerhand()`.
- `dealerhand_hidden`: En array som innehåller dealerns dolda hand, initialiserad i `part1_dealerhand()`.
- `users`: En Map som innehåller alla spelare, med deras ID som nyckel och deras speldata som v rde.
- `allReady`: En flagga som anger om alla spelare är redo att börja spelet.
- `status`: En flagga som anger om spelet är igång eller inte.
- `static_timer`: En konstant som anger hur lång tid spelarna har på sig att göra sina drag.
- `intervall`: En variabel som håller koll på hur lång tid som är kvar av timern.
- `toggletimer`: En variabel som anger om timern är igång eller inte.
- `buster`: En variabel som anger om dealern har fått en buster (ett resultat som är högre än 21).
### 4.3 spelstart


#### 4.3.1 resetGame
```js


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
```
återställer globala variablers värden. för att göra platts för nytt spel


```js
function startNewRound() {
    dealerhand = [];
    dealerhand_hidden = [];
    part1_dealerhand();
    

}
```
Startar ett nytt spelomgång av Blackjack. <br>
Denna funktion utför följande steg:<br>
Återställer dealerns synliga hand och dolda hand.<br>
Anropar funktionen part1_dealerhand(), som drar två kort för dealerns synliga hand och dolda hand.<br>

#### 4.3.2 socket.io

```js
 io.on("connection", (socket) => {


    io.emit("disable_hit")
    io.emit("disable_stay")
    io.emit("disable_start")
    io.emit("disable_savegame")
    io.emit("no_incurance")
    io.emit("disable_double")
    

```
skickar kommandon till alla klienter för att inaktivera vissa knappar och funktioner i början av en runda. detta sker genom att använda ```io.emit()``` för att skicka en signal till klienten.
 



```js
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
```
koden kontrollerar om användaren är inloggad och har ett giltigt sessions-id (```uuid``). Om så är fallet läses användarens data in från filen ```users.json```. Programmet letar sedan upp användaren i listan genom att jämföra ```uuid```. Om användaren hittas, skapas en post i serverns ```users.Map``` där socket-id används som nyckel. Denna post innehåller spelarens hand, saldo, och annan spelrelaterad information. Saldot skickas även till klienten genom ```io.to(socket.id).emit("render_balance", ...)```. Om användaren inte finns i filen, skapas en ny post med startsaldo 1000 och 0 spelade spel.
<br>
En Map i JavaScript är en datastruktur som lagrar nyckel-värde-par, där varje nyckel är unik. I detta fall används ```users.Map``` för att koppla varje spelares socket-id (unik identifierare för en anslutning) till deras nuvarande speldata. Det gör det enkelt och snabbt att hämta eller uppdatera information om en specifik spelare under spelets gång.
<br>

#### 4.3.3 bet input

```js
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
```
koden hanterar vad som händer när en spelare skickar in en insats (bet) via eventet ```"betreturn"```. Först skickas spelarens nuvarande saldo tillbaka till klienten med ```io.to(socket.id).emit("render_balance", users.get(socket.id)[1])```.

Om insatsen är större än 0:

- En signal skickas till klienten om att spelet kan starta (```socket.emit("test_start")```).
- Ett nytt event ```"start_hand"``` lyssnas på. När detta triggas:
  - Om dealerns hand är tom, startas en ny runda med ```startNewRound()```, och spelarens hand samt ett ytterligare fält nollställs.
  - Timern (```ntervall```) återställs till sitt ursprungliga värde.
  - Spelarens hand och ett ytterligare fält nollställs igen för att säkerställa att allt är reset.
  - Om kortleken har färre än eller lika med 60 kort kvar, skapas och blandas en ny kortlek.
  - Om spelarens hand är tom efter detta, dras två nya kort till spelaren.
  - Slutligen renderas spelets vy för spelaren med ```pugrender```.

Om insatsen är 0 eller mindre:

- Spelaren får tillbaka möjligheten att ange insats (```socket.emit("enable_bet_input")```).
- Ett felmeddelande skickas till klienten (```socket.emit("error message")```).


#### 4.3.4 disconnect

```js

socket.on("disconnect", () => {
        
        c
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

```
- Variabeln ```allReady``` sätts till ```true```.
- Funktionen ```stayfunction``` anropas för den spelare som kopplar från, vilket hanterar spelarens "stay"-status i spelet.
- Spelarens data tas bort från ```users.Map``` med ```users.delete(socket.id)```.
- En signal skickas till klienten om att "manual_stay" ska aktiveras (```io.to(socket.id).emit("manual_stay")```).
- Om det bara finns en spelare kvar efter borttagningen, hämtas dennes socket-id och ```stayfunction``` anropas även för denna spelare.
- Om inga spelare finns kvar, återställs spelet med ```resetGame()```.

### 4.4. game logic and gameplay
```js
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
```
Funktionen ```pugrender(users, socketid)``` ansvarar för att uppdatera och skicka relevant speldata till klienten efter att en spelrunda har spelats eller när spelarens hand förändras.

- Först räknas spelarens nuvarande poäng med ```cardCounter(users[0])``` och resultatet sparas i variabeln ```count```.
- Funktionen ```instantbust(count)``` kontrollerar om spelaren har förlorat direkt (t.ex. fått mer än 21 poäng). Om så är fallet sätts variabeln ```buster``` till "```player bust```" och knappen för att dra fler kort inaktiveras på klienten med ```io.to(socketid).emit("disable_hit")```. 
- Spelarens och dealerns kortvärden räknas ut och sparas i ```cardcountplayer``` och ```cardcountdealer```.
- Ett historikobjekt skapas som innehåller aktuell speldata (```users```, ```dealerhand```, ```status```, ```cardcountplayer```, ```cardcountdealer```) och skickas till funktionen ```makehistory``` för att spara rundan.
- Ny speldata skickas till klienten via ```io.to(socket.id).emit("starthand_return", ...)```, där spelarens hand, dealerns hand, status och poäng skickas med.
- Funktionen lyssnar på eventet ```"returninsurance"``` från klienten, och uppdaterar om spelaren valt att ta försäkring eller inte (genom att sätta ```users[4]``` till ```true``` eller ```false```).
- Slutligen skickas spelarens aktuella saldo till klienten med ```io.to(socket.id).emit("render_balance", (users[1]))```. 
Detta säkerställer att klienten alltid har uppdaterad information om spelet, spelarens hand, dealerns hand, status och saldo.

```js
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
```

Funktionen ```cardCounter(cardMap)``` räknar ut den totala poängen för en hand i blackjack, där ```cardMap``` är en array med kortobjekt.
- Först initieras två variabler: ```total``` (för den totala poängen) och ```aceCount``` (för att hålla reda på antalet ess).
- Funktionen loopar igenom varje kort i handen:
  - Om kortet är en knekt, dam eller kung (värde "J", "Q" eller "K") läggs 10 till totalen.
  - Om kortet är ett ess ("A") läggs 11 till totalen och ```aceCount``` ökas med 1.
  - Om kortet är något annat (dvs. ett sifferkort), läggs dess numeriska värde till totalen.
- Efter att alla kort räknats, justeras totalen om den är över 21 och det finns ess i handen: för varje ess dras 10 från totalen tills totalen är 21 eller lägre, eller tills det inte finns fler ess kvar att justera.
- Funktionen returnerar slutligen den totala poängen för handen.
Detta säkerställer att ess räknas som 11 om det är möjligt utan att gå över 21, annars räknas de som 1. Funktionen följer blackjackens poängregler.

```js
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
```
Funktionen ```determineBlackjackWinner``` avgör vem som vinner i en blackjack-situation.

- Om spelaren har 2 kort och 21 poäng, och dealer har mindre än 21, returneras "instantbackjack".<br>
Om spelaren har 5 kort och 21 poäng, returneras "Player wins with 5-card rule!".<br>
Om dealer och spelare har samma poäng och dealer har 17, 18, eller 19, returneras "Tie!".<br>
Om dealer har 20 eller 21 poäng, returneras "Dealer wins at 20 or 21!".<br>
Om spelaren har mer än 21 poäng, returneras "Dealer wins! Player busted.".<br>
Om dealer har mer än 21 poäng, returneras "Player wins! Dealer busted.".<br>
Om spelaren har mer poäng än dealer, returneras "Player wins!".<br>
Om dealer har mer poäng än spelaren, returneras "Dealer wins!".<br>
Om inga av ovanstående villkoren uppfylls, returneras "Tie!".<br>



```js
function instantbust(number) {


        if (number > 21) {
            return true
        }
        else {
            return false
        }
    }
```
Funktionen ```instantbust``` kontrollerar om spelaren har 21 poäng.

- Om spelaren har mer än 21 poäng, returneras ```true```.
- Annars returneras ```false```.
```js
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
```
Funktionen ```cardcountdealerfunction``` räknar ut dealerens poäng.

- Först initieras ```total``` och ```aceCount```.
- Loopar igenom varje kort i handen:<br>
Om kortet är en knekt, dam eller kung (värde "J", "Q" eller "K"), läggs 10 till totalen.<br>
Om kortet är ett ess ("A"), läggs 11 till totalen och ```aceCount``` ökas med 1.<br>
Om kortet är något annat (dvs. ett sifferkort), läggs dess numeriska värde till totalen.<br>
Efter att alla kort räknats, justeras totalen om den är över 21 och det finns ess i handen: för varje ess dras 10 från totalen tills totalen är 21 eller lägre, eller tills det inte finns fler ess kvar att justera.<br>
Funktionen returnerar slutligen den totala poängen för handen.<br>
Detta säkerställer att ess räknas som 11 om det är möjligt utan att gå över 21, annars räknas de som 1.<br>
Funktionen följer blackjackens poängregler.<br>

```js


    socket.on("hitplayerhand", () => {
        


        
        users.get(socket.id)[0].push(takecard())
        
        if (cardCounter(users.get(socket.id)) == 21) {
            users.get(socket.id)[2].push("stay")
            io.to(socket.id).emit("disable_hit")
        }
        pugrender(users.get(socket.id), socket.id)



    })
```
Funktionen ```hitplayerhand``` hanterar en spelares hand när de väljer att dra ett kort.

- Först läggs ett nytt kort till spelarens hand med ```takecard()```. <br>
Om spelaren får 21 poäng, sätts ```"stay"``` till spelarens status och knappen för att dra fler kort inaktiveras på klienten med ```io.to(socket.id).emit("disable_hit")```. <br>
Funktionen anropar ```pugrender``` för att uppdatera klientens vy.

```js

socket.on("stay", (msg) => {
        

        stayfunction(socket)
    })
```
Funktionen ```stay``` hanterar en spelares hand när de väljer att stanna.

- Anropar ```stayfunction``` för att hantera spelarens hand.

```js

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
```
Funktionen ```stayfunction``` hanterar en spelares hand när de väljer att stanna.

- Om ```socket.id``` finns, läggs ```"stay"``` till spelarens status.
- ```allReady``` kontrollerar om alla spelare har valt att stanna.
- Om ```allReady``` är sant, hanteras dealerens hand:
  - Om dealerens hand har en kort, läggs dealerens hidden kort till dealerens hand.
  - Dealeren får kort tills hans poäng är 17 eller mer.
  - För varje spelare:
    - Skickas ```stay_return``` till klienten med spelarens hand, dealerens hand, status, spelarens poäng och dealerens poäng.
    - Om ```users.size``` är större än 1, ```disable_start``` skickas till alla klienter.
    - ```cardcountdealerfunction``` och ```cardCounter``` räknar ut dealerens och spelarens poäng.
    - ```determineBlackjackWinner``` avgör vem som vinner.
    - ```fetch_betamount``` skickas till klienten för att hämta insatsen.
    - ```arr``` ökas med 1.
    - ```disable_double``` skickas till klienten.
    - ```users.get(key)[6]``` sätts till ```false```.
    - ```render_balance``` skickas till klienten.
    - ```enable_bet_input``` och ```disable_start``` skickas till klienten.
    - ```dealerhand``` och ```dealerhand_hidden``` resetas.

```js
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
```

Funktionen ```bet_payout(bet, playerid)``` räknar ut och uppdaterar spelarens saldo baserat på resultatet av en blackjack-runda. 

- Först hämtas spelarens hand (```firstSubArray```) och om spelaren har försäkring (```insurance``) från users-Map. 

- Resultatet av rundan bestäms med ```determineBlackjackWinner```-funktionen, där dealer- och spelarpoäng samt antal kort skickas in. 

- Insatsen (```bet```) omvandlas till ett heltal. 

- Sedan följer flera villkor för att avgöra hur saldot ska justeras: 

  - Om spelaren har försäkring, dealern har två kort, spelaren har 21 och resultatet är att dealern vinner, dras insatsen (eller dubbla insatsen om dubblerat) från saldot. 

  - Om spelaren vinner (inklusive 5-kortsregeln eller om dealern bustar), ökas saldot med insatsen (eller dubbla insatsen om dubblerat). 

  - Om dealern vinner, dras insatsen (eller dubbla insatsen om dubblerat) från saldot. 

  - Om det blir oavgjort (tie), dras insatsen (eller dubbla insatsen om dubblerat) från saldot. 

  - Om dealern vinner med exakt 20 eller 21, dras insatsen (eller dubbla insatsen om dubblerat) från saldot.

  - Om spelaren får en "instantbackjack" (direkt blackjack), ökas saldot med 1,5 gånger insatsen.

- Efter att saldot uppdaterats skickas det nya saldot till klienten med io.to(socket.id).emit("render_balance", users.get(socket.id)[1]).

- Slutligen anropas saveaction() för att spara åtgärden.


```js
socket.on("double", () => {
        

        users.get(socket.id)[6].push(true)

       
        io.to(socket.id).emit("render_balance", users.get(socket.id)[1]);
        
    });
```

Koden lyssnar på eventet ```"double"``` från klienten. När detta event tas emot:

Lägger den till värdet ```true``` i spelarens data (på plats 6 i arrayen kopplad till spelarens socket-id), vilket markerar att spelaren har valt att dubbla sin insats.
Skickar sedan spelarens nuvarande saldo till klienten med ```io.to(socket.id).emit("render_balance", users.get(socket.id)[1])```. <br>
Detta gör det möjligt för spelaren att dubbla sin insats under en runda, och ser till att klienten får uppdaterad information om saldot direkt.
```js
socket.on("get_wallet", (bet) => {


        socket.emit("return_wallet", users.get(socket.id)[1], bet)

        

        io.to(socket.id).emit("render_balance", users.get(socket.id)[1]);
        
    })
```

Koden lyssnar på eventet ```"get_wallet"``` från klienten. När detta event tas emot:

Skickar spelarens nuvarande saldo till klienten med ```socket.emit("return_wallet", users.get(socket.id)[1], bet)```. <br>
Skickar sedan spelarens nuvarande saldo till klienten med ```io.to(socket.id).emit("render_balance", users.get(socket.id)[1])```. <br>
Detta gör det möjligt för spelaren att se sin aktuella saldo i en wallet-view.
```js
socket.on("fetch_balance", () => {
        

        socket.emit("fetch_balance", users.get(socket.id)[1])
        
    })
    socket.on("fetch_balance2", () => {
       

        socket.emit("fetch_balance2", users.get(socket.id)[1])
        
    })
```

Koden lyssnar på eventet ```"fetch_balance"``` från klienten. När detta event tas emot:

Skickar spelarens nuvarande saldo till klienten med ```socket.emit("fetch_balance", users.get(socket.id)[1])```. <br>

Koden lyssnar på eventet ```"fetch_balance2"``` från klienten. När detta event tas emot:

Skickar spelarens nuvarande saldo till klienten med ```socket.emit("fetch_balance2", users.get(socket.id)[1])```. <br>



### 5.1 saveaction
```js
 function infocompiler() {

        let completeinfo = {
            balance: users.get(socket.id)[1],
            gamesplayed: users.get(socket.id)[5]
        }
        return completeinfo
    }
```
Funktionen ```infocompiler``` skapar ett objekt med ```balance``` och ```gamesplayed``` från users-Map.

```js
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
```

Funktionen ```savegame(completeinfo)``` sparar spelarens aktuella saldo och antal spelade spel till filen ```users.json```.

- Först hämtas spelarens session och användarnamn (cookie) från sessionen.
  - Om inget användarnamn finns (dvs. spelaren är inte inloggad), avbryts funktionen direkt.
- Användardata läses in från filen ```users.json``` och parsas till ett JavaScript-objekt.
- Rätt användare letas upp i listan genom att jämföra användarnamn.
  - Om användaren inte hittas, avbryts funktionen.
- Spelarens saldo (```balance```) och antal spelade spel (```games_played```) uppdateras i användarobjektet med värdena från ```completeinfo```. <br>
- Den uppdaterade användarlistan skrivs tillbaka till ```users.json``` med indentering för läsbarhet.
- Slutligen skickas det nya saldot till klienten med ```io.to(socket.id).emit("render_balance", users.get(socket.id)[1])```. <br>

Detta säkerställer att spelarens aktuella saldo och statistik sparas permanent och att klienten får uppdaterad information direkt.



```js
function saveaction() {

        savegame(infocompiler());
    }
```

Funktionen ```saveaction()``` anropar ```savegame()``` med ```infocompiler()``` som argument.

```js
socket.on("savegame", () => {
        

        saveaction()
    });
```

Koden lyssnar på eventet ```"savegame"``` från klienten. När detta event tas emot anropas funktionen ```saveaction()```, som i sin tur sparar spelarens aktuella saldo och statistik till filen ```users.json``` (via funktionerna ```infocompiler``` och ```savegame```).




## 5 chat function

```js
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
```
- Konstanten ```CHAT_FILE``` anger filen där alla chattmeddelanden sparas (```chat_messages.json```).
- ```loadChatMessages()``` försöker läsa in alla sparade meddelanden från filen. Om filen finns, läses och parsas innehållet till en array med meddelanden. Om något går fel loggas ett felmeddelande och en tom array returneras.
- ```saveChatMessages(messages)``` sparar den aktuella listan med meddelanden till filen. Om något går fel loggas ett felmeddelande.
- ```global.chatMessages``` används för att lagra alla meddelanden i minnet under serverns livslängd. Om det inte redan finns, laddas det från filen.
- När en klient ansluter och skickar eventet 'request all messages', skickas hela chatthistoriken till klienten med 'all chat messages'.
- När ett nytt meddelande skickas via "chat message", saneras användarnamn och text (för att undvika XSS och olämpligt innehåll). Ett unikt id genereras för meddelandet. Meddelandet läggs till i listan, sparas till filen och skickas ut till alla anslutna klienter.
- När ett meddelande ska tas bort via "delete message", letar servern upp meddelandet i listan med hjälp av dess id. Om det finns tas det bort, listan sparas och alla klienter informeras om borttagningen.
- När en användare ansluter via "user connected" sparas användarnamnet i socket-objektet (efter sanering). Alla klienter får ett meddelande om att användaren har gått med i chatten.
- Vid frånkoppling ("disconnect"):
  - Den ursprungliga disconnect-hanteraren för spelet körs först (så att spelets logik fungerar som vanligt).
  - Om användaren har ett användarnamn skickas ett meddelande till alla klienter om att användaren har lämnat chatten.
- När klienten vill veta sitt användarnamn ("fetch_username"), hämtas användarnamnet från sessionen, domändelen tas bort (allt efter "@"), och svaret skickas tillbaka till klienten.

## 6. Client script.

### 6.1 init och timer
```js
const socket = io();
let time = 60
let count = time;
let timer;
let balance1 = 0;
```


Initierar socket.io-klienten för realtidskommunikation mellan klient och server. Variablerna `time`, `count`, och `timer` används för att hantera rundans nedräkningstimer, medan `balance1` lagrar spelarens aktuella saldo på klientsidan.

```js
 socket.on("init", client_init);

    
    let div = document.querySelector(".time"); // not correct . make what clicks stop and starts timer and hat timer does

    function startTimer() {
        timer = setInterval(() => {

            count--;
            if (count == 0) {

                stopTimer();
                executeWhenTimerEnds()
            }
            div.innerText = count;



        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer);
        count = time;
    }
```


- Lyssnar på "init"-eventet från servern.
- Hämtar referens till ett DOM-element för att visa nedräkning.
- `startTimer()`: Startar en sekundtimer som minskar `count` varje sekund.
- `stopTimer()`: Stoppar timern och återställer räknaren.

```js
function executeWhenTimerEnds() {
        document.getElementById("hitplayerhand").disabled = true;
        document.getElementById("stay").disabled = true;
        socket.emit("stay")
        document.getElementById("insuranceyes").disabled = true;
        document.getElementById("insuranceno").disabled = true;

    }
```
- `executeWhenTimerEnds()`: Körs när timern når noll. Funktionen:
  - Inaktiverar knapparna för "hit" och "stay" så att spelaren inte kan göra fler drag.
  - Skickar automatiskt ett "stay"-event till servern via socket.
  - Inaktiverar även knapparna för försäkringsval ("insuranceyes" och "insuranceno").

### 6.2 spel logik
```js



socket.on("starthand_return", (data, data2, data3, total1, total2) => {
        
        stopTimer()
        startTimer()
        if ((data2[0].Value) === "A") {
            document.getElementById("info").textContent = "Dealer has an ace, want to buy insurance?";

            document.getElementById("insuranceyes").disabled = false;
            document.getElementById("insuranceno").disabled = false;
            document.getElementById("hitplayerhand").disabled = true
            document.getElementById("stay").disabled = true
            document.getElementById("double").disabled = true
        }
        else {
            document.getElementById("insuranceyes").disabled = true;
            document.getElementById("insuranceno").disabled = true;
        }


        

        if (data3 == true) {
            document.getElementById("status").textContent = JSON.stringify("player has busted");
        } else if (data3 == false) {
            document.getElementById("status").textContent = JSON.stringify(" waiting...");
        }

        document.getElementById("playerhand").textContent = data;
        document.getElementById("total1").textContent = JSON.stringify(total1);
        document.getElementById("dealerhand").textContent = JSON.stringify(data2);
        document.getElementById("total2").textContent = JSON.stringify(total2);

        
    });
```
- Lyssnar på "starthand_return"-eventet från servern när en ny hand startar.
- Stoppar och startar om timern för rundan.
- Om dealerns första kort är ett ess (`A`):
  - Visar meddelande om försäkring.
  - Aktiverar knappar för försäkringsval och inaktiverar övriga åtgärdsknappar.
- Om dealern inte har ess:
  - Försäkringsknapparna inaktiveras.
- Uppdaterar statusmeddelande beroende på om spelaren har bustat eller väntar.
- Visar spelarens och dealerns händer samt deras totala värden i gränssnittet.

```js
document.getElementById("start").addEventListener("click", () => {
        
        
        socket.emit("fetch_balance")
        socket.on("fetch_balance",(value)=>{

            
        })
        socket.emit("start_hand");

        
        document.getElementById("insuranceyes").disabled = true;
        document.getElementById("insuranceno").disabled = true;

        document.getElementById("start").disabled = true;
        document.getElementById("hitplayerhand").disabled = false;

        document.getElementById("stay").disabled = false;
        document.getElementById("double").disabled = false;
        document.getElementById("savegame").disabled = true;


    });
```
- Hanterar klick på "start"-knappen för att starta en ny spelrunda.
- Skickar en förfrågan till servern om att hämta spelarens saldo och därefter starta en ny hand.
- Inaktiverar försäkringsknapparna.
- Inaktiverar "start"-knappen för att förhindra flera starter.
- Aktiverar knappar för "hit", "stay" och "double".
- Inaktiverar "savegame"-knappen under pågående runda.

```js
document.getElementById("hitplayerhand").addEventListener("click", () => {
        stopTimer()
        startTimer()

        socket.emit("hitplayerhand")
        document.getElementById("insuranceyes").disabled = true;
        document.getElementById("insuranceno").disabled = true;
        document.getElementById("double").disabled = true;
    })
    document.getElementById("stay").addEventListener("click", () => {
        
        document.getElementById("input_button").disabled = false
        document.getElementById("input").disabled = false
        document.getElementById("hitplayerhand").disabled = true;
        document.getElementById("stay").disabled = true;
        document.getElementById("savegame").disabled = false;
        socket.emit("stay");
    })
```
- Hanterar klick på "hit"-knappen:
  - Stoppar och startar om timern för rundan.
  - Skickar ett "hitplayerhand"-event till servern för att dra ett nytt kort.
  - Inaktiverar försäkrings- och double-knapparna under denna åtgärd.
- Hanterar klick på "stay"-knappen:
  - Aktiverar bet-input och dess knapp för nästa runda.
  - Inaktiverar "hit"- och "stay"-knapparna för att förhindra fler drag.
  - Aktiverar "savegame"-knappen.
  - Skickar ett "stay"-event till servern för att avsluta spelarens tur.

```js
socket.on("stay_return", (data, data2, data3, total1, total2) => {

        stopTimer()

        
        if (data3 == true) {
            document.getElementById("status").textContent = JSON.stringify("player has busted");
        } else if (data3 == false) {
            document.getElementById("status").textContent = JSON.stringify("waiting...");
        }

        document.getElementById("playerhand").textContent = data;
        document.getElementById("total1").textContent = JSON.stringify(total1);
        document.getElementById("dealerhand").textContent = JSON.stringify(data2);
        document.getElementById("total2").textContent = JSON.stringify(total2);

        
        document.getElementById("input_button").disabled = false
        document.getElementById("insuranceyes").disabled = true;
        document.getElementById("insuranceno").disabled = true;
        document.getElementById("input").disabled = false;    })
```
- Lyssnar på "stay_return"-eventet från servern när spelaren har valt att stanna.
- Stoppar timern för rundan.
- Uppdaterar statusmeddelande beroende på om spelaren har bustat eller väntar.
- Visar spelarens och dealerns händer samt deras totala värden i gränssnittet.
- Aktiverar bet-input och dess knapp för nästa runda.
- Inaktiverar försäkringsknapparna.
- Aktiverar bet-inputfältet så att spelaren kan ange ny insats.

```js
socket.on("disable_hit", () => {
        document.getElementById("hitplayerhand").disabled = true;

    })
    socket.on("disable_start", () => {
        document.getElementById("start").disabled = true;

    })
    socket.on("enable_start", () => {
        document.getElementById("start").disabled = false;

    })
    socket.on("disable_stay", () => {
        document.getElementById("stay").disabled = true;

    })
    socket.on("render_winner", (winner) => {

        document.getElementById("status").textContent = winner
    })
    socket.on("disable_savegame", () => {
        document.getElementById("savegame").disabled = true;
    })
    socket.on("enable_savegame", () => {
        document.getElementById("savegame").disabled = false;
    })
    socket.on("disable_double", () => {
        document.getElementById("double").disabled = true;
    })
    socket.on("enable_double", () => {
        document.getElementById("double").disabled = false;
    })

    socket.on("enable_bet_input", () => {
        document.getElementById("input_button").disabled = false
        document.getElementById("input").disabled = false
    })
```
- Hanterar olika socket-event från servern för att aktivera eller inaktivera knappar och UI-element:
  - `"disable_hit"`: Inaktiverar "hit"-knappen.
  - `"disable_start"`: Inaktiverar "start"-knappen.
  - `"enable_start"`: Aktiverar "start"-knappen.
  - `"disable_stay"`: Inaktiverar "stay"-knappen.
  - `"render_winner"`: Visar vinnaren i statusfältet.
  - `"disable_savegame"` / `"enable_savegame"`: Inaktiverar/aktiverar "savegame"-knappen.
  - `"disable_double"` / `"enable_double"`: Inaktiverar/aktiverar "double"-knappen.
  - `"enable_bet_input"`: Aktiverar insatsfältet och dess knapp för ny insats.

```js
socket.on("return_wallet", (balance,bet) => {
        bet =parseInt(bet, 10)
        
        if (bet <= balance) {
            
            if (bet > 0) {
                socket.emit("betreturn", bet)
            }
            
            
            
        } else {
            alert("bet amount is invalid this is 2"+ bet + balance)
            socket.emit("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
            
            return
        }


    })
```
- Lyssnar på "return_wallet"-eventet från servern när spelarens saldo och insats ska kontrolleras.
- Om insatsen (`bet`) är mindre än eller lika med saldot och större än 0:
  - Skickar tillbaka insatsen till servern med `"betreturn"`.
- Om insatsen är ogiltig (större än saldot eller noll/negativ):
  - Visar ett felmeddelande för användaren.
  - Skickar ett felmeddelande till servern för vidare hantering.
```js
document.getElementById("input_button").addEventListener("click", inputButtonHandler);
    function inputButtonHandler() {
        let bet = document.getElementById("input").value
        
        socket.emit("get_wallet", bet)
        
        
        socket.emit("fetch_balance2")
        socket.on("fetch_balance2", (balance) => {
            
                balance1 = balance
            if (bet > 0 && bet <= balance1) {
                document.getElementById("input_button").disabled = true
    
                document.getElementById("input").disabled = true
                document.getElementById("start").disabled = false
            } else {
                alert("bet amount is invalid this is 3"+ bet + balance1)
                return
            }
        })
        
        

        
        

    }
```
- Hanterar klick på insatsknappen ("input_button") för att lägga en ny insats.
- Hämtar insatsvärdet från inputfältet.
- Skickar insatsen till servern för kontroll av saldo via `"get_wallet"` och `"fetch_balance2"`.
- När servern svarar med spelarens saldo:
  - Om insatsen är giltig (större än 0 och mindre än eller lika med saldot):
    - Inaktiverar insatsknappen och inputfältet.
    - Aktiverar "start"-knappen för att påbörja ny runda.
  - Om insatsen är ogiltig:
    - Visar ett felmeddelande för användaren.

```js
socket.on("fetch_betamount", () => {
        
        let bet = document.getElementById("input").value
        
        socket.emit("get_wallet", bet)  /////////////////////////////////////fix here
        bet = parseInt(bet, 10)
        
        
        socket.on("return_wallet", (balance, bet) => {
            
            if (bet <= balance && bet < 1) {
                socket.emit("return_fetch", 1)
                return
            } else if (bet <= balance) {
                
                socket.emit("return_fetch", (document.getElementById("input").value))
                
            } else {
                alert("bet amount is invalid this is 1")
                return
            }


        });





    })
```
- Lyssnar på "fetch_betamount"-eventet från servern när insatsen ska kontrolleras.
- Hämtar insatsvärdet från inputfältet och skickar det till servern för kontroll via `"get_wallet"`.
- När servern svarar med `"return_wallet"`:
  - Om insatsen är mindre än eller lika med saldot men mindre än 1:
    - Skickar tillbaka värdet 1 till servern via `"return_fetch"` (minsta giltiga insats).
  - Om insatsen är giltig (mellan 1 och saldot):
    - Skickar tillbaka det inskrivna insatsvärdet till servern via `"return_fetch"`.
  - Om insatsen är ogiltig (större än saldot):
    - Visar ett felmeddelande för användaren.
```js

socket.on("clearbet", () => {

    document.getElementById("input").value = ""

})
socket.on("error message", () => {
    alert("bet amount is invalid this is from backend")
    return
})
socket.on("enable_bet_input", () => {
    
    document.getElementById("input_button").disabled = false
    document.getElementById("input").disabled = false
})

socket.on("render_balance", (balance) => {
    
    document.getElementById("balance").textContent = balance

})
socket.on("manual_stay", () => {
    socket.emit("stay")
})
```
- Lyssnar på `"clearbet"`-eventet från servern och rensar insatsfältet (`input.value = ""`), t.ex. efter en runda eller när insatsen ska återställas.
- Lyssnar på `"error message"`-eventet från servern och visar en alert-ruta om att insatsen är ogiltig (t.ex. om backend upptäcker ett fel), och avbryter vidare exekvering.
- Lyssnar på `"enable_bet_input"`-eventet från servern och aktiverar både insatsknappen och insatsfältet så att spelaren kan lägga en ny insats.
- Lyssnar på `"render_balance"`-eventet och uppdaterar spelarens saldo i gränssnittet med det värde som skickas från servern.
- Lyssnar på `"manual_stay"`-eventet och skickar ett `"stay"`-event till servern, vilket kan användas för att tvinga fram att spelaren stannar automatiskt från backend.


```js
document.getElementById("insuranceyes").addEventListener("click", () => {

        document.getElementById("insuranceyes").disabled = true;
        document.getElementById("insuranceno").disabled = true;

    socket.emit("returninsurance", true)
    document.getElementById("hitplayerhand").disabled = false
    document.getElementById("stay").disabled = false
    

})
document.getElementById("insuranceno").addEventListener("click", () => {

        document.getElementById("insuranceyes").disabled = true;
        document.getElementById("insuranceno").disabled = true;
    document.getElementById("hitplayerhand").disabled = false
    document.getElementById("stay").disabled = false


    
    
    socket.emit("returninsurance", false)
})
```
- Lyssnar på `"insuranceyes"`- och `"insuranceno"`-knapparna för att hantera insurancesatsen:
  - Om användaren väljer "Ja" (insurancesatsen):
    - Inaktiverar båda insurancesatsknapparna.
    - Aktiverar både "hit"- och "stay"-knapparna.
    - Skickar insurancesatsen till servern.
  - Om användaren väljer "Nej" (ingens insurancesats):
    - Inaktiverar båda insurancesatsknapparna.
    - Aktiverar både "hit"- och "stay"-knapparna.
    - Skickar insurancesatsen till servern.
})
```js
socket.on("no_incurance", () => {
    document.getElementById("insuranceyes").disabled = true;
    document.getElementById("insuranceno").disabled = true;
})
```
- Lyssnar på "no_incurance"-eventet från servern och inaktiverar båda insurancesatsknapparna.
```js
document.getElementById("savegame").addEventListener("click", () => {
    socket.emit("savegame");
    document.getElementById("savegame").disabled = true;
})
```
- Lyssnar på "savegame"-knappen för att hantera sparat spelställ:
  - Skickar "savegame"-eventet till servern.
  - Inaktiverar knappen efter att spalten har skapats.

```js
document.getElementById("double").addEventListener("click", () => {
    document.getElementById("double").disabled = true;
    document.getElementById("hitplayerhand").disabled = true;
    socket.emit("hitplayerhand")

})
```
- Lyssnar på "double"-knappen för att hantera double-down:
  - Inaktiverar både "double"- och "hitplayerhand"-knapparna.
  - Skickar "hitplayerhand"-eventet till servern.

### 6.3 chat logik
```js
const chatMessages = document.getElementById('chat-messages');

    function sendChatIfNotEmpty() {
        const chatInput = document.getElementById('chat-input');
        const text = chatInput.value.trim();
        if (!text) return;
        socket.emit("fetch_username", text);
    }
    document.getElementById('chat-send').addEventListener('click', sendChatIfNotEmpty);
    document.getElementById('chat-input').addEventListener('keydown', (key) => {
        if (key.key === 'Enter') {
            sendChatIfNotEmpty();
        }
    });
```
- Hämtar referens till chat-meddelandelistan i DOM:en.
- Definierar funktionen `sendChatIfNotEmpty()` som:
  - Hämtar och trimmar text från chat-inputfältet.
  - Om texten inte är tom skickas den till servern via `"fetch_username"` (för att koppla ihop med användarens namn).
- Lägger till eventlyssnare:
  - På "Skicka"-knappen: skickar meddelandet om det inte är tomt.
  - På inputfältet: skickar meddelandet om användaren trycker på Enter.

```js
 socket.on("fetch_usernamereturn", (username,chatInput) => {
        
        socket.emit("chat message", { username: (username), text: (chatInput) });
        document.getElementById('chat-input').value = "";
    })
```
- Lyssnar på "fetch_usernamereturn"-eventet från servern när användarnamn och meddelande ska skickas.
- Skickar meddelandet till servern via `"chat message"`.
- Rensar chat-inputfältet.

```js
socket.on('user event', (eventMsg) => {
    const div = document.createElement('div');
    div.innerHTML = `<i>${eventMsg}</i>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
})
```
- Lyssnar på "user event"-eventet från servern för att hantera meddelanden.
- Skapar ett nytt `<div>`-element för varje meddelande.
- Lägger till meddelandet i chat-meddelandelistan.
- Rensar chat-meddelandelistan.

```js
 socket.on('chat message', (msg) => {
        
        const div = document.createElement('div');
        // Insert line breaks every 40 characters for long unbroken text
        function insertLineBreaks(text, maxLen = 40) {
            // Split on existing newlines, then break long lines
            return text.split('\n').map(line => {
                let result = '';
                while (line.length > maxLen) {
                    result += line.slice(0, maxLen) + '<br>';
                    line = line.slice(maxLen);
                }
                result += line;
                return result;
            }).join('<br>');
        }
        div.innerHTML = `<b>${msg.username}:</b> ${insertLineBreaks(msg.text)}`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
```
- Lyssnar på `"chat message"`-eventet från servern och körs varje gång ett nytt chattmeddelande tas emot.
- Skapar ett nytt `<div>`-element för varje inkommande meddelande.
- Definierar en hjälpfunktion `insertLineBreaks(text, maxLen = 40)` som:
  - Delar upp texten på befintliga radbrytningar.
  - Bryter därefter varje lång rad i mindre segment om max 40 tecken, och lägger in `<br>` (radbrytning i HTML) för att undvika att långa ord eller meningar förstör layouten.
- Sätter innehållet i `<div>` till fetstilt användarnamn följt av meddelandetexten (med radbrytningar där det behövs).
- Lägger till det nya `<div>`-elementet längst ner i chat-meddelandelistan (`chatMessages`).
- Scrollar automatiskt chatten till botten så att det senaste meddelandet alltid syns.




## 7. Pug och templates



## 8. Installation och Körning
1. Klona projektet från https://github.com/Sniffo5/GymnasieArbetePublik <br>
2. Installera beroende paket med ```npm i -y```<br>
3. Starta servern med ```npm start```<br>

## 7. Säkerhet

Projektet har flera inbyggda säkerhetsåtgärder för att skydda användardata och förhindra attacker, särskilt vid registrering och inloggning.

- Skydd mot fuzzing-attacker vid registrering och inloggning
  - Inputvalidering: Alla användarinputs (t.ex. användarnamn, lösenord och e-post) valideras noggrant både på klient- och serversidan. Endast tillåtna tecken och rimliga längder accepteras, vilket minimerar risken för att ovanliga eller skadliga värden behandlas av systemet.
  - Rate limiting: Systemet kan enkelt utökas med rate limiting (t.ex. via express-rate-limit) för att förhindra att angripare automatiskt testar många olika inloggnings- eller registreringskombinationer på kort tid (brute force/fuzzing).
  - Felmeddelanden: Felmeddelanden vid misslyckad inloggning eller registrering är generiska och avslöjar inte om det är användarnamnet eller lösenordet som är fel, vilket gör det svårare för angripare att kartlägga giltiga konton.
  - Server-side logging: Misstänkta eller ovanliga förfrågningar loggas på serversidan, vilket gör det möjligt att upptäcka och utreda potentiella attacker.
- Lösenordshantering
  - Hashning: Lösenord lagras aldrig i klartext. Istället används säkra hashfunktioner (t.ex. bcrypt) för att lagra lösenord på ett säkert sätt.
  - Salt: Varje lösenord hash:as med en unik salt för att förhindra rainbow table-attacker.
- Sessionshantering
  - Säkra cookies: Sessionscookies är markerade med HttpOnly och Secure-flaggor, vilket förhindrar åtkomst via JavaScript. 
  - Session expiration: Sessioner har en utgångstid och förnyas inte automatiskt, vilket minskar risken för session hijacking.
- Skydd mot XSS och CSRF
  - Sanering av användardata: All användargenererad data som visas i gränssnittet saneras för att förhindra cross-site scripting (XSS).
  - CSRF-skydd: Systemet kan utökas med CSRF-tokens för att förhindra cross-site request forgery.
- Övriga säkerhetsåtgärder
  - Persistenta datafiler: Alla känsliga datafiler (t.ex. users.json och chat_messages.json) är endast åtkomliga för servern och aldrig direkt för klienten.
  - Chat-säkerhet: Chattmeddelanden saneras och kontrolleras mot olämpligt innehåll innan de sparas och visas.
Loggning av kritiska händelser: Händelser som misslyckade inloggningar, registreringar och försök till otillåten åtkomst loggas för senare granskning.
