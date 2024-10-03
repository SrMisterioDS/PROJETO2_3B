document.addEventListener('DOMContentLoaded', () => {
    const eventDetailsSection = document.getElementById('event-details');
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        eventDetailsSection.innerHTML = '<p>Evento não encontrado.</p>';
        return;
    }

    fetch(`/api/eventos/${eventId}`)
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Successo' && data.data) {
                const event = data.data;

                eventDetailsSection.innerHTML = `
                    <h2>${event.nome}</h2>
                    <img src="${event.imagem_url}" alt="${event.nome}">
                    <p>${event.descricao}</p>
                    <p>Tipo de Ingresso: ${event.tipo_ingresso}</p>
                    <p>Quantidade Disponível: ${event.quantidade_ingressos}</p>
                    <p>Preço: R$ ${event.preco.toFixed(2)}</p>
                    <button>Comprar Ingresso</button>
                `;
            } else {
                eventDetailsSection.innerHTML = '<p>Evento não encontrado.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao carregar detalhes do evento:', error);
            eventDetailsSection.innerHTML = '<p>Erro ao carregar detalhes do evento.</p>';
        });
});
