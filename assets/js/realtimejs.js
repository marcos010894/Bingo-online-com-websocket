var quantidade_Start = "";
var started = false;
var url = "http://localhost/apibingo/";

function fetchDataQuanties() {
  $.get(url + "verifyQuantitysstart.php", function (data) {
    let value = JSON.parse(data);
    quantidade_Start = value.quantidade_inicio;
    document.getElementById("cumpomvalor").innerText =
      "R$ " + parseFloat(value.valor_cartela);
  });
}
fetchDataQuanties();
function getPremios() {
  $.get(url + "getpremios.php", function (data) {
    let value = JSON.parse(data);
    document.getElementById("bingo").innerText = value.bingo;
    document.getElementById("quadra").innerText = value.quadra;
    document.getElementById("linha").innerText = value.linha;
  });
}
getPremios();
async function fetchData() {
  if (started) return;
  await $.get(url + "verifyQuantities.php", async function (data) {
    let value = JSON.parse(data);
    await fetchDataQuanties();
    await getPremios();
    await getNumeroBingo();
    await buscarCartelas();
    if (value.count >= quantidade_Start) {
      startMysql();
      document.getElementById("modalAguardando").style.display = "none";

      document.getElementById("modalAguardandoContagem").style.display = "flex";
      started = true;
      setTimeout((doc) => {
        document.getElementById("modalAguardandoContagem").style.display =
          "none";
        startBingo();
      }, 5000);
    }
  });
}
$(document).ready(function () {
  fetchData();
  setInterval(fetchData, 5000); // Atualiza a cada 5 segundos
});
