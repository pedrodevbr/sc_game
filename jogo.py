import random
import matplotlib.pyplot as plt
import numpy as np

class InventoryGame:
    def __init__(self, order_point):
        self.initial_stock = 20
        self.stock = self.initial_stock
        self.order_point = order_point
        self.lead_time_orders = []
        self.storage_cost_per_unit = 2
        self.stockout_cost_per_unit = 5
        self.ordering_cost = 50
        self.stock_history = []
        self.demand_history = []
        self.received_history = []
        self.total_cost = 0
        self.rounds_played = 0

    def generate_demand(self):
        # Gera demanda com distribuição normal (média=10, desvio padrão=5)
        return max(int(np.random.normal(10, 5)), 0)  # Garante que a demanda não seja negativa

    def receive_order(self, order_quantity):
        if order_quantity > 0:
            self.lead_time_orders.append({'rounds_remaining': 2, 'quantity': order_quantity})
            self.total_cost += self.ordering_cost
            print(f"Pedido de {order_quantity} unidades realizado. Custo do pedido: ${self.ordering_cost}")

    def update_stock(self):
        received_quantity = 0
        # Processando pedidos com lead time
        for order in self.lead_time_orders:
            if order['rounds_remaining'] == 0:
                self.stock += order['quantity']
                received_quantity += order['quantity']
                self.lead_time_orders.remove(order)

        # Atualizar pedidos pendentes
        for order in self.lead_time_orders:
            order['rounds_remaining'] -= 1

        return received_quantity

    def play_round(self, order_quantity):
        # Receber pedido do usuário
        self.receive_order(order_quantity)

        # Atualizar estoque para pedidos no lead time
        received_quantity = self.update_stock()

        # Gerar e aplicar a demanda
        self.demand = self.generate_demand()
        self.stock -= self.demand

        # Calcular custos
        storage_cost = self.storage_cost_per_unit * max(self.stock, 0)
        stockout_cost = self.stockout_cost_per_unit * max(-self.stock, 0)
        round_cost = storage_cost + stockout_cost
        self.total_cost += round_cost

        # Atualizar histórico e exibir informações
        self.stock_history.append(self.stock)
        self.demand_history.append(self.demand)
        self.received_history.append(received_quantity)
        print(f"Rodada {self.rounds_played + 1}: Estoque = {self.stock}, Recebido = {received_quantity}, Demanda = {self.demand}, Custo da Rodada = ${round_cost}, Custo Total Acumulado = ${self.total_cost}")

        self.rounds_played += 1

    def show_stock_history(self):
        plt.figure(figsize=(10, 6))
        plt.plot(self.stock_history, marker='o', label="Nível de Estoque")
        plt.axhline(y=self.order_point, color='r', linestyle='--', label="Ponto de Pedido")
        for i, received in enumerate(self.received_history):
            if received > 0:
                plt.annotate(f'Recebido: {received}', (i, self.stock_history[i]), textcoords="offset points", xytext=(0,10), ha='center')
        plt.title("Histórico de Níveis de Estoque")
        plt.xlabel("Rodada")
        plt.ylabel("Nível de Estoque")
        plt.legend()
        plt.grid(True)
        plt.show()

# Inicializando e executando o jogo
order_point = 30  # Defina o ponto de pedido aqui
game = InventoryGame(order_point)

for _ in range(5):
    order_quantity = int(input(f"Rodada {_ + 1} - Insira a quantidade a ser pedida: "))
    game.play_round(order_quantity)

print(f"Custo total acumulado após 5 rodadas: ${game.total_cost}")
game.show_stock_history()

