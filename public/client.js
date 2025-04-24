
const socket = io();
let time = 60
let count = time;
let timer;
let balance1 = 0;
document.addEventListener("DOMContentLoaded", () => {

    socket.on("init", client_init);

    function client_init(msg) {
        
    }
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

    function executeWhenTimerEnds() {
        document.getElementById("hitplayerhand").disabled = true;
        document.getElementById("stay").disabled = true;
        socket.emit("stay")
        document.getElementById("insuranceyes").disabled = true;
        document.getElementById("insuranceno").disabled = true;

    }
  
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


    const chatMessages = document.getElementById('chat-messages');

    function sendChatIfNotEmpty() {
        const chatInput = document.getElementById('chat-input');
        const text = chatInput.value.trim();
        if (!text) return;
        socket.emit("fetch_username", text);
    }
    document.getElementById('chat-send').addEventListener('click', sendChatIfNotEmpty);
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendChatIfNotEmpty();
        }
    });

    socket.on("fetch_usernamereturn", (username,chatInput) => {
        
        socket.emit("chat message", { username: (username), text: (chatInput) });
        document.getElementById('chat-input').value = "";
    })
    socket.on('user event', (eventMsg) => {
        const div = document.createElement('div');
        div.innerHTML = `<i>${eventMsg}</i>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
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

})


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
socket.on("no_incurance", () => {
    document.getElementById("insuranceyes").disabled = true;
    document.getElementById("insuranceno").disabled = true;
})

document.getElementById("savegame").addEventListener("click", () => {
    socket.emit("savegame");
    document.getElementById("savegame").disabled = true;
})

document.getElementById("double").addEventListener("click", () => {
    document.getElementById("double").disabled = true;
    document.getElementById("hitplayerhand").disabled = true;
    socket.emit("hitplayerhand")

})






    