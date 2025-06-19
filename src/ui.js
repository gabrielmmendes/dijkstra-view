/**
 * Liga a lógica de clique nos pontos do canvas.
 */
export function selecionaPontos(div, calcularCaminho, dijkstra, points, vertices) {
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
				pontosSelecionados[1].id.replace("point-", ""),
                dijkstra, 
                points,
                vertices
			);
		}
	});
}
