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
	const statsDiv = document.getElementById("estatisticas"); // <div id="estatisticas"></div> no HTML

	// Limpa destaques anteriores
	points.forEach((p) =>
		document.getElementById(`point-${p.id}`).classList.remove("highlight")
	);
	document
		.querySelectorAll("line")
		.forEach((line) => line.classList.remove("highlight-edge"));

	// Executa Dijkstra com estatísticas
	const { path, nodesExplored, cost, time } = dijkstra(
		parseInt(start),
		parseInt(end),
		points,
		vertices,
		(p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y)
	);

	// Exibe caminho e estatísticas
	mostrarToastCaminho(path);
	statsDiv.innerHTML = `
		<p><strong>Tempo:</strong> ${time.toFixed(2)} ms</p>
		<p><strong>Vértices explorados:</strong> ${nodesExplored}</p>
		<p><strong>Custo total:</strong> ${cost.toFixed(2)}</p>
	`;

	// Destaca caminho e arestas
	path.forEach((id) =>
		document.getElementById(`point-${id}`).classList.add("highlight")
	);
	for (let i = 0; i < path.length - 1; i++) {
		const from = path[i];
		const to = path[i + 1];
		document.querySelectorAll("line").forEach((line) => {
			const lf = parseInt(line.dataset.from);
			const lt = parseInt(line.dataset.to);
			if ((lf === from && lt === to) || (lf === to && lt === from)) {
				line.classList.add("highlight-edge");
			}
		});
	}
}

/**
 * Exibe um toast com o caminho percorrido entre dois vértices.
 * @param {number[]} path - Caminho como array de IDs.
 */
function mostrarToastCaminho(path) {
	if (!path || path.length < 2) return;

	const inicio = path[0];
	const fim = path[path.length - 1];
	const texto = `Caminho de ${inicio} até ${fim}: ${path.join(" → ")}`;

	const toast = document.getElementById("toast-caminho");
	const textoElemento = document.getElementById("toast-caminho-texto");
	const botaoFechar = document.getElementById("toast-caminho-close");

	textoElemento.textContent = texto;
	toast.classList.remove("hidden");
	toast.classList.add("show");

	// Botão "X" para fechar
	botaoFechar.onclick = () => {
		toast.classList.remove("show");
		toast.classList.add("hidden");
	};
}
