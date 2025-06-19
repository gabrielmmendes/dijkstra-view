import { dijkstra } from "./dijkstra.js";
import { selecionaPontos } from "./ui.js";
import { calcularCaminho } from "./utils.js";
import { parsePolyFile } from "./parser.js";

let points = [];
let vertices = [];

fetch("../images/exemplo.poly")
	.then((response) => response.text())
	.then((data) => {
		parsePolyFile(data, selecionaPontos, calcularCaminho, dijkstra, points, vertices);
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
			parsePolyFile(text, selecionaPontos, calcularCaminho, dijkstra, points, vertices);
		};
		reader.readAsText(file);
	});

