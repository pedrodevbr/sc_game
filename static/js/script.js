let currentStock = 100;
let baseDemand = 20;
let demand = baseDemand;
let leadTime = 3; // Tempo de espera em rodadas para pedidos
let round = 0;
let stockHistory = []; // Histórico de estoque para gráfico
let demandHistory = []; // Histórico de demanda para gráfico
let orders = []; // Pedidos em trânsito
let chart = null; // Variável global para manter a instância do gráfico

const custoPedido = 20;
const custoArmazenagem = 1;
const custoFalta = 5;
let custoTotal = 0;
let demandaTotal = 0;
let demandaNaoAtendida = 0;
let indiceAtendimento = 0;


// Calcula o estoque virtual (estoque físico + pedidos em trânsito)
function calculateVirtualStock() {
    const totalOrders = orders.reduce((sum, order) => sum + order.quantity, 0);
    return currentStock + totalOrders;
}

// Atualiza informações de estoque e demanda na página
function updateStockInfo() {
    const stockInfo = document.getElementById('stock-info');
    const virtualStock = calculateVirtualStock();
    stockInfo.innerHTML = `<p>Estoque Atual: ${currentStock}</p>
                           <p>Estoque Virtual: ${virtualStock}</p>
                           <p>Demanda Atual: ${demand}</p>`;
    updateOrdersInTransit();
    updateChart();
}

// Atualiza a lista de pedidos em trânsito
function updateOrdersInTransit() {
    const ordersDiv = document.getElementById('orders-in-transit');
    let ordersContent = orders.length > 0 ? 'Pedidos em Trânsito:<br>' : 'Não há pedidos em trânsito.';
    orders.forEach(order => {
        ordersContent += `Quantidade: ${order.quantity}, Tempo de Espera Restante: ${order.leadTime} rodada(s)<br>`;
    });
    ordersDiv.innerHTML = ordersContent;
}

// Atualiza o gráfico com histórico de estoque e demanda
function updateChart() {
    const ctx = document.getElementById('stockChart').getContext('2d');
    
    // Calcula o estoque virtual e custos
    let virtualStockHistory = [], totalCost = 0, serviceLevel = 0, totalRoundsServed = 0;
    stockHistory.forEach((stock, index) => {
        const totalOrders = orders.slice(0, index + 1).reduce((sum, order) => sum + order.quantity, 0);
        virtualStockHistory.push(stock + totalOrders);

        // Adicione aqui a lógica de cálculo de custos e índice de atendimento
        // Exemplo: totalCost += ...
        // Para o índice de atendimento, você pode contabilizar as rodadas em que a demanda foi totalmente atendida
        if (stock >= demandHistory[index]) {
            totalRoundsServed++;
        }
    });
    serviceLevel = totalRoundsServed / round * 100; // Calcula o índice de atendimento

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: demandHistory.map((_, index) => `Rodada ${index + 1}`),
            datasets: [{
                label: 'Demanda',
                data: demandHistory.map(d => d * -1), // Inverte a barra de demanda
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgb(255, 99, 132)',
                type: 'bar'
            }, {
                label: 'Estoque Físico',
                data: stockHistory,
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                type: 'line',
                fill: true
            }, {
                label: 'Estoque Virtual',
                data: virtualStockHistory,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                type: 'line',
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: true
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


// Lógica para executar a cada rodada do jogo
function startRound() {
    // Processa pedidos com base no tempo de espera
    orders.forEach(order => {
        if (order.leadTime <= 0) {
            currentStock += order.quantity;
            custoTotal += custoPedido; // Custo por fazer um pedido
        }
    });
    orders = orders.filter(order => order.leadTime-- > 0);

    // Cálculo de custo de armazenagem
    custoTotal += currentStock * custoArmazenagem;
    // Atualização de estoque e demanda
    demand = Math.floor(15+Math.random()*10);
    
    demandaTotal += demand;
    let demandaAtendida = Math.min(currentStock, demand);
    demandaNaoAtendida += (demand - demandaAtendida);
    if (demandaNaoAtendida<0){
        custoTotal -= demandaNaoAtendida*custoFalta;
        console.log(demandaNaoAtendida)
        demandaNaoAtendida=0;
    }
    currentStock = Math.max(currentStock - demand, 0); // Evita estoque negativo

    // Atualiza o estoque virtual
    const virtualStock = calculateVirtualStock();

    // Verifica se é necessário fazer uma reposição automática
    const reorderPoint = parseInt(document.getElementById('reorder-point').value);
    const maxOrder = parseInt(document.getElementById('max-order').value);
    if (virtualStock < reorderPoint) {
        const orderQuantity = maxOrder - virtualStock;
        placeOrder(orderQuantity);
    }

    round++;
    stockHistory.push(currentStock);
    demandHistory.push(demand);
    updateStockInfo();
    // Calcula índice de atendimento a cada 12 rodadas
    if (round % 12 === 0) {
    
    indiceAtendimento = 1 - (demandaNaoAtendida / demandaTotal);
    // Reset das variáveis para o próximo ciclo de 12 rodadas
    demandaTotal = 0;
    demandaNaoAtendida = 0;
    alert("Custo total: " + custoTotal.toFixed(2));
    alert("Índice de atendimento (últimas 12 rodadas): " + indiceAtendimento.toFixed(2));
    custoTotal = 0
    //chart.destroy();
    }
}

// Coloca um novo pedido
function placeOrder(quantity) {
    if (quantity > 0) {
        orders.push({ quantity: quantity, leadTime: leadTime });
    }
    updateOrdersInTransit();
}

// Configuração inicial
updateStockInfo();
updateChart();
