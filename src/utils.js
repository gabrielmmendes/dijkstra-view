/**
 * Calcula a distância euclidiana entre dois pontos.
 * @param {{x: number, y: number}} p1
 * @param {{x: number, y: number}} p2
 * @returns {number} Distância entre os pontos
 */
function distance(p1, p2) {
	return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * Função responsável por calcular o caminho entre dois pontos
 */
export function calcularCaminho(start, end, dijkstra, points, vertices) {
	const resultado = document.getElementById("resultado");

	points.forEach((p) => {
		document.getElementById("point-" + p.id).classList.remove("highlight");
	});

	document.querySelectorAll("line").forEach((line) => {
		line.classList.remove("highlight-edge");
	});

	const caminho = dijkstra(
		parseInt(start),
		parseInt(end),
		points,
		vertices,
		distance
	);
	resultado.textContent = caminho.join(" → ");

	caminho.forEach((id) => {
		document.getElementById("point-" + id).classList.add("highlight");
	});

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
