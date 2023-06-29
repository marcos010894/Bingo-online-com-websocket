const bingoCards = document.getElementById("bingoCards");
const lastNumbers = document.getElementById("lastNumbers");
const allNumbers = document.getElementById("allNumbers");
const bigNumber = document.getElementById("bigNumber");
var vencedor1 = false;
var vencedor2 = false;
var vencedor3 = false;
let interval;
var ids = [];
var url = 'http://localhost/apibingo/'
function createBingoCard(numbers) {
  const card = document.createElement("div");
  card.className = "bingo-card";
  numbers.forEach((number) => {
    const cell = document.createElement("div");
    cell.className = "bingo-cell";
    cell.textContent = number;
    card.appendChild(cell);
  });
  return card;
}

function generateBingoNumbers() {
  const numbers = [...Array(90).keys()].map((n) => n + 1);
  return numbers.sort(() => Math.random() - 0.5).slice(0, 15);
}

function createBingoCards(n) {
  for (let i = 0; i < n; i++) {
    const cardNumbers = generateBingoNumbers();
    const card = createBingoCard(cardNumbers);
    bingoCards.appendChild(card);
  }
}

function createAllNumbers() {
  for (let i = 1; i <= 90; i++) {
    const number = document.createElement("div");
    number.className = "number";
    number.textContent = i;
    allNumbers.appendChild(number);
  }
}

async function saveBingoCard(idUsuario, nomeUsuario, numerosCartela) {
  const data = {
    id_usuario: idUsuario,
    nome_usuario: nomeUsuario,
    cartela: numerosCartela,
    data_compra: new Date().toISOString().slice(0, 10),
  };

  try {
    // Substitua a URL pelo endereço da sua API.
    const response = await fetch(url+"https://sua-api.com/salvar_cartela", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
    } else {
      console.error("Erro ao salvar cartela:", response.statusText);
    }
  } catch (error) {
    console.error("Erro ao salvar cartela:", error);
  }
}

function updateLastDrawnNumbers() {
  const numberantigoone = document.getElementById("numberantigoone");
  const numberantigotwo = document.getElementById("numberantigotwo");
  const numberantigothree = document.getElementById("numberantigothree");
  const numberantigofour = document.getElementById("numberantigofour");

  const lastIndex = drawnNumbers.length - 1;

  if (drawnNumbers.length >= 4) {
    numberantigoone.textContent = drawnNumbers[lastIndex - 3];
    numberantigotwo.textContent = drawnNumbers[lastIndex - 2];
    numberantigothree.textContent = drawnNumbers[lastIndex - 1];
    numberantigofour.textContent = drawnNumbers[lastIndex];
  } else if (drawnNumbers.length === 3) {
    numberantigoone.textContent = drawnNumbers[lastIndex - 2];
    numberantigotwo.textContent = drawnNumbers[lastIndex - 1];
    numberantigothree.textContent = drawnNumbers[lastIndex];
  } else if (drawnNumbers.length === 2) {
    numberantigotwo.textContent = drawnNumbers[lastIndex - 1];
    numberantigothree.textContent = drawnNumbers[lastIndex];
  } else if (drawnNumbers.length === 1) {
    numberantigothree.textContent = drawnNumbers[lastIndex];
  }
}

function drawNumber() {
  if (vencedor3) {
    document.getElementById("modalAguardandoencerrado").style.display = "flex";


    return;
  }
  const availableNumbers = [...Array(90).keys()]
    .map((n) => n + 1)
    .filter((n) => !drawnNumbers.includes(n));
  const randomNumber =
    availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

  if (randomNumber) {
    drawnNumbers.push(randomNumber);
    lastNumbers.innerHTML =
      `<li>${randomNumber}</li>` +
      lastNumbers.innerHTML.slice(0, 2 * 2 * 3 - 1);

    const cells = document.querySelectorAll(".bingo-cell");
    cells.forEach((cell) => {
      if (parseInt(cell.textContent) === randomNumber) {
        cell.classList.add("selected");
      }
    });
    const numberDivs = document.querySelectorAll(".number");
    numberDivs.forEach((div) => {
      if (parseInt(div.textContent) === randomNumber) {
        div.classList.add("drawn");
      }
    });

    // Falar o número sorteado
    const speech = new SpeechSynthesisUtterance(`${randomNumber}`);
    speech.lang = "pt-BR";
    window.speechSynthesis.speak(speech);
    // Mostrar o número grande
    bigNumber.textContent = randomNumber;
    bigNumber.style.display = "block";
    setTimeout(() => {
      bigNumber.style.display = "none";
    }, 1000);
    updateLastDrawnNumbers();
  } else {
    clearInterval(interval);
    alert("Todos os números já foram sorteados!");
  }
  verificarVencedor();
}

function startBingo() {
  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    drawNumber();
  }, 5000);
}

function exibirCartelasNaTela(cartelas) {
  bingoCards.innerHTML = ""; // Limpar as cartelas existentes
  cartelas.forEach((cartela) => {
    const numeros = cartela.cartela.split(",").map(Number);
    const card = createBingoCard(numeros);
    card.dataset.id = cartela.id;
    card.dataset.nome = cartela.nome_usuario;
    bingoCards.appendChild(card);
    ids.push(cartela.id);
  });
}

async function buscarCartelas() {
  try {
    const response = await fetch(
      url+"getallcartelas.php?action=buscarCartelas"
    );

    if (response.ok) {
      const cartelas = await response.json();

      exibirCartelasNaTela(cartelas);
    } else {
      console.error("Erro ao buscar cartelas:", response.statusText);
    }
  } catch (error) {
    console.error("Erro ao buscar cartelas:", error);
  }
}
function verificarVencedor() {
  const cartelas = document.querySelectorAll(".bingo-card");

  cartelas.forEach((cartela) => {
    const numeros = cartela.querySelectorAll(".bingo-cell");
    const numerosSelecionados = cartela.querySelectorAll(
      ".bingo-cell.selected"
    );
    if (vencedor1 == false) {
      if (numerosSelecionados.length >= 4) {
        anunciarVencedor(cartela.dataset.nome, "Quem acertou 4 números");
        document.getElementById("vencedor1").innerText = cartela.dataset.nome;
        vencedor1 = true;
      }
    }
    if (vencedor2 == false) {
      // Verificar se alguma linha foi completada
      for (let i = 0; i < 3; i++) {
        const linha = Array.from(numeros).slice(i * 5, i * 5 + 5);
        if (linha.every((numero) => numero.classList.contains("selected"))) {
          anunciarVencedor(cartela.dataset.nome, "Linha completa");
          document.getElementById("vencedor2").innerText = cartela.dataset.nome;
          vencedor2 = true;
          break;
        }
      }
    }

    if (vencedor3 == false) {
      // Verificar se a cartela inteira foi completada
      if (numerosSelecionados.length === 15) {
        vencedor3 = true;
        deleteCartelas();
        anunciarVencedor(cartela.dataset.nome, "Bingo");
        document.getElementById("vencedor3").innerText = cartela.dataset.nome;
      }
    }
  });
}

buscarCartelas();
const drawnNumbers = [];
createAllNumbers(); // Crie a lista de números de 1 a 90

function showCurrentTime() {
  const currentTimeElement = document.getElementById("currentTime");
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(showCurrentTime, 1000);
function anunciarVencedor(nome, premio) {
  const modal = document.createElement("div");
  modal.innerHTML = `
        <div style="background-color: white; padding: 20px; text-align: center;">
            <h2>Parabéns, ${nome}!</h2>
            <p>Você ganhou o prêmio: ${premio}!</p>
        </div>
    `;
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "1000";

  setTimeout(() => {
    modal.remove();
  }, 5000);
  // Fechar o modal ao clicar fora
  modal.addEventListener("click", () => {
    modal.remove();
  });
  document.body.appendChild(modal);
}

function startMysql() {
  $.get(url+"startsql.php", function (data) {});
}

function getNumeroBingo() {
  $.get(url+"getNumeroBingo.php", function (data) {
    value = JSON.parse(data);
    document.getElementById("numeroBingo").innerText = value.count;
  });
}

function deleteCartelas() {
  ids.forEach((doc) => {
    $.get(url+"deleteCartelas.php?id=" + doc, function (data) {
      
    });
  }).then(() => {
    setTimeout(() => {
      window.location.reload()
    }, 5000)
  });
}
