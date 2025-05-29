// Dados iniciais padrão
const dadosPadrao = {
    produtos: {
        "Tradicionais": [],
        "Artesanais": [],
        "Combos": [],
        "Porções": [],
        "Bebidas": []
    },
    carrinho: [],
    historico: []
};

// Banco de dados local
let dados = {};

// Carregar dados do banco JSON (simulado via LocalStorage)
function carregarDados() {
    const salvo = localStorage.getItem('dados');
    dados = salvo ? JSON.parse(salvo) : JSON.parse(JSON.stringify(dadosPadrao));
    montarMenu();
    atualizarCarrinho();
    atualizarListaProdutos();
    atualizarCategoriasSelect();
    atualizarHistorico();
}

// Salvar dados
function salvarDados() {
    localStorage.setItem('dados', JSON.stringify(dados));
}

// Montar o menu de produtos
function montarMenu() {
    let menu = "";
    for (let categoria in dados.produtos) {
        if (dados.produtos[categoria].length > 0) {
            menu += `<div class="categoria"><h2>${categoria}</h2><div class="produtos">`;
            dados.produtos[categoria].forEach(p => {
                menu += `<div class="produto">
                    <h4>${p.nome}</h4>
                    <p>${p.desc}</p>
                    <p>R$ ${p.preco.toFixed(2)}</p>
                    <button onclick="addCarrinho('${p.nome}', ${p.preco})">Adicionar</button>
                </div>`;
            });
            menu += `</div></div>`;
        }
    }
    document.getElementById("menu").innerHTML = menu;
}

// Carrinho
function addCarrinho(nome, preco) {
    dados.carrinho.push({ nome, preco });
    salvarDados();
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const itens = dados.carrinho.map((item, i) =>
        `<div>${item.nome} - R$ ${item.preco.toFixed(2)} <button onclick="removerItem(${i})">Remover</button></div>`
    ).join('');
    const total = dados.carrinho.reduce((acc, item) => acc + item.preco, 0);
    document.getElementById("itens").innerHTML = itens;
    document.getElementById("total").innerText = total.toFixed(2);
}

function removerItem(index) {
    dados.carrinho.splice(index, 1);
    salvarDados();
    atualizarCarrinho();
}

function limparCarrinho() {
    dados.carrinho = [];
    salvarDados();
    atualizarCarrinho();
}

// Pagamento
function verificarPagamento() {
    const metodo = document.getElementById("pagamento").value;
    document.getElementById("trocoDiv").style.display = metodo === "Dinheiro" ? "block" : "none";
    document.getElementById("pixDiv").style.display = metodo === "Pix" ? "block" : "none";
}

// Texto do pedido
function gerarTextoPedido() {
    let texto = "*Novo Pedido Curti Burger*\n";
    dados.carrinho.forEach(item => {
        texto += `- ${item.nome} R$ ${item.preco.toFixed(2)}\n`;
    });
    texto += `*Total:* R$ ${document.getElementById("total").innerText}\n`;
    texto += `*Pagamento:* ${document.getElementById("pagamento").value}\n`;
    if (document.getElementById("pagamento").value === "Dinheiro") {
        texto += `*Troco para:* R$ ${document.getElementById("troco").value || "Não informado"}\n`;
    }
    texto += `*Observações:* ${document.getElementById("obs").value}\n`;
    return encodeURIComponent(texto);
}

// Enviar WhatsApp
function enviarWhatsApp() {
    if (dados.carrinho.length === 0) {
        alert("Carrinho vazio!");
        return;
    }
    const texto = gerarTextoPedido();
    window.open(`https://wa.me/5521994796613?text=${texto}`, '_blank');
}

// Imprimir comanda estilizada
function imprimirComanda() {
    const texto = decodeURIComponent(gerarTextoPedido()).replace(/\*/g, '');
    const janela = window.open('', '', 'width=400,height=600');
    janela.document.write('<pre>' + texto + '</pre>');
    janela.document.close();
    janela.print();
}

// Finalizar pedido e enviar para tela de produção
function finalizarPedido() {
    if (dados.carrinho.length === 0) {
        alert("Carrinho vazio!");
        return;
    }
    const pedido = {
        id: Date.now(),
        itens: [...dados.carrinho],
        obs: document.getElementById("obs").value,
        pagamento: document.getElementById("pagamento").value,
        troco: document.getElementById("troco").value,
        total: parseFloat(document.getElementById("total").innerText),
        status: "Em preparo"
    };
    dados.historico.push(pedido);
    salvarDados();
    limparCarrinho();
    atualizarHistorico();
    alert("Pedido enviado para produção!");
}

// Tela de Produção
function abrirTelaProducao() {
    const win = window.open('', '', 'width=800,height=600');
    win.document.write('<html><head><title>Produção - Curti Burger</title><style>body{font-family:sans-serif;padding:10px;} .pedido{border:2px solid orange;padding:10px;margin:10px 0;}</style></head><body>');
    win.document.write('<h1>Pedidos em Produção</h1>');

    dados.historico.filter(p => p.status !== "Entregue").forEach(p => {
        win.document.write(`<div class="pedido">
            <h3>Pedido #${p.id}</h3>
            <p>${p.itens.map(i => `${i.nome} - R$ ${i.preco.toFixed(2)}`).join('<br>')}</p>
            <p><strong>Total:</strong> R$ ${p.total.toFixed(2)}</p>
            <p><strong>Observações:</strong> ${p.obs}</p>
            <p><strong>Pagamento:</strong> ${p.pagamento} ${p.troco ? `(Troco para: R$ ${p.troco})` : ''}</p>
            <button onclick="window.opener.atualizarStatus(${p.id},'Pronto');location.reload()">Pronto</button>
            <button onclick="window.opener.atualizarStatus(${p.id},'Entregue');location.reload()">Entregue</button>
        </div>`);
    });

    win.document.write('</body></html>');
    win.document.close();
}

function atualizarStatus(id, status) {
    const pedido = dados.historico.find(p => p.id === id);
    if (pedido) {
        pedido.status = status;
        salvarDados();
    }
}

// Administração
function toggleAdmin() {
    document.getElementById('admin').classList.toggle('hidden');
}

function atualizarCategoriasSelect() {
    const select = document.getElementById('categoriaProduto');
    select.innerHTML = "";
    for (let categoria in dados.produtos) {
        select.innerHTML += `<option value="${categoria}">${categoria}</option>`;
    }
}

function adicionarCategoria() {
    const nome = document.getElementById('novaCategoria').value.trim();
    if (nome && !dados.produtos[nome]) {
        dados.produtos[nome] = [];
        salvarDados();
        montarMenu();
