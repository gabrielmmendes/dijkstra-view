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






/**
 * Controle das opções de edição do grafo (botões de adicionar e conectar pontos)
 */
const botaoAdicionarVertice = document.getElementById("adicionarVertice");
const botaoAdicionarAresta = document.getElementById("adicionarAresta");

// 0- Não selecionado, 1- Adicionar vértice, 2- Conectar vértices
let option = 0;

botaoAdicionarVertice.addEventListener("click", () => {
	if(option == 0) {
		option = 1;
		botaoAdicionarVertice.classList.add("selected");
		return;
	}

	if(option == 1) {
		option = 0;
		botaoAdicionarVertice.classList.remove("selected");
		return;
	}

	if(option == 2) {
		option = 1;
		botaoAdicionarVertice.classList.add("selected");
		botaoAdicionarAresta.classList.remove("selected");
		return;
	}

});

botaoAdicionarAresta.addEventListener("click", () => {
	if(option == 0) {
		option = 2;
		botaoAdicionarAresta.classList.add("selected");
		return;
	}

	if(option == 1) {
		option = 2;
		botaoAdicionarAresta.classList.add("selected");
		botaoAdicionarVertice.classList.remove("selected");
		return;
	}

	if(option == 2) {
		option = 0;
		botaoAdicionarAresta.classList.remove("selected");
		return;
	}
});




export function adicionaPontos(points, vertices) {

	function adicionarVertice(clickX, clickY) {
		// Cria um novo ponto no canvas
		const novoPonto = document.createElement("div");
		novoPonto.classList.add("point");
		novoPonto.style.left = `${clickX}px`;
		novoPonto.style.top = `${clickY}px`;
		novoPonto.id = `point-${points.length + 1}`; // ID único para o ponto
		novoPonto.title = `id: ${points.length + 1}`;

		canvas.appendChild(novoPonto);

		// Adiciona o ponto à lista de pontos
		points.push({ id: points.length + 1, x: clickX, y: clickY });

		return;
	}

	/**
	 * Clique no canvas para adicionar um ponto
	 */
	const canvas = document.getElementById("canvas");
	canvas.addEventListener("click", (event) => {

		if(event.target === canvas) {
			//Adicionar novo ponto
			if(option == 1) {
				adicionarVertice(event.offsetX, event.offsetY);
			}

		}

	});

}


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

	/**
	 * Cria uma aresta entre dois pontos selecionados, verificando se esta já existe
	 */
	function linkVertices(startId, endId, start, end) {
		// Verifica se aresta existe
		if (vertices.some(v => (v.from === startId && v.to === endId) || (v.from === endId && v.to === startId))) {
			alert("A aresta entre esses pontos já existe.");
			return;
		}

		vertices.push({from: startId, to: endId});

		// Cria a linha SVG para a aresta
		const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
		const from = document.getElementById(`point-${startId}`);
		const to = document.getElementById(`point-${endId}`);

		line.setAttribute("x1", from.offsetLeft + from.offsetWidth/2 - 10);
		line.setAttribute("y1", from.offsetTop + from.offsetHeight/2 - 10);
		line.setAttribute("x2", to.offsetLeft + to.offsetWidth/2 - 10);
		line.setAttribute("y2", to.offsetTop + to.offsetHeight/2 - 10);
		line.setAttribute("stroke", "black");
		line.setAttribute("stroke-width", "1");
		line.dataset.from = startId;
		line.dataset.to = endId;

		document.getElementsByTagName("svg")[0].appendChild(line);

		limparSelecao(start, end);
		return;
	}
	

	div.addEventListener("click", () => {
		if(option == 1) {
			alert("Não foi possível adicionar ponto, já existe outro ponto no local.");
			return;
		}

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
			if(option == 0) {
				calcularCaminho(startId, endId, dijkstra, points, vertices);
				return;
			}
			if(option == 2) {
				linkVertices(startId, endId, start, end);
				
				return;
			}

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
