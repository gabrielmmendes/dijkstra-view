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
export function selecionaPontos(
	div,
	calcularCaminho,
	dijkstra,
	points,
	vertices
) {
	/**
	 * Controla a seleção visual (highlight, start, end) e dispara o cálculo do caminho
	 * quando dois pontos são selecionados.
	 */
	function limparSelecao(start, end) {
		points.forEach((p) => {
				document
					.getElementById(`point-${p.id}`)
					.classList.remove("highlight", "start", "end");
			});

			// Remove destaque das arestas também
			document.querySelectorAll("line").forEach((line) => {
				line.classList.remove("highlight-edge");
			});

			// Limpa referências
			start = end = [];
	}

	div.addEventListener("click", () => {
		// Obtém os elementos DOM com as classes 'start' e 'end'
		let start = document.getElementsByClassName("start");
		let end = document.getElementsByClassName("end");

		// Se o ponto já estiver selecionado, desmarca todas as classes
		if (div.classList.contains("highlight")) {
			div.classList.remove("highlight", "start", "end");
		} else {
			// Marca como selecionado
			div.classList.add("highlight");

			// Define como 'start' se nenhum ponto ainda estiver marcado como tal
			if (start.length === 0) {
				div.classList.add("start");
			} else {
				// Caso contrário, define como 'end'
				div.classList.add("end");
			}
		}

		// Coleta todos os pontos atualmente destacados
		const pontosSelecionados = document.getElementsByClassName("highlight");

		// Se mais de dois pontos estiverem selecionados, limpa tudo
		if (pontosSelecionados.length > 2) {
			limparSelecao(start, end);
			return; // Encerra a função para evitar cálculo de caminho
		}

		// Se exatamente dois pontos foram selecionados, calcula o caminho entre eles
		if (pontosSelecionados.length === 2) {
			// Extrai os IDs numéricos dos elementos marcados como 'start' e 'end'
			if( !(start[0] && end[0]) ) {
				limparSelecao(start, end);

				return;
			}
			const startId = parseInt(start[0].id.replace("point-", ""));
			const endId = parseInt(end[0].id.replace("point-", ""));

			// Chama a função para calcular e exibir o caminho mais curto
			calcularCaminho(startId, endId, dijkstra, points, vertices);

		}
	});

	/**
	 * Remove um ponto do grafo ao dar duplo clique
	 */
	div.addEventListener("dblclick", () => {
		// Remove o ponto
		const pointId = parseInt(div.id.replace("point-", ""));
		const pointIndex = points.findIndex(p => p.id === parseInt(pointId));
		if (pointIndex !== -1) points.splice(pointIndex, 1);
		div.remove();
		// Remove as arestas conectadas ao ponto removido
		for (let i = vertices.length - 1; i >= 0; i--) {
			if (vertices[i].from === pointId || vertices[i].to === pointId) {
				vertices.splice(i, 1);
			}
		}
		document.querySelectorAll(`line[data-from="${pointId}"], line[data-to="${pointId}"]`).forEach(line => line.remove());
	});
}
