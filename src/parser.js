/**
 * Lê um conteúdo `.poly` e extrai os pontos e arestas.
 * Também renderiza os elementos no canvas e associa eventos de clique.
 *
 * @param {string} content - Conteúdo do arquivo `.poly`.
 * @param {Function} selecionaPontos - Função que associa os eventos de clique aos pontos.
 * @param {Function} calcularCaminho - Função que executa o cálculo do caminho entre dois pontos.
 * @param {Function} dijkstra - Função que implementa o algoritmo de Dijkstra.
 * @param {object[]} points - Array vazio para ser preenchido com os pontos do grafo.
 * @param {object[]} vertices - Array vazio para ser preenchido com as arestas do grafo.
 * @returns {{ points: object[], vertices: object[] }} Objetos preenchidos com os dados lidos.
 */
export function parsePolyFile(content, selecionaPontos, calcularCaminho, dijkstra, points, vertices) {
	const canvas = document.getElementById("canvas");
	canvas.innerHTML = "";

	// Expressões regulares para identificar pontos e vértices
	const pointRegex = /id:\s*(\d+)\s*x:\s*([\d.]+)\s*y:\s*([\d.]+)/;
	const vertexRegex = /id_vertice:\s*\d+\s*de:\s*(\d+)\s*para:\s*(\d+)/;

	// Limpa os arrays de pontos e vértices
	points.length = 0;
	vertices.length = 0;

	// Divide conteúdo por linhas e extrai dados
	const lines = content.split(/\r?\n/);
	lines.forEach((line) => {
		const pointMatch = line.match(pointRegex);
		const vertexMatch = line.match(vertexRegex);

		if (pointMatch) {
			points.push({
				id: parseInt(pointMatch[1]),
				x: parseFloat(pointMatch[2]),
				y: parseFloat(pointMatch[3]),
			});
		} else if (vertexMatch) {
			vertices.push({
				from: parseInt(vertexMatch[1]),
				to: parseInt(vertexMatch[2]),
			});
		}
	});

	// Normaliza coordenadas para o canvas
	const minX = Math.min(...points.map(p => p.x));
	const minY = Math.min(...points.map(p => p.y));
	const maxX = Math.max(...points.map(p => p.x));
	const maxY = Math.max(...points.map(p => p.y));
	const scaleX = 550 / (maxX - minX);
	const scaleY = 550 / (maxY - minY);

	// Mapeia os pontos no canvas
	const pointMap = {};
	points.forEach((p) => {
		const x = (p.x - minX) * scaleX + 25;
		const y = (p.y - minY) * scaleY + 25;
		pointMap[p.id] = { x, y };

		// Cria ponto visual no canvas
		const div = document.createElement("div");
		div.className = "point";
		div.innerText = p.id;
		div.id = "point-" + p.id;
		div.title = `id: ${p.id}`;
		div.style.left = `${x}px`;
		div.style.top = `${y}px`;
		div.style.cursor = "pointer";

		// Liga eventos de clique
		selecionaPontos(div, calcularCaminho, dijkstra, points, vertices);

		canvas.appendChild(div);
	});

	// Cria SVG e desenha as arestas
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("width", "100%");
	svg.setAttribute("height", "100%");

	vertices.forEach((v) => {
		const from = pointMap[v.from];
		const to = pointMap[v.to];

		if (from && to) {
			const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			line.setAttribute("x1", from.x);
			line.setAttribute("y1", from.y);
			line.setAttribute("x2", to.x);
			line.setAttribute("y2", to.y);
			line.setAttribute("stroke", "black");
			line.setAttribute("stroke-width", "1");
			line.dataset.from = v.from;
			line.dataset.to = v.to;
			svg.appendChild(line);
		}
	});

	canvas.appendChild(svg);

	return { points, vertices };
}

/**
 * Cria e dispara o download de um arquivo de exemplo `.poly`.
 * O conteúdo simula pontos e arestas de um grafo simples.
 */
export function downloadExemplo() {
	const exemplo = `
10	2	0	1
id: 0 x: 600 y: 500
id: 1 x: 1070 y: 650
id: 2 x: 1187 y: 868
id: 3 x: 1023 y: 875
id: 4 x: 968 y: 868
id: 5 x: 905 y: 853
id: 6 x: 852 y: 833
id: 7 x: 832 y: 823
id: 8 x: 715 y: 775
id: 9 x: 628 y: 714
5	1
id_vertice: 0 de: 0 para: 1 ignorar: 0
id_vertice: 1 de: 0 para: 9 ignorar: 0
id_vertice: 2 de: 9 para: 8 ignorar: 0
id_vertice: 3 de: 8 para: 7 ignorar: 0
id_vertice: 4 de: 7 para: 6 ignorar: 0
id_vertice: 5 de: 6 para: 5 ignorar: 0
id_vertice: 5 de: 5 para: 4 ignorar: 0
id_vertice: 5 de: 4 para: 3 ignorar: 0
id_vertice: 5 de: 3 para: 2 ignorar: 0
id_vertice: 5 de: 2 para: 1 ignorar: 0
id_vertice: 5 de: 8 para: 1 ignorar: 0
id_vertice: 5 de: 6 para: 1 ignorar: 0
id_vertice: 5 de: 5 para: 1 ignorar: 0
    `.trim();

	const blob = new Blob([exemplo], { type: "text/plain" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = "exemplo.poly";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}