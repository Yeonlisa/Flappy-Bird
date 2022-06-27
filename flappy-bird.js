const score = document.querySelector(".score");
const startBtn = document.querySelector(".startBtn");
const gameArea = document.querySelector(".gameArea");
const gameMessage = document.querySelector(".gameMessage");
const title = document.querySelector(".title");

startBtn.addEventListener("click", start);
gameMessage.addEventListener("click", start);
document.addEventListener("keydown", pressOn);
document.addEventListener("keyup", pressOff);
let keys = {};
// 플레이어의 x좌표, y좌표, 스피드, 점수, 게임진행중여부
let player = {
    x:0,
    y:0,
    speed:2,
    score:0,
    inplay: false
};
// 장애물
let pipe = {
    startPos: 0,
    spaceBetweenRow : 0,
    spaceBetweenCol : 0,
    pipeCount: 0
}


// 브라우저에서 애니메이션을 부드럽게 움직이게 한다
function start() {
    // 게임진행중여부는 true, score는 0으로 초기화해놓는다
    player.inplay = true;
    player.score = 0;
    gameArea.innerHTML = "";
    // start 버튼을 누르면 제목, 게임메시지와 버튼자체가 사라진다
    gameMessage.classList.add("hide");
    startBtn.classList.add("hide");
    title.classList.add("hide");
    // bird와 wing을 생성한다
    let bird = document.createElement("div");
    let wing = document.createElement("div");
    bird.setAttribute("class", "bird");
    wing.setAttribute("class", "wing");
    wing.pos = 15;
    wing.style.top = `${wing.pos}px`;
    // bird안에 wing, gameArea 안에 bird가 나타나게 한다
    bird.appendChild(wing);
    gameArea.appendChild(bird);
    player.x = bird.offsetLeft;
    player.y = bird.offsetTop;

    pipe.startPos = 0;
    pipe.spaceBetweenRow = 400;
    // 화면에 너비에 따라 생성되는 pipe개수가 달라진다
    pipe.pipeCount = Math.floor(gameArea.offsetWidth / pipe.spaceBetweenRow);

    for(let i = 0; i < pipe.pipeCount; i++) {
        makePipe(pipe.startPos * pipe.spaceBetweenRow);
        pipe.startPos++;
    }
    window.requestAnimationFrame(playGame);
}

// 장애물생성함수
function makePipe(pipePos) {
    let totalHeight = gameArea.offsetHeight;
    let totalWidth = gameArea.offsetWidth;
    // 위쪽 파이프
    let pipeUp = document.createElement("div");
    pipeUp.classList.add("pipe");
    pipeUp.height = Math.floor(Math.random() * 350);
    pipeUp.style.height = `${pipeUp.height}px`;
    pipeUp.style.left = `${totalWidth + pipePos}px`;
    pipeUp.x = totalWidth + pipePos;
    pipeUp.style.top = "0px";
    pipeUp.style.backgroundColor = "#ffeb26";
    gameArea.appendChild(pipeUp);

    pipe.spaceBetweenCol = Math.floor(Math.random() * 250) + 150;

    // 아래쪽 파이프
    let pipeDown = document.createElement("div");
    pipeDown.classList.add("pipe");
    pipeDown.style.height = `${totalHeight - pipeUp.height - pipe.spaceBetweenCol}px`;
    pipeDown.style.left = `${totalWidth + pipePos}px`;
    pipeDown.x = totalWidth + pipePos;
    pipeDown.style.bottom = "0px";
    pipeDown.style.backgroundColor = "#5447a3";
    gameArea.appendChild(pipeDown);
}

// pipe 움직이는 함수
function movePipes(bird) {
    let pipes = document.querySelectorAll(".pipe");
    // 삭제된 파이프개수를 저장하는 역할을한다
    let counter = 0;
    pipes.forEach((item) => {
        item.x -= player.speed;
        item.style.left = `${item.x}px`;
        if(item.x < 0) {
            item.parentElement.removeChild(item);
            counter++;
        }
        // pipe와 새의 충돌여부감지
        if(isCollide(item, bird)) {
            playGameOver(bird);
        }
    });


    for(let i = 0; i < counter/2; i++) {
        makePipe(0);
    }
}

// 충돌여부함수
function isCollide(pipe, bird) {
    let pipeRect = pipe.getBoundingClientRect();
    let birdRect = bird.getBoundingClientRect();
    return(
        pipeRect.bottom > birdRect.top &&
        pipeRect.top < birdRect.bottom &&
        pipeRect.left < birdRect.right &&
        pipeRect.right > birdRect.left
    );
}

// 애니메이션 작동함수
function playGame() {
    if(player.inplay) {
        let bird = document.querySelector(".bird");
        let wing = document.querySelector(".wing");
        movePipes(bird);
        // bird가 방향키대로 움직인다
        // 브라우저 공간 내에서만 이동을 한정했다
        let move = false;
        if(keys.ArrowLeft && player.x > 0) {
            player.x -= player.speed;
            move = true;
        }
        if(keys.ArrowRight && player.x < gameArea.offsetWidth - bird.offsetWidth) {
            player.x += player.speed;
            move = true;
        }
        if((keys.ArrowUp || keys.Space) && player.y > 0) {
            player.y -= player.speed * 4;
            move = true;
        }
        if(keys.ArrowDown && player.y < gameArea.offsetHeight - bird.offsetHeight) {
            player.y += player.speed;
            move = true;
        }
        
        // bird의 날개짓을 구현했다
        if(move) {
            wing.pos = wing.pos === 15 ? 25 : 15;
            wing.style.top = `${wing.pos}px`;
        }

        // 중력구현
        player.y += player.speed * 2;
        // 아래로 떨어져서 화면에 안보이면 게임종료나면서 점수책정중단
        if(player.y > gameArea.offsetHeight) {
            playGameOver(bird);
        }
        bird.style.left = `${player.x}px`;
        bird.style.top = `${player.y}px`;
        window.requestAnimationFrame(playGame);
        player.score++;
        score.innerText = `SCORE : ${player.score}`;   
    }
}

// 키보드 인식함수
function pressOn(e) {
    keys[e.code] = true;
}

function pressOff(e) {
    keys[e.code] = false;
}

// 게임오버함수
function playGameOver(bird) {
    player.inplay = false;
    gameMessage.classList.remove("hide");
    gameMessage.innerHTML = `GAME OVER!<br/>당신의 점수는 ${player.score}점 입니다.<br/>다시
    시작하려면 여기를 누르세요.`;
    // bird가 pipe와 충돌하면 180도 뒤집히는 액션이 된다
    bird.setAttribute("style", "transform: rotate(180deg)");
}