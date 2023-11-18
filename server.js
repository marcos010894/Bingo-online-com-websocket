const WebSocket = require("ws");
const https = require("https");
const fs = require("fs");
const express = require("express");
const app = express();

const port = process.env.PORT || 3000;

// Carregue o conteúdo estático
app.use(express.static("public"));

// Rota padrão para carregar o HTML
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Configuração do servidor HTTPS
const server = https.createServer(
  {
    cert: fs.readFileSync("caminho-para-seu-certificado.pem"),
    key: fs.readFileSync("caminho-para-sua-chave-privada.pem"),
  },
  app
);

const wss = new WebSocket.Server({ server });

let started = false;
let drawnNumbers = [];

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    if (!started) {
      started = true;
      setInterval(() => {
        if (drawnNumbers.length >= 90) {
          drawnNumbers = [];
          // res.end(); // Remova esta linha, pois res não está definido aqui
        }
        drawNumber(wss, drawnNumbers);
      }, 5000); // Sorteia um número a cada 5 segundos
    } else {
      restartServer();
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

function restartServer() {
  clearInterval(intervalId); // Limpa o intervalo existente

  // Reinicializa as variáveis e lógica necessárias
  started = false;
  drawnNumbers = [];

  // Inicia novamente o intervalo, se a lógica original exigir
  intervalId = setInterval(() => {
    if (drawnNumbers.length >= 90) {
      drawnNumbers = [];
      // res.end(); // Remova esta linha, pois res não está definido aqui
    }
    drawNumber(wss, drawnNumbers);
  }, 5000);
}

server.listen(port, () => {
  console.log(`Servidor HTTPS/WSS iniciado na porta ${port}`);
});
