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
 * Executa o algoritmo de Dijkstra para encontrar o caminho mais curto entre dois pontos em um grafo.
 *
 * @param {number} startId - ID do ponto de origem.
 * @param {number} endId - ID do ponto de destino.
 * @param {{id: number, x: number, y: number}[]} points - Lista de pontos com coordenadas e identificadores únicos.
 * @param {{from: number, to: number}[]} vertices - Lista de arestas conectando os pontos por seus IDs.
 * @param {(p1: {x: number, y: number}, p2: {x: number, y: number}) => number} distance - Função que calcula a distância entre dois pontos.
 *
 * @returns {{
 *   path: number[],        // Lista ordenada com os IDs do caminho mais curto entre origem e destino.
 *   nodesExplored: number, // Número total de nós visitados durante a execução do algoritmo.
 *   cost: number,          // Custo total do caminho mais curto (soma das distâncias).
 *   time: number           // Tempo de execução do algoritmo em milissegundos.
 * }}
 */
export function dijkstra(startId, endId, points, vertices, distance) {
	const startTime = performance.now(); // Marca o início da medição de tempo

	// Inicializa estruturas para distâncias, predecessores e conjunto de visitados
	const distances = {};   // Guarda a menor distância conhecida de startId até cada ponto
	const previous = {};    // Guarda o ponto anterior no caminho mais curto
	const visited = new Set(); // Guarda os pontos já visitados
	const graph = {};       // Lista de adjacência representando o grafo

	// Constrói o grafo (lista de adjacência) com pesos baseados na distância
	points.forEach((p) => (graph[p.id] = []));

	vertices.forEach((e) => {
		const from = points.find((p) => p.id === e.from);
		const to = points.find((p) => p.id === e.to);
		const dist = distance(from, to); // Calcula o peso da aresta

		// Grafo não direcionado (bidirecional)
		graph[e.from].push({ id: e.to, weight: dist });
		graph[e.to].push({ id: e.from, weight: dist });
	});

	// Inicializa todas as distâncias como infinito e predecessores como null
	points.forEach((p) => {
		distances[p.id] = Infinity;
		previous[p.id] = null;
	});

	// Inicializa a fila de prioridade com o ponto de origem
	const queue = new MinHeap();
	distances[startId] = 0;
	queue.insert({ id: startId, dist: 0 });

	let nodesExplored = 0; // Contador de nós visitados

	// Loop principal do algoritmo
	while (!queue.isEmpty()) {
		const current = queue.extractMin(); // Pega o nó com menor distância acumulada

		if (current.id === endId) break; // Caminho encontrado, interrompe o loop
		if (visited.has(current.id)) continue; // Ignora se já foi visitado

		visited.add(current.id);
		nodesExplored++; // Incrementa o número de nós explorados

		// Atualiza os vizinhos do nó atual
		for (const neighbor of graph[current.id]) {
			const alt = distances[current.id] + neighbor.weight;

			// Se encontrou um caminho mais curto até o vizinho
			if (alt < distances[neighbor.id]) {
				distances[neighbor.id] = alt;
				previous[neighbor.id] = current.id;
				queue.insert({ id: neighbor.id, dist: alt });
			}
		}
	}

	// Reconstrói o caminho mais curto a partir do destino
	const path = [];
	let currentId = endId;

	while (currentId !== null) {
		path.unshift(currentId); // Insere no início do array
		currentId = previous[currentId];
	}

	const endTime = performance.now(); // Marca o final da medição de tempo
	const cost = distances[endId];     // Custo total do caminho

	// Retorna estatísticas e o caminho encontrado
	return {
		path,
		nodesExplored,
		cost,
		time: endTime - startTime,
	};
}