/**
 * Lê um conteúdo `.poly` e extrai os pontos e arestas.
 * Também renderiza os elementos no canvas e associa eventos de clique.
 *
 * @param {string} content - Conteúdo do arquivo `.poly`.
 * @param {Function} selecionaPontos - Função que associa os eventos de clique aos pontos.
 * @param {Function} adicionaPontos
 * @param {Function} calcularCaminho - Função que executa o cálculo do caminho entre dois pontos.
 * @param {Function} dijkstra - Função que implementa o algoritmo de Dijkstra.
 * @param {object[]} points - Array vazio para ser preenchido com os pontos do grafo.
 * @param {object[]} vertices - Array vazio para ser preenchido com as arestas do grafo.
 * @returns {{ points: object[], vertices: object[] }} Objetos preenchidos com os dados lidos.
 */
export function parsePolyFile(
	content,
	selecionaPontos,
	adicionaPontos,
	calcularCaminho,
	dijkstra,
	points,
	vertices
) {
	const canvas = document.getElementById("canvas");
	canvas.innerHTML = "";

	// New regex patterns for the new format
	const pointRegex = /^(\d+)\s+([\d.]+)\s+([\d.]+)$/;
	const vertexRegex = /^(\d+)\s+(\d+)\s+(\d+)\s+\d+$/;
	// Regex for header lines
	const pointsHeaderRegex = /^(\d+)\s+2\s+0\s+1$/;
	const verticesHeaderRegex = /^(\d+)\s+1$/;

	points.length = 0;
	vertices.length = 0;

	const lines = content.split(/\r?\n/);

	// Parse the file in two sections: points and vertices
	let parsingPoints = false;
	let parsingVertices = false;

	lines.forEach((line) => {
		// Skip empty lines
		if (!line.trim()) return;

		// Check if this is the points header
		const pointsHeaderMatch = line.match(pointsHeaderRegex);
		if (pointsHeaderMatch) {
			parsingPoints = true;
			parsingVertices = false;
			return;
		}

		// Check if this is the vertices header
		const verticesHeaderMatch = line.match(verticesHeaderRegex);
		if (verticesHeaderMatch) {
			parsingPoints = false;
			parsingVertices = true;
			return;
		}

		// Parse points
		if (parsingPoints) {
			const pointMatch = line.match(pointRegex);
			if (pointMatch) {
				points.push({
					id: parseInt(pointMatch[1]),
					x: parseFloat(pointMatch[2]),
					y: parseFloat(pointMatch[3]),
				});
			}
		}

		// Parse vertices
		if (parsingVertices) {
			const vertexMatch = line.match(vertexRegex);
			if (vertexMatch) {
				vertices.push({
					from: parseInt(vertexMatch[2]),
					to: parseInt(vertexMatch[3]),
				});
			}
		}
	});

	// Normaliza coordenadas para o canvas
	const minX = Math.min(...points.map((p) => p.x));
	const minY = Math.min(...points.map((p) => p.y));
	const maxX = Math.max(...points.map((p) => p.x));
	const maxY = Math.max(...points.map((p) => p.y));

	const canvasSize = 600;
	const padding = 50;
	const rangeX = maxX - minX;
	const rangeY = maxY - minY;
	const scale = (canvasSize - 2 * padding) / Math.max(rangeX, rangeY);

	const pointMap = {};
	points.forEach((p) => {
		const x = (p.x - minX) * scale + padding;
		const y = (p.y - minY) * scale + padding;
		pointMap[p.id] = { x, y };

		const div = document.createElement("div");
		div.className = "point";

		div.innerText = p.id;

		div.id = "point-" + p.id;
		div.title = `id: ${p.id}\nx: ${p.x}\ny: ${p.y}`;
		div.style.left = `${x}px`;
		div.style.top = `${y}px`;
		div.style.cursor = "pointer";

		selecionaPontos(div, calcularCaminho, dijkstra, points, vertices);
		canvas.appendChild(div);
	});
	adicionaPontos(points, vertices, calcularCaminho, dijkstra);

	// Desenha arestas
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("width", "100%");
	svg.setAttribute("height", "100%");

	vertices.forEach((v) => {
		const from = pointMap[v.from];
		const to = pointMap[v.to];

		if (from && to) {
			const line = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"line"
			);
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

	// Adiciona suporte a zoom/pan com Panzoom (se disponível)
	if (window.Panzoom) {
		const panzoom = Panzoom(canvas, {
			maxScale: 10,
			minScale: 0.5,
			contain: "outside",
		});

		canvas.addEventListener("panzoomchange", () => {
			const scale = panzoom.getScale();

			// Atualiza tamanho dos pontos
			canvas.querySelectorAll(".point").forEach((p) => {
				const baseSize = 10;
				p.style.width = `${baseSize / scale}px`;
				p.style.height = `${baseSize / scale}px`;
				p.style.fontSize = `${10 / scale}px`;
			});
		});

		canvas.parentElement.addEventListener("wheel", panzoom.zoomWithWheel);
		panzoom.zoom(1);
		panzoom.pan(0, 0);
	}

	return { points, vertices };
}

/**
 * Cria e dispara o download de um arquivo de exemplo `.poly`.
 * O conteúdo simula pontos e arestas de um grafo simples.
 */
export function downloadExemplo() {
	const exemplo = `
10	2	0	1
0	600	500
1	1070	650
2	1187	868
3	1023	875
4	968	868
5	905	853
6	852	833
7	832	823
8	715	775
9	628	714
13	1
0	0	1	0
1	0	9	0
2	9	8	0
3	8	7	0
4	7	6	0
5	6	5	0
6	5	4	0
7	4	3	0
8	3	2	0
9	2	1	0
10	8	1	0
11	6	1	0
12	5	1	0
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
