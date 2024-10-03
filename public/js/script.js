// JavaScript para o toggle do menu
document.getElementById('menu-toggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
});
document.addEventListener('DOMContentLoaded', function() {
    // Carregar eventos do backend
    fetch('/api/eventos')
        .then(response => response.json())
        .then(data => {
            const eventList = document.getElementById('event-list');
            eventList.innerHTML = ''; // Limpar lista de eventos antes de adicionar novos

            data.data.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.className = 'event-item';

                eventItem.innerHTML = `
                    <img src="${event.imagem_url}" alt="${event.nome}">
                    <div>
                        <h3>${event.nome}</h3>
                        <p>${event.descricao}</p>
                        <p>Tipo: ${event.tipo_ingresso} - Preço: R$ ${event.preco.toFixed(2)}</p>
                    </div>
                    <a href="evento${event.id}.html"><button>Saber Mais</button></a>
                `;

                eventList.appendChild(eventItem);
            });
        });
});