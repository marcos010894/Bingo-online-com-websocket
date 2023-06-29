const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  fs.readFile("index.html", (err, data) => {
    if (err) {
      console.log(err);
      res.end();
    } else {
      res.end(data);
    }
  });
});

const wss = new WebSocket.Server({ server });
let started = false;
let drawnNumbers = [];

wss.on("connection", (ws) => {
  console.log("Cliente conectado");

  ws.on("message", (message) => {
    if (!started) {
      started = true;
      setInterval(() => {
        if (drawnNumbers.length >= 90) {
          drawnNumbers = [];
          started = false;
        }
        drawNumber(wss, drawnNumbers);
      }, 5000); // Sorteia um número a cada 5 segundos
    }
  });

  ws.send("Bem-vindo ao Bingo online!");
});

function drawNumber(wss, drawnNumbers) {
  const availableNumbers = [...Array(90).keys()]
    .map((n) => n + 1)
    .filter((n) => !drawnNumbers.includes(n));

  const randomNumber =
    availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

  drawnNumbers.push(randomNumber);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({ randomNumber: randomNumber, numbers: drawnNumbers })
      );
    }
  });

  return randomNumber;
}

server.listen(8000);
