// Importa os módulos principais
import { dijkstra } from "./dijkstra.js";
import { selecionaPontos } from "./ui.js";
import { calcularCaminho } from "./utils.js";
import { downloadExemplo, parsePolyFile } from "./parser.js";
import html2canvas from "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm";

// Armazenam os dados extraídos do arquivo .poly
let points = [];
let vertices = [];

/**
 * Inicializa o sistema a partir de um arquivo de exemplo.
 */
function carregarExemplo() {
	fetch("../images/exemplo.poly")
		.then((response) => response.text())
		.then((data) => {
			parsePolyFile(
				data,
				selecionaPontos,
				calcularCaminho,
				dijkstra,
				points,
				vertices
			);
		})
		.catch((err) =>
			console.error("Erro ao carregar arquivo exemplo:", err)
		);
}

/**
 * Configura o input de upload de arquivos .poly enviados pelo usuário.
 */
function configurarInputDeArquivo() {
	document
		.getElementById("fileInput")
		.addEventListener("change", function (event) {
			const file = event.target.files[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = function (e) {
				const text = e.target.result;
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
}

/**
 * Associa o botão de download de exemplo à sua ação correspondente.
 */
function configurarBotaoDownload() {
	document.getElementById("download").addEventListener("click", () => {
		downloadExemplo();
	});
}

/**
 * Captura o grafo renderizado e copia como imagem para a área de transferência.
 */
function configurarBotaoCopiaGrafo() {
	document.getElementById("copiarGrafo").addEventListener("click", () => {
		const target = document.getElementById("canvas");

		html2canvas(target).then((canvas) => {
			canvas.toBlob(async (blob) => {
				if (navigator.clipboard && window.ClipboardItem) {
					try {
						await navigator.clipboard.write([
							new ClipboardItem({ "image/png": blob }),
						]);
						alert(
							"Imagem do grafo copiada para a área de transferência!"
						);
					} catch (err) {
						console.error("Erro ao copiar imagem:", err);
						alert(
							"Erro ao copiar imagem. Verifique permissões do navegador."
						);
					}
				} else {
					alert(
						"API de área de transferência não suportada neste navegador."
					);
				}
			});
		});
	});
}

/**
 * Função principal de inicialização do sistema.
 */
function inicializarApp() {
	carregarExemplo();
	configurarInputDeArquivo();
	configurarBotaoDownload();
	configurarBotaoCopiaGrafo();
}

// Executa a inicialização ao carregar o script
inicializarApp();
