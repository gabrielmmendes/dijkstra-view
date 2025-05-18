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

function parsePolyFile(content) {
	const canvas = document.getElementById("canvas");
	canvas.innerHTML = "";

	const lines = content.split(/\r?\n/);
	const pointRegex = /id:\s*(\d+)\s*x:\s*([\d.]+)\s*y:\s*([\d.]+)/;
	const vertexRegex = /id_vertice:\s*\d+\s*de:\s*(\d+)\s*para:\s*(\d+)/;

	const points = [];
	const vertices = [];

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
		div.title = `id: ${p.id}`;
		div.style.left = x + "px";
		div.style.top = y + "px";
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
