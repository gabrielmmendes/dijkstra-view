/**
 * Associa a lógica de clique a um ponto no canvas para seleção interativa
 * e inicia o cálculo do caminho mais curto entre dois pontos usando Dijkstra.
 *
 * @param {HTMLElement} div - Elemento HTML do ponto que será clicável.
 * @param {Function} calcularCaminho - Função chamada ao selecionar dois pontos.
 *        Deve aceitar os parâmetros: (startId, endId, dijkstra, points, vertices)
 * @param {Function} dijkstra - Função de Dijkstra para cálculo do caminho mais curto.
 * @param {Object[]} points - Lista de pontos do grafo com `{id, x, y}`.
 * @param {Object[]} vertices - Lista de arestas do grafo com `{from, to}`.
 */
export function selecionaPontos(div, calcularCaminho, dijkstra, points, vertices) {
	div.addEventListener("click", () => {
		const pontosSelecionados = document.getElementsByClassName("highlight");

		// Limpa seleção se houver mais de 2 pontos já destacados
		if (pontosSelecionados.length > 2) {
			points.forEach((p) => {
				document.getElementById(`point-${p.id}`).classList.remove("highlight");
			});
		}

		// Destaca o ponto clicado
		div.classList.add("highlight");

		// Quando dois pontos estiverem selecionados, calcula o caminho
		if (pontosSelecionados.length === 2) {
			const startId = pontosSelecionados[0].id.replace("point-", "");
			const endId = pontosSelecionados[1].id.replace("point-", "");

			calcularCaminho(startId, endId, dijkstra, points, vertices);
		}
	});
}