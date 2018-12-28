//canvas principal usado para o jogo
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext("2d");

//canvas secundário utilizado para ir desenhando os corações que representam as vidas
var lifecanvas = document.getElementById('lifecanvas');
var ltx = lifecanvas.getContext("2d");

// booleans para as teclas
var rightPressed =false;
var leftPressed =false;
var upPressed = false;
var downPressed = false;

//variaveis necessárias para o UI e funcionamento basico do jogo
var Score=0;
var warriorvidas=3;
var paused=false;
var timecounter=0;

// carregamento do background do jogo
var bgReady= false;
var bgImage= new Image();
bgImage.onload = function(){
    bgReady = true;
};
bgImage.src ="assets/BG/grass.gif";

// variaveis globais para a criação das plataformas
var nLplataformas=4;
var widthLplataformas = 500;
var heightLplataformas = 32;
var espacamentoLplataformas = 200;

// Array que contem as imagens das plataformas
Lplataformas=[];

// verificação se as plataformas tão todas carregadas
var PlataformasReady =0;
for(x=0;x<nLplataformas;x++){
    Lplataformas[x] = new Image();
    Lplataformas[x].onload = function() {
    PlataformasReady++;         
};
    Lplataformas[x].src = "assets/plata/stoneplata.png";
}

//verificação do carregamento dos corações para o canvas secundário
vidas =[];
var vidasready=0;

for(l=0;l<warriorvidas;l++){
    vidas[l] = new Image();
    vidas[l].onload = function() {
        vidasready++;      
    };
    vidas[l].src ="assets/heart/heart.png"
}

//objecto demon que contem as propriedades necessárias e algumas que não chegaram a ser implementadas
var demon = {left:false, moving:false, speed:3, x: 400, y:560, deadcounter:0, dead:false,height:30,width:30}
var demonReady = false;
var demonImage = new Image();
demonImage.onload = function(){
    demonReady=true;
}

// objecto warrior, avatar do jogador, todas as propriedades foram implementadas em mecânicas de jogo
var warrior= {left:false, moving:false, speed:100, x: 20, y:560 ,
     jumping:false, grounded:false, 
     aceleracaoY:0,height:30,width:30};
var warriorReady= false;
var warriorImage= new Image();
warriorImage.onload = function(){
    warriorReady = true;
};

// carregamento dos sons para feedback ao marcar pontos e ao perder vidas
var pain = new Audio("assets/sounds/pain.mp3");
var ding = new Audio("assets/sounds/ding.mp3");

// objecto tesouro, que vai conceder pontos ao colidir com o jogador(warrior)
var treasure ={x:0,y:0,width:20,height:16,spawned:false};
var treasureReady=false;
var treasureImage =new Image();
treasureImage.onload = function(){
    treasureReady=true;
};

//variaveis necessárias ao motor de gravidade
var gravity=5;
var floored=false;

// variaveis para o slicer que irá cortar o spritesheet para animações
var sliceX=0;
var sliceY=0;

/* medidas para serem corridas no slicer e para alternar frames. Uso estas medidas para ambos os objectos animados.
apesar de ter problemas obvios consegui contorna-los ao criar o spritesheet do demonio o mais compativel possivel.*/
var WIspriteWidth = 120;
var WIspriteHeight = 40; 
var WIspritecount =4;
var Frame=0;
var tick=0;

//contador para o relógio de jogo
var counter=0;

// Escolhemos a sprite sheet, conforme o estado do objecto, e de cinco em cinco ticks corta um frame do spritesheet e apresenta-o
function updateFrame(SpriteWidth,SpriteHeight,Spritecount){

    treasureImage.src="assets/treasure/treasure.png";

    //conforme o objecto esta a se mover ou a virar para um lado ou para ou outro
    if(!warrior.moving) {
        if(warrior.left) warriorImage.src="assets/warrior/lidlesheet.png";
       else warriorImage.src="assets/warrior/idlesheet.png";
      
    }
    else{ if(warrior.left) warriorImage.src="assets/warrior/lrunsheet.png";
    else warriorImage.src="assets/warrior/runsheet.png";
    
}

    if(!demon.moving) {
        if(demon.left) demonImage.src="assets/demon/lidledemon.png";
        else demonImage.src="assets/demon/idledemon.png";
    }
    else{ if(demon.left) demonImage.src="assets/demon/ldemonrun.png";
    else demonImage.src="assets/demon/demonrun.png";
    }
    tick++;

    //selecionar frames
    if(tick>5){
    Frame = ++ Frame % (Spritecount);

    sliceX = Frame*(SpriteWidth/Spritecount);
    tick=0;
    }

}

// "Inteligencia Artificial" do demonio. O demonio persegue o jogador se este estiver à altura dele+desvio, caso contrário
// após um certo intervalo saí do canvas e volta a reaparecer à altura do jogador, assim que este pousar no chão
function demonAi(){
    if(!demon.dead){
        counter++;
        if(warrior.y+30>demon.y && warrior.y-30< demon.y+demon.height && warrior.x<demon.x){
            demon.x-=demon.speed;
            demon.moving=true;
            demon.left=true;
            counter=0;
        }
        else if(warrior.y+30>demon.y && warrior.y-30< demon.y+demon.height && warrior.x>demon.x)
        {demon.x+=demon.speed;
            demon.moving=true;
            demon.left=false;
            counter=0;
        }
        else demon.moving=false;

    if(counter>150){
        if(demon.x>=canvas.width/2)
        {
            demon.moving=true;
            demon.left=false;
            demon.x+=demon.speed;
        }
        else if(demon.x<canvas.width/2)
        {
            demon.moving=true;
            demon.left=true;
            demon.x-=demon.speed;
        }
      if((demon.x<-80 || demon.x>600) && (warrior.grounded))
      {
          demon.y=warrior.y;
          demon.speed+=2;
      }
    }

    }
}

// event listeners para o input do jogador
document.addEventListener("keydown", TeclasCarregadas, false);
document.addEventListener("keyup", TeclasLargadas, false);

// função que simula a gravidade ao dar aceleração ao jogador quando este não está no chão
function gravidade(){
if(!warrior.grounded) warrior.aceleracaoY += gravity;
else warrior.aceleracaoY=0;
}

//modificar os booleas de input conforme as teclas são carregadas ou largadas
function TeclasCarregadas(e){
    if(e.keyCode == 68) {
                rightPressed = true;
    }
    else if(e.keyCode == 65) {
                leftPressed = true;
    }
    else if(e.keyCode==87){
        upPressed =true;
    }
    else if(e.keyCode==83){
        downPressed =true;
    }
};

function TeclasLargadas(e){

    if(e.keyCode == 68) {
            rightPressed = false;
                
    }
    else if(e.keyCode == 65) {
                leftPressed = false;

    }else if(e.keyCode==87){
        upPressed =false;
    }
    else if(e.keyCode==83){
        downPressed =false;
    }
};

// funcção que permite o controlo de warrior
function controlwarrior(mod){

    //a funcção recebe o mod para que as acções ocorram ao mesmo passo que a main, reduzindo descrepancia de frames por segundo
    warrior.y += warrior.aceleracaoY*mod;

    if(rightPressed && warrior.x+warrior.width<canvas.width) {
            warrior.x +=   warrior.speed*mod;
            warrior.left=false;
                
    }
    else if(leftPressed && warrior.x>0) {
            warrior.x -=  warrior.speed*mod;
            warrior.left=true;
                
    }
    if(upPressed && warrior.grounded) {
        warrior.jumping=true;
        warrior.grounded=false;
        warrior.y -= 5;
        warrior.aceleracaoY = -350;
    }
    else if(downPressed && warrior.grounded && !floored){
        warrior.jumping=true;
        warrior.grounded=false;
        warrior.y += heightLplataformas+6;
    }
                
    //estado alterado em caso o objecto esteja a se mover ou não
    if(rightPressed || leftPressed) {
        warrior.moving=true;
        
    }
    else if(!rightPressed && !leftPressed){
        warrior.moving =false;
    }
};

//esta funcção contem a maioria das mecânicas de jogo, pois é ela que permite interacção entre objectos
function collisionDetection() {
    //tornar as plataformas solidas para o jogador, assim como limitar a queda para fora do canvas
    for(i=0;i<nLplataformas;i++){
        if ((warrior.x > canvas.width-widthLplataformas &&
             warrior.x < canvas.width && 
             warrior.y+warrior.height+9 > heightLplataformas+espacamentoLplataformas*(i) && 
             warrior.y < heightLplataformas+espacamentoLplataformas*(i)) && (warrior.aceleracaoY>0))
            { 
             warrior.grounded=true;
            }
    if(warrior.y >= canvas.height-WIspriteHeight-0){
                    warrior.grounded=true;
                    floored=true;
    }
    else floored =false;
    }

    //demonio ao colidir com o jogador é tocado um som, perdemos uma vida, o demonio fica mais lento e o jogador é projectado conforme a direcção
    if (warrior.x < demon.x+demon.width &&
        warrior.x+warrior.width > demon.x && 
        warrior.y < demon.y+demon.height && 
        warrior.y+warrior.height > demon.y)
        {
            
            warriorvidas--;
            demon.speed*=0.5;
            pain.play();
            console.log("BITE!"+warriorvidas);
            if(demon.left){
            demon.x+=demon.width;
            warrior.x-=demon.width;
            }
            else{
            demon.x-=demon.width;
            warrior.x+=demon.width;
            }
        }

    //ao apanharmos o tesouro recebemos pontos e pedimos uma nova posição para o mesmo
        if (warrior.x < treasure.x+treasure.width &&
            warrior.x+warrior.width > treasure.x && 
            warrior.y < treasure.y+treasure.height && 
            warrior.y+warrior.height > treasure.y){
            ding.play();
            Score +=10;
            treasure.spawned=false;
            }
}

// isto irá ficar dentro da funcção de desenho/render. Espera que tejam as plataformas prontas para depois as desenhar
function renderPlataformas(){
    if(PlataformasReady>=nLplataformas){
        for(i=0;i<nLplataformas;i++){
            ctx.drawImage(Lplataformas[i], canvas.width-widthLplataformas,heightLplataformas+espacamentoLplataformas*(i));
                         
        }
    }
    }

// desenha os corações no segundo canvas. Dentro do render.
function renderVidas(){
if(vidasready>=warriorvidas){
        for(i=0;i<warriorvidas;i++){
            ltx.drawImage(vidas[i],i*30+5,0);
        }
    }
    }

// funcionalidade para o posicionamento e reposicionamento aleatório dos tesouros e posteriormente para o desenho dos mesmos
function criaTreasures(){
    if(treasureReady){
    if(!treasure.spawned){
        var select= Math.floor((Math.random() * 3) + 1);
        var placer= Math.floor((Math.random() * 490) + 1);  
        //colocado numa das 3 plataformas com x entre 1 e 490
        switch(select){
            case 1:
            
             treasure.x=placer;
             treasure.y=16;
             break;
             case 2:
             treasure.x=placer;
             treasure.y=216;
             break;
             case 3:
             treasure.x=placer;
             treasure.y=416;
             break;
        }
        treasure.spawned=true;
    }
    ctx.drawImage(treasureImage,treasure.x,treasure.y);
}
}

//desenha tudo ao passo da main.
var render = function () {
    // limpeza de ambos os canvas antes de cada frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ltx.clearRect(0, 0, canvas.width, canvas.height);
    // animações
    updateFrame(WIspriteWidth,WIspriteHeight,WIspritecount);
    
    //só tenta desenhar as imagens após estas estarem carregadas.
	if (bgReady) {
        ctx.drawImage(bgImage,  0, 0, bgImage.width,bgImage.height,0, 0, canvas.width, canvas.height);
    }

    if  (warriorReady) {
            ctx.drawImage(warriorImage, sliceX,  sliceY, WIspriteWidth/WIspritecount, 40, warrior.x,warrior.y, WIspriteWidth/WIspritecount, 40);
    }
    if(demonReady)
    {
        ctx.drawImage(demonImage,sliceX,sliceY, WIspriteWidth/WIspritecount, 40, demon.x, demon.y, WIspriteWidth/WIspritecount,40);
    }

    criaTreasures();
    //desenho de arrays de imagens em funcções separadas
    renderPlataformas();
    renderVidas();  
}
//update dos UI e das cookies
function gamecontrol(){
    updatePontos();
    if(warriorvidas<=0){
    checkCookie();
     location.reload();
    }
}

// colocado no botão restart, faz refresh da pagina
function restart(){location.reload()}

// para ou não a logica do jogo(update)
function pausar(){
        paused = true;
}
function jogar(){
    paused= false;
}

//contador de tempo.
var secs=0;
var mins=0;
 var horas=0;
function timer(){
    if(!paused){
        timecounter++;
    }
    if(timecounter>60){secs++;timecounter=0;}
    if(secs>60){mins++;secs=0;}
    if(mins>60){horas++};
    relogio= document.getElementById("clock");
    relogio.textContent=(""+horas+" : "+mins+" : "+secs);
}

//envio do score para o UI em HTML
function updateScore(){
    pontos = document.getElementById("score");
    pontos.textContent=(" "+Score);
}

//guardar os pontos numa cookie
function updatePontos(){
    leitor = document.getElementById("pontos");
    cooker = getCookie("score")
    leitor.value=(""+cooker)
}

//criação, decodificação e leitor de cookies. utilizadas para o guardar a melhor pontuação efectuada
function setCookie(Cookiename, Cookievalue, exdays){
    var d= new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = Cookiename + "=" + Cookievalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
//o leitor de cookies é chamado ao perdermos o jogo. cria cookie se não tiver uma e depois faz update dessa se a nossa pontuação for melhor
  function checkCookie() {
    var valor=getCookie("score");
    if (valor != "") {
        if(valor>Score)alert("O seu best score foi de: " + valor);
        else {
            alert("Novo best Score " + Score);
            valor=Score;
            setCookie("score", valor, 30);
        }
      
    } else {
       alert("Game Over. A sua pontuação foi de "+Score);
            valor= Score;
            setCookie("score", valor, 30);
       }
    }

    //funcção com todo o valor lógico do jogo
function update(mod){
    controlwarrior(mod);
    collisionDetection();
    gravidade();
    demonAi();
    gamecontrol();
    
}

    // loop de jogo, funcção principal. lógica para reduzir as variações de intereracções/frames por segundo
 function main() {
	var present = Date.now();
	var regulaframes = present - past;
    if(!paused)update(regulaframes / 1000);
    render();
    timer();
    updateScore();

	past = present;

	requestAnimationFrame(main);
};

//inicialização do jogo.
var past = Date.now();
main();