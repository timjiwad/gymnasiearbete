
function getusers() {
    return JSON.parse(require("fs").readFileSync("users.json").toString())
}
function createlogin(login){
    let logins = getusers()
    logins.push(login);
    savelogin(logins);
}
function savelogin(login){
    require("fs").writeFileSync("users.json",JSON.stringify(login,null,2))
    return true;
}

function getpost() {
    return JSON.parse(require("fs").readFileSync("posts.json").toString())
}
function createpost(login){
    let logins = getpost()
    logins.push(login);
    savepost(logins);
}
function savepost(login){
    require("fs").writeFileSync("posts.json",JSON.stringify(login,null,3))
    return true;
}

module.exports={createlogin,createpost}