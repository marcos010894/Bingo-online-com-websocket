const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const port = process.env.PORT || 3000;
const express = require("express");
const app = express();
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
  ws.on("message", (message) => {
    if(message == 'Um vencedor foi encontrado'){
      restartServer()
    }
    if (!started) {
      started = true;
      const intervalId = setInterval(() => {
        if (drawnNumbers.length >= 90) {
          drawnNumbers = [];
          res.end();
        }
        drawNumber(wss, drawnNumbers);
      }, 5000); // Sorteia um número a cada 5 segundos
    }
  });
});


async function drawNumber(wss, drawnNumbers) {
  const availableNumbers = [...Array(90).keys()]
    .map((n) => n + 1)
    .filter((n) => !drawnNumbers.includes(n));

  const randomNumber =
    availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

  await drawnNumbers.push(randomNumber);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({ randomNumber: randomNumber, numbers: drawnNumbers })
      );
    }
  });

  return randomNumber;
}

server.listen(port);





function restartServer() {
  clearInterval(intervalId); // Limpa o intervalo existente

  // Reinicializa as variáveis e lógica necessárias
  started = false;
  drawnNumbers = [];
  // Inicia novamente o intervalo, se a lógica original exigir
  intervalId = setInterval(() => {
    if (drawnNumbers.length >= 90) {
      drawnNumbers = [];
      res.end();
    }
    drawNumber(wss, drawnNumbers);
  }, 5000);
}