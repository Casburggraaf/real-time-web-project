(function () {
  "use strict";

  const app = {
    socket: io(),
    tableItems: document.querySelectorAll("td"),
    init() {
      sockets.capture();

      document.querySelectorAll("header a").forEach((el) => {
        el.addEventListener("click", () => {
          game.player = el.innerHTML;
          game.turn = true;
        });
      });

      this.tableItems.forEach((el, index) => {
        el.addEventListener("click", () => {
          game.move(index)
        });
      });
    }
  }

  const game = {
    score: new Array(9).fill(null),
    player: null,
    turn: true,
    move(index) {
      if (this.turn) {
        game.score[index] = this.player;
        this.setColor();
        sockets.send()
        this.turn = !this.turn;
        this.checkWin();
      }
    },
    // checkWin() {
    //   if((game.score[0] === this.player && game.score[1] === this.player && game.score[2] === this.player) || (game.score[3] === this.player && game.score[4] === this.player && game.score[5] === this.player) || (game.score[6] === this.player && game.score[7] === this.player && game.score[8] === this.player) || (game.score[0] === this.player && game.score[4] === this.player && game.score[8] === this.player) || (game.score[2] === this.player && game.score[4] === this.player && game.score[6] === this.player)) {
    //     alert("WHPOOOOPPP")
    //   } else {
    //     return false;
    //   }
    // },
    setColor() {
      this.score.forEach((el, index) => {
        app.tableItems[index].style.background = el;
      });
    }
  };

  const sockets = {
    send(e) {
      app.socket.emit('set', {
        score: game.score,
        user: game.player
      });
    },
    capture() {
      app.socket.on('game', function(score){
        game.score = score.score;
        game.setColor();
        // if (score.user !== game.player && (score.user === "Green" || score.user == "Yellow")) {
        //   game.turn = true;
        // }
      });

      app.socket.on("intro", function(data){
        let intro = document.querySelector("#intro");
        console.log(intro);
        if(data.status === false){
          intro.classList.add("hide");
        } else {
          intro.querySelector("#users span").innerHTML = data.amountPlayers;
          intro.querySelector("#gameId").innerHTML = data.gameId;
          let time = data.countdown
          let coutndown = setInterval(function(){
            time--;
            intro.querySelector("#waitingTime span").innerHTML = time;
            if(time <= 0){
              clearInterval(coutndown);
            }
          },1000);
        }
      });

      app.socket.on("poll", function(data){
        let spans = document.querySelectorAll("table span");

        if(spans[data.number].innerHTML !== "") {
          let tempScore = spans[data.number].innerHTML;
          tempScore = parseInt(tempScore) + 1;
          spans[data.number].innerHTML = tempScore;
        } else {
          spans[data.number].innerHTML = 1;
        }
        spans[data.number].style.color = data.player;
      });

      app.socket.on("resetPoll", function(data){
        let spans = document.querySelectorAll("table span");
        spans.forEach((el) => {
          el.innerHTML = "";
        });
      });
    }
  };

  app.init()
})();
