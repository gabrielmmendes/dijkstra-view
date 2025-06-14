fetch("exemplo.poly")
	.then((response) => response.text())
	.then((data) => {
		parsePolyFile(data);
	})
	.catch((err) => console.error("Erro:", err));

document
	.getElementById("fileInput")
	.addEventListener("change", function (event) {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = function (e) {
			const text = e.target.result;
			parsePolyFile(text);
		};
		reader.readAsText(file);
	});

let points = [];
let vertices = [];
function parsePolyFile(content) {
	const canvas = document.getElementById("canvas");
	canvas.innerHTML = "";

	const lines = content.split(/\r?\n/);
	const pointRegex = /id:\s*(\d+)\s*x:\s*([\d.]+)\s*y:\s*([\d.]+)/;
	const vertexRegex = /id_vertice:\s*\d+\s*de:\s*(\d+)\s*para:\s*(\d+)/;

	vertices = [];
	points = [];

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

	// Normalização para o canvas
	const minX = Math.min(...points.map((p) => p.x));
	const minY = Math.min(...points.map((p) => p.y));
	const maxX = Math.max(...points.map((p) => p.x));
	const maxY = Math.max(...points.map((p) => p.y));

	const scaleX = 550 / (maxX - minX);
	const scaleY = 550 / (maxY - minY);

	// Mapear pontos normalizados
	const pointMap = {};
	points.forEach((p) => {
		const x = (p.x - minX) * scaleX + 25;
		const y = (p.y - minY) * scaleY + 25;

		pointMap[p.id] = { x, y };

		const div = document.createElement("div");
		div.className = "point";
		div.innerText = p.id;
		div.id = "point-" + p.id;
		div.title = `id: ${p.id}`;
		div.style.left = x + "px";
		div.style.top = y + "px";
		selecionaPontos(div);
		div.style.cursor = "pointer";
		canvas.appendChild(div);
	});

	// SVG para desenhar linhas
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
}

function downloadExemplo() {
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

function distance(p1, p2) {
	return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

let graph = {};
function dijkstra(startId, endId) {
	const distances = {};
	const previous = {};
	const visited = new Set();
	const queue = [];

	graph = {};

	points.forEach((p) => (graph[p.id] = []));

	vertices.forEach((e) => {
		const from = points.find((p) => p.id === e.from);
		const to = points.find((p) => p.id === e.to);
		const dist = distance(from, to);

		graph[e.from].push({ id: e.to, weight: dist });
		graph[e.to].push({ id: e.from, weight: dist }); // Bidirecional
	});

	points.forEach((p) => {
		distances[p.id] = Infinity;
		previous[p.id] = null;
	});

	distances[startId] = 0;
	queue.push({ id: startId, dist: 0 });

	while (queue.length > 0) {
		// Ordena pelo menor custo
		queue.sort((a, b) => a.dist - b.dist);
		const current = queue.shift();

		if (current.id === endId) break;

		if (visited.has(current.id)) continue;
		visited.add(current.id);

		for (const neighbor of graph[current.id]) {
			const alt = distances[current.id] + neighbor.weight;
			if (alt < distances[neighbor.id]) {
				distances[neighbor.id] = alt;
				previous[neighbor.id] = current.id;
				queue.push({ id: neighbor.id, dist: alt });
			}
		}
	}

	// Reconstruir o caminho
	const path = [];
	let currentId = endId;

	while (currentId !== null) {
		path.unshift(currentId);
		currentId = previous[currentId];
	}

	return path;
}

function selecionaPontos(div) {
	div.addEventListener("click", function () {
		const pontosSelecionados = document.getElementsByClassName("highlight");

		if (pontosSelecionados.length > 2) {
			points.forEach((p) => {
				document
					.getElementById("point-" + p.id)
					.classList.remove("highlight");
			});
		}

		div.classList.add("highlight");

		if (pontosSelecionados.length === 2) {
			calcularCaminho(
				pontosSelecionados[0].id.replace("point-", ""),
				pontosSelecionados[1].id.replace("point-", "")
			);
		}
	});
}

function calcularCaminho(start, end) {
	const resultado = document.getElementById("resultado");

	points.forEach((p) => {
		document.getElementById("point-" + p.id).classList.remove("highlight");
	});

	document.querySelectorAll("line").forEach((line) => {
		line.classList.remove("highlight-edge");
	});

	const caminho = dijkstra(parseInt(start), parseInt(end));
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
