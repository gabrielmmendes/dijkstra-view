/**
 * Calcula a distância euclidiana entre dois pontos.
 *
 * @param {{x: number, y: number}} p1 - Primeiro ponto com coordenadas x e y.
 * @param {{x: number, y: number}} p2 - Segundo ponto com coordenadas x e y.
 * @returns {number} A distância euclidiana entre os dois pontos.
 */
export function distance(p1, p2) {
	return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * Calcula o caminho mais curto entre dois pontos usando o algoritmo de Dijkstra
 * e destaca visualmente os pontos e arestas no canvas HTML.
 *
 * @param {string|number} start - ID do ponto inicial.
 * @param {string|number} end - ID do ponto final.
 * @param {Function} dijkstra - Função que implementa o algoritmo de Dijkstra.
 *        Deve ter assinatura: (startId, endId, points, vertices, distanceFn) => number[]
 * @param {Array<{id: number, x: number, y: number}>} points - Lista de pontos do grafo.
 * @param {Array<{from: number, to: number}>} vertices - Lista de arestas do grafo.
 */
export function calcularCaminho(start, end, dijkstra, points, vertices) {
	const resultado = document.getElementById("resultado");

	// Remove destaques de pontos anteriores
	points.forEach((p) => {
		const el = document.getElementById(`point-${p.id}`);
		if (el) el.classList.remove("highlight");
	});

	// Remove destaques de arestas anteriores
	document.querySelectorAll("line").forEach((line) => {
		line.classList.remove("highlight-edge");
	});

	// Executa o algoritmo de Dijkstra
	const caminho = dijkstra(
		parseInt(start),
		parseInt(end),
		points,
		vertices,
		distance
	);

	// Exibe o caminho encontrado como texto
	resultado.textContent = caminho.join(" → ");

	// Destaca os pontos do caminho encontrado
	caminho.forEach((id) => {
		const el = document.getElementById(`point-${id}`);
		if (el) el.classList.add("highlight");
	});

	// Destaca as arestas que fazem parte do caminho
	for (let i = 0; i < caminho.length - 1; i++) {
		const from = caminho[i];
		const to = caminho[i + 1];

		document.querySelectorAll("line").forEach((line) => {
			const lf = parseInt(line.dataset.from);
			const lt = parseInt(line.dataset.to);

			if ((lf === from && lt === to) || (lf === to && lt === from)) {
				line.classList.add("highlight-edge");
			}
		});
	}
}
