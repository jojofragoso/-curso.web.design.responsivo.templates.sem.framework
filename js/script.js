// ===== DADOS DOS PRODUTOS =====
const produtos = [
  { id: 1, nome: "Vestido midi floral verão", preco: 89.9, antigo: 149.9, emoji: "👗", cor: "#ffe3ec", cat: "moda", vendidos: "2,1 mil" },
  { id: 2, nome: "Kit skincare vitamina C", preco: 59.9, antigo: 99.9, emoji: "🧴", cor: "#fff3d6", cat: "beleza", vendidos: "5,3 mil" },
  { id: 3, nome: "Fone de ouvido Bluetooth sem fio", preco: 119.9, antigo: 199.9, emoji: "🎧", cor: "#dff8f7", cat: "tech", vendidos: "8,7 mil" },
  { id: 4, nome: "Luminária LED de mesa", preco: 45.0, antigo: 79.9, emoji: "💡", cor: "#fff8d1", cat: "casa", vendidos: "1,4 mil" },
  { id: 5, nome: "Garrafa térmica 1L", preco: 39.9, antigo: 69.9, emoji: "🥤", cor: "#e3f0ff", cat: "fitness", vendidos: "3,9 mil" },
  { id: 6, nome: "Tênis casual branco", preco: 159.9, antigo: 249.9, emoji: "👟", cor: "#eeeeee", cat: "moda", vendidos: "980" },
  { id: 7, nome: "Paleta de sombras 12 cores", preco: 49.9, antigo: 89.9, emoji: "🎨", cor: "#f3e5ff", cat: "beleza", vendidos: "2,7 mil" },
  { id: 8, nome: "Smartwatch fitness", preco: 179.9, antigo: 299.9, emoji: "⌚", cor: "#e2e8f0", cat: "tech", vendidos: "4,2 mil" },
  { id: 9, nome: "Organizador de gavetas (kit 6)", preco: 34.9, antigo: 59.9, emoji: "🗂️", cor: "#e8f7e4", cat: "casa", vendidos: "6,0 mil" },
  { id: 10, nome: "Tapete de yoga antiderrapante", preco: 69.9, antigo: 119.9, emoji: "🧘", cor: "#e0f7f1", cat: "fitness", vendidos: "1,1 mil" },
  { id: 11, nome: "Óculos de sol retrô", preco: 29.9, antigo: 59.9, emoji: "🕶️", cor: "#fde2d4", cat: "moda", vendidos: "7,5 mil" },
  { id: 12, nome: "Carregador portátil 10000mAh", preco: 79.9, antigo: 129.9, emoji: "🔋", cor: "#e3fbe3", cat: "tech", vendidos: "3,3 mil" },
];

const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ===== RENDERIZAÇÃO DA GRADE =====
const grade = document.getElementById("grade");
let categoriaAtual = "todos";
let termoBusca = "";

function renderizarProdutos() {
  const lista = produtos.filter((p) =>
    (categoriaAtual === "todos" || p.cat === categoriaAtual) &&
    p.nome.toLowerCase().includes(termoBusca)
  );

  if (lista.length === 0) {
    grade.innerHTML = `<p class="carrinho__vazio">Nenhum produto encontrado.</p>`;
    return;
  }

  grade.innerHTML = lista.map((p) => {
    const desconto = Math.round((1 - p.preco / p.antigo) * 100);
    return `
      <article class="produto">
        <div class="produto__img" style="background:${p.cor}">
          <span class="produto__desconto">-${desconto}%</span>${p.emoji}
        </div>
        <div class="produto__info">
          <h3 class="produto__nome">${p.nome}</h3>
          <p class="produto__preco">${brl(p.preco)}<span class="produto__antigo">${brl(p.antigo)}</span></p>
          <p class="produto__meta">⭐ 4,8 · ${p.vendidos} vendidos</p>
          <button class="produto__btn" data-id="${p.id}">Adicionar</button>
        </div>
      </article>`;
  }).join("");
}

// ===== FILTROS =====
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelector(".chip.ativo").classList.remove("ativo");
    chip.classList.add("ativo");
    categoriaAtual = chip.dataset.cat;
    renderizarProdutos();
  });
});

document.getElementById("busca").addEventListener("input", (e) => {
  termoBusca = e.target.value.trim().toLowerCase();
  renderizarProdutos();
});

// ===== CARRINHO =====
const carrinho = [];
const elCarrinho = document.getElementById("carrinho");
const elSombra = document.getElementById("sombra");

function abrirCarrinho() { elCarrinho.classList.add("aberto"); elSombra.classList.add("visivel"); }
function fecharCarrinho() { elCarrinho.classList.remove("aberto"); elSombra.classList.remove("visivel"); }

document.getElementById("abrirCarrinho").addEventListener("click", abrirCarrinho);
document.getElementById("carrinhoMobile").addEventListener("click", (e) => { e.preventDefault(); abrirCarrinho(); });
document.getElementById("fecharCarrinho").addEventListener("click", fecharCarrinho);
elSombra.addEventListener("click", fecharCarrinho);

grade.addEventListener("click", (e) => {
  const btn = e.target.closest(".produto__btn");
  if (!btn) return;
  const produto = produtos.find((p) => p.id === Number(btn.dataset.id));
  carrinho.push(produto);
  btn.textContent = "✓ Adicionado";
  setTimeout(() => (btn.textContent = "Adicionar"), 1200);
  atualizarCarrinho();
});

document.getElementById("listaCarrinho").addEventListener("click", (e) => {
  const btn = e.target.closest(".remover");
  if (!btn) return;
  carrinho.splice(Number(btn.dataset.indice), 1);
  atualizarCarrinho();
});

function atualizarCarrinho() {
  document.getElementById("contador").textContent = carrinho.length;
  const lista = document.getElementById("listaCarrinho");
  lista.innerHTML = carrinho.length
    ? carrinho.map((p, i) => `
        <li>
          <span class="emoji">${p.emoji}</span>
          <span class="nome">${p.nome}<br><strong>${brl(p.preco)}</strong></span>
          <button class="remover" data-indice="${i}" aria-label="Remover">🗑️</button>
        </li>`).join("")
    : `<p class="carrinho__vazio">Seu carrinho está vazio.</p>`;
  const total = carrinho.reduce((soma, p) => soma + p.preco, 0);
  document.getElementById("total").textContent = brl(total);
}

// ===== CRONÔMETRO DA OFERTA =====
const fimOferta = Date.now() + 3 * 60 * 60 * 1000; // 3 horas
const cronometro = document.getElementById("cronometro");
function atualizarCronometro() {
  const resto = Math.max(0, fimOferta - Date.now());
  const h = String(Math.floor(resto / 3600000)).padStart(2, "0");
  const m = String(Math.floor((resto % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((resto % 60000) / 1000)).padStart(2, "0");
  cronometro.textContent = `${h}:${m}:${s}`;
}
setInterval(atualizarCronometro, 1000);

// ===== INICIALIZAÇÃO =====
renderizarProdutos();
atualizarCarrinho();
atualizarCronometro();
