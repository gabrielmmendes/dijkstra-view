/**
 * Classe que implementa uma Fila de Prioridade usando Heap Mínima.
 */
export class MinHeap {
	/**
	 * Inicializa a estrutura de heap como um array vazio.
	 */
	constructor() {
		this.heap = [];
	}

	/**
	 * Insere um novo nó na heap e reorganiza a estrutura para manter a propriedade de heap mínima.
	 * @param {{id: string, dist: number}} node - Objeto contendo o ID do vértice e a distância acumulada.
	 */
	insert(node) {
		this.heap.push(node); // Adiciona o novo elemento no final
		this.bubbleUp(this.heap.length - 1); // Reorganiza subindo
	}

	/**
	 * Move o elemento recém-inserido para cima até a posição correta.
	 * @param {number} index - Índice do elemento a ser ajustado.
	 */
	bubbleUp(index) {
		while (index > 0) {
			const parentIndex = Math.floor((index - 1) / 2); // Índice do pai
			// Se o pai já for menor ou igual, para
			if (this.heap[index].dist >= this.heap[parentIndex].dist) break;

			// Troca com o pai
			[this.heap[index], this.heap[parentIndex]] = [
				this.heap[parentIndex],
				this.heap[index],
			];
			index = parentIndex; // Continua subindo
		}
	}

	/**
	 * Remove e retorna o menor elemento da heap (elemento do topo).
	 * Reorganiza a heap para manter a propriedade de heap mínima.
	 * @returns {{id: string, dist: number}} O nó com menor distância.
	 */
	extractMin() {
		if (this.heap.length === 1) return this.heap.pop(); // Caso base
		const min = this.heap[0]; // Menor valor (raiz da heap)
		this.heap[0] = this.heap.pop(); // Move o último elemento para o topo
		this.bubbleDown(0); // Reorganiza descendo
		return min;
	}

	/**
	 * Move o elemento no topo da heap para baixo até sua posição correta.
	 * @param {number} index - Índice do elemento a ser ajustado.
	 */
	bubbleDown(index) {
		const length = this.heap.length;

		while (true) {
			let smallest = index;
			const left = 2 * index + 1;
			const right = 2 * index + 2;

			// Verifica se o filho esquerdo é menor
			if (
				left < length &&
				this.heap[left].dist < this.heap[smallest].dist
			) {
				smallest = left;
			}

			// Verifica se o filho direito é menor
			if (
				right < length &&
				this.heap[right].dist < this.heap[smallest].dist
			) {
				smallest = right;
			}

			// Se nenhum filho for menor, já está na posição certa
			if (smallest === index) break;

			// Troca com o menor filho
			[this.heap[index], this.heap[smallest]] = [
				this.heap[smallest],
				this.heap[index],
			];
			index = smallest; // Continua descendo
		}
	}

	/**
	 * Verifica se a heap está vazia.
	 * @returns {boolean} Verdadeiro se não há elementos na heap.
	 */
	isEmpty() {
		return this.heap.length === 0;
	}
}

/**
 * Algoritmo de Dijkstra para encontrar o caminho mais curto entre dois pontos.
 * @param {string} startId - ID do ponto inicial
 * @param {string} endId - ID do ponto final
 * @param {Object[]} points - Lista de pontos com id, x, y
 * @param {Object[]} vertices - Lista de arestas com from, to
 * @param {Function} distance - Função que retorna distância entre dois pontos
 * @returns {string[]} Caminho mais curto como array de IDs
 */
export function dijkstra(startId, endId, points, vertices, distance) {
	const distances = {};
	const previous = {};
	const visited = new Set();
	const graph = {};

	// Inicializa o grafo como lista de adjacência
	points.forEach((p) => (graph[p.id] = []));

	// Monta o grafo bidirecional com os pesos (distâncias)
	vertices.forEach((e) => {
		const from = points.find((p) => p.id === e.from);
		const to = points.find((p) => p.id === e.to);
		const dist = distance(from, to);

		graph[e.from].push({ id: e.to, weight: dist });
		graph[e.to].push({ id: e.from, weight: dist });
	});

	// Inicializa distâncias como infinito e anteriores como nulos
	points.forEach((p) => {
		distances[p.id] = Infinity;
		previous[p.id] = null;
	});

	// Inicializa a fila de prioridade com o ponto inicial
	const queue = new MinHeap();
	distances[startId] = 0;
	queue.insert({ id: startId, dist: 0 });

	while (!queue.isEmpty()) {
		const current = queue.extractMin();

		if (current.id === endId) break;
		if (visited.has(current.id)) continue;
		visited.add(current.id);

		for (const neighbor of graph[current.id]) {
			const alt = distances[current.id] + neighbor.weight;
			if (alt < distances[neighbor.id]) {
				distances[neighbor.id] = alt;
				previous[neighbor.id] = current.id;
				queue.insert({ id: neighbor.id, dist: alt });
			}
		}
	}

	// Reconstrói o caminho mais curto
	const path = [];
	let currentId = endId;

	while (currentId !== null) {
		path.unshift(currentId);
		currentId = previous[currentId];
	}

	return path;
}
