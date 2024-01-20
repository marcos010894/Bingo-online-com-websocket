const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const port = process.env.PORT || 3000;
const express = require("express");
const app = express();
var url = "https://escritorio.invictplanet.com/apibingo/";
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
var started_client = false;
let drawnNumbers = [];

var vencedorIs = false;
var vencedorIs2 = false;
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log(message)
    if (message == "Vencedor1") {
      vencedorIs = true;
    }
    if (message == "Vencedor2") {
      vencedorIs2 = true;
    }
    if (message == "EstartedTrue") {
      started_client = true;
    }
    if (message == "Um vencedor foi encontrado") {
      //reiniciar servidor
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
  if(drawnNumbers.length > 1){
    started_client = true;
  }
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          randomNumber: randomNumber,
          numbers: drawnNumbers,
          vencedorIs: vencedorIs,
          vencedorIs2: vencedorIs2,
          isStart: started_client,
        })
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
  started_client = false;
  vencedorIs = false;
  vencedorIs2 = false;
  // Inicia novamente o intervalo, se a lógica original exigir
  intervalId = setInterval(() => {
    if (drawnNumbers.length >= 90) {
      drawnNumbers = [];
      res.end();
    }
    drawNumber(wss, drawnNumbers);
  }, 5000);
}

var security = true
if (security == true) {
    var ws = new WebSocket('wss://bingoinvict-2a0239e0c8b7.herokuapp.com');
} else {
    var ws = new WebSocket('ws://localhost:3000');
}


function sendMsg() {
  ws.send('Olá, servidor!');
}

var quanty_start = "";

async function fetchDataQuanties() {
  try {
    const response = await fetch(url + "verifyQuantitysstart.php");
    const data = await response.json();
    quanty_start = data.quantidade_inicio;
    fetchData();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}



var intervaloParaIniciar = setInterval(function () {
  fetchDataQuanties()
}, 5000); // 1000 milissegundos = 1 segundo


async function fetchData() {
  if (started) return;
  try {
    const response = await fetch(url + "verifyQuantities.php");
    const data = await response.json();
    const faltando = Number(quanty_start) - Number(data.count);
    if (Number(data.count) >= Number(quanty_start)) {
      sendMsg()
      clearInterval(intervaloParaIniciar)
      console.log('intervalo encerrado')

    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
