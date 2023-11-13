const FPS = 60;
const CANVAS_WIDTH = window.innerWidth- 10;
const CANVAS_HEIGHT = window.innerHeight- 10;
const SHIP_SIZE = 30;
const SHIP_SPEED = 5;
const ASTEROID_NUM = 10;
const ASTEROID_SPEED = 75;
const ASTEROID_SIZE = 180;
const ASTEROID_MIN_SIZE = 40;
const SECONDS_UNTIL_NEW_ASTEROID = 5;
const RESTART_TIME = 3;

//definicija canvasa
var canvas = document.getElementById("gameCanvas")
var ctx = canvas.getContext("2d");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

var intervalId; //varijabla u kojoj ce biti spremljen id od setInterval funkije
var startTime = Date.now(); //trenutno vrijeme => potrebno za timer
var inc = SECONDS_UNTIL_NEW_ASTEROID //postavljanje varijable za inkrementiranje broja asteroida

//definicija broda
var ship = {
    x : canvas.width / 2, 
    y : canvas.height / 2,
    color : "red",
    size : SHIP_SIZE,
    speed_x : 0,
    speed_y : 0,
}

//crtanje igraca(broda)
function drawShip() {
    ctx.fillStyle = ship.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "red";  
    ctx.fillRect(ship.x, ship.y, ship.size, ship.size)
    ctx.stroke();
    ctx.shadowBlur = 0;
}

//dobivanje inputa iz tipkovnice
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

//funkcija za obradu pritiska tipke
function keyDown(event) {
    switch(event.keyCode) {
        case 37:    //left arrow key 
            ship.speed_x = -SHIP_SPEED;
            break;
        case 38:    //up arrow key 
            ship.speed_y = -SHIP_SPEED;
            break;
        case 39:    //right arrow key 
            ship.speed_x = SHIP_SPEED;
            break;
        case 40:    //down arrow key
            ship.speed_y = SHIP_SPEED;
            break;
    }
}
    
//funkcija za obradu otpustanja tipke
function keyUp(event) {
    switch(event.keyCode) {
        case 37:    //left arrow key 
            ship.speed_x = 0;
            break;
        case 38:    //up arrow key 
            ship.speed_y = 0;
            break;
        case 39:    //right arrow key 
            ship.speed_x = 0;
            break;
        case 40:    //down arrow key
            ship.speed_y = 0;
            break;
    }
}

//definicija asteroida
function asteroid(x, y, speed_x, speed_y, size) {
    this.x = x + canvas.width; //pocinje izvan canvasa
    this.y = y + canvas.height; //pocinje izvan canvasa
    this.speed_x = speed_x;
    this.speed_y = speed_y;
    this.size = size;
}

//kreiranje asteroida
var asteroids = [];
function createAsteroids(num) {
    for (var i = 0; i < num; i++) {
        asteroids.push(createAsteroid());
    }
}

//kreiranje nasumicnog asteroida
function createAsteroid() {
    var x = Math.floor(Math.random() * canvas.width);
    var y = Math.floor(Math.random() * canvas.height);
    size = Math.max(ASTEROID_SIZE * Math.random(), ASTEROID_MIN_SIZE);
    //random speed * 3 / FPS, ako < 0.5 ide u pozitivnom smjeru, inace u suprotnom, manji asteroidi su brzi
    speed_x = Math.random() * ASTEROID_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1) * (ASTEROID_SIZE / size); 
    speed_y = Math.random() * ASTEROID_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1) * (ASTEROID_SIZE / size);
    return new asteroid(x, y, speed_x, speed_y, size);    
}

function drawAsteroid(asteroid) {
    //kreiranje sivog gradijenta
    var grd = ctx.createLinearGradient(asteroid.x, asteroid.y, asteroid.x + asteroid.size / 2, asteroid.y );
    grd.addColorStop(0, "rgba(36, 36, 36, 1)");
    grd.addColorStop(0.33, "rgba(75, 75, 75, 1)");
    grd.addColorStop(0.66, "rgba(90, 90, 90, 1)");
    grd.addColorStop(1, "rgba(114, 114, 114, 1)");
    ctx.fillStyle = grd;
    //siva 3D sjena
    ctx.shadowBlur = 20;
    ctx.shadowColor = "gray";  
    //crtanje asteroida sa gradijentom i sjenom
    ctx.fillRect(asteroid.x, asteroid.y, asteroid.size, asteroid.size)
    ctx.stroke();
    ctx.shadowBlur = 0; 
}

function moveObject(object) {
    //kretanje objekta u 2D prostoru
    object.x += object.speed_x;
    object.y += object.speed_y;
}

function edgeCollisionDetection(object) {
    //detekcija za x koordinatu
    if (object.x < 0 - object.size / 2) {
        object.x = canvas.width + object.size / 2
    } else if (object.x > canvas.width + object.size / 2) {
        object.x = 0 - object.size / 2
    }

    //detekcija za y koordinatu
    if (object.y < 0 - object.size / 2) {
        object.y = canvas.height + object.size / 2
    } else if (object.y > canvas.height + object.size / 2) {
        object.y = 0 - object.size / 2
    }
}

function gameOver(elapsedTime) {
    var score = +localStorage.getItem("score");
    if(elapsedTime > score) {
        localStorage.setItem("score", elapsedTime)
    }
    //zaustavlja s crtanjem na canvas
    clearInterval(intervalId)
    //ispis game over
    ctx.fillStyle = "white"
    ctx.fillText("Game Over!", canvas.width/2- ship.size, canvas.height * 0.40)
    ctx.fillText("Game will restart in "+ RESTART_TIME +" seconds.", canvas.width/2 - ship.size - 80, canvas.height * 0.45)
    //restart igre za restart_time sekundi
    setTimeout(function(){
        newGame();
    }, RESTART_TIME * 1000);
}

function newGame() {
    //postavljanje broda u sredinu canvasa
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
    //kreiranje novih asteroida
    asteroids = [];
    createAsteroids(ASTEROID_NUM);
    //zapocinjanje timera i intervala
    startTime = Date.now()
    intervalId = setInterval(update, 1000 / FPS);
}

//dobivanje formatiranog ispisa npr. 01:24.923 (min:sec.ms)
function getTimeFromMs(miliseconds) {
    return pad(Math.floor(miliseconds / 60000),2) + ":"         //minute
    + pad(Math.floor((miliseconds % 60000) / 1000),2) + "." //sekunde
    + pad((miliseconds % 1000), 3);                         //milisekunde
}

//funkcija za dodavanje 0 ispred broja u timeru ako je potrebno
function pad(num, size) { 
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

newGame() //pozivanje funkcije za pokretanje nove igre

function update() {
    
    //funkcija za timer
    var elapsedTime = Date.now() - startTime; //vrijeme u milisekundama od pocetka
    var timer = getTimeFromMs(elapsedTime)
    
    //stvaranje novog asteroida svakih inc sekundi
    if((elapsedTime % 60000) / 1000 >= inc) {
        inc += SECONDS_UNTIL_NEW_ASTEROID;
        asteroids.push(createAsteroid());
    }

    //crtanje prostora
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    //display timera i best time-aa
    ctx.font = "20px Georgia";
    ctx.fillStyle = "white";
    ctx.fillText("Timer:", canvas.width - 150, canvas.height * 0.15);
    ctx.fillText(timer, canvas.width - 150, canvas.height * 0.18);
    //dobivanje best time
    if(!localStorage.getItem("score")) {
        localStorage.setItem("score", 0)
    }
    var storageScore = +localStorage.getItem("score")
    var bestTime = getTimeFromMs(storageScore)          
    //crtanje best time
    ctx.fillText("Best time:", canvas.width - 150, canvas.height * 0.06);
    ctx.fillText(bestTime, canvas.width - 150, canvas.height * 0.09);

    //crtanje broda
    drawShip();

    //kretanje broda
    moveObject(ship)

    //detektiranje kolizije s rubom canvasa
    edgeCollisionDetection(ship)

    //logika za asteroide
    for(var i = 0; i < asteroids.length; i++) {
        //crtanje asteroida: gradijent sive + siva 3D sjena
        drawAsteroid(asteroids[i]);

        //micanje asteroida
        moveObject(asteroids[i]);

        //kolizija asteroida s rubom canvasa
        edgeCollisionDetection(asteroids[i]);

        //detekcija kolizije broda s asteroidima
        if(ship.x + ship.size >= asteroids[i].x &&
            ship.x <= asteroids[i].x + asteroids[i].size &&
            ship.y + ship.size >= asteroids[i].y &&
            ship.y <= asteroids[i].y + asteroids[i].size) {
            gameOver(elapsedTime)
        }

    }

}