// Importa os módulos principais
import { dijkstra } from "./dijkstra.js";
import { selecionaPontos } from "./ui.js";
import { calcularCaminho } from "./utils.js";
import { downloadExemplo, parsePolyFile } from "./parser.js";

// Armazenam os dados extraídos do arquivo .poly
let points = [];
let vertices = [];

/**
 * Lê e processa um arquivo .poly via requisição fetch.
 * Após o carregamento, os pontos e vértices são extraídos e renderizados no canvas.
 */
fetch("../images/exemplo.poly")
	.then((response) => response.text())
	.then((data) => {
		// Executa o parser do arquivo .poly e renderiza a UI
		parsePolyFile(
			data,
			selecionaPontos,
			calcularCaminho,
			dijkstra,
			points,
			vertices
		);
	})
	.catch((err) => console.error("Erro ao carregar arquivo exemplo:", err));

/**
 * Lê e processa um arquivo .poly enviado pelo usuário via input[type="file"].
 * Após a leitura, os dados são enviados ao parser que renderiza os elementos no canvas.
 */
document.getElementById("fileInput").addEventListener("change", function (event) {
	const file = event.target.files[0];
	if (!file) return;

	const reader = new FileReader();

	reader.onload = function (e) {
		const text = e.target.result;
		// Processa o conteúdo do arquivo lido
		parsePolyFile(
			text,
			selecionaPontos,
			calcularCaminho,
			dijkstra,
			points,
			vertices
		);
	};

	reader.readAsText(file);
});

/**
 * Adiciona um evento de clique ao botão com ID "donwload" para iniciar
 * o download de um arquivo de exemplo `.poly` quando clicado.
 */
document.getElementById("download").addEventListener("click", function () {
	// Chama a função responsável por gerar e baixar o arquivo de exemplo
	downloadExemplo();
});
