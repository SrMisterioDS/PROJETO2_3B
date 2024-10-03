document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('event-list');

    function loadEvents() {
        fetch('/api/meus-eventos') // Rota para pegar eventos do fornecedor
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Sucesso') {
                    displayEvents(data.data);
                } else {
                    console.error('Erro ao carregar eventos:', data.error);
                }
            })
            .catch(error => {
                console.error('Erro ao carregar eventos:', error);
            });
    }

    function displayEvents(events) {
        eventList.innerHTML = '';

        events.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';

            const eventImage = document.createElement('img');
            eventImage.src = event.imagem_url || 'default-image.png';
            eventImage.alt = event.nome || 'Imagem do Evento';

            const eventDetails = document.createElement('div');
            const eventName = document.createElement('h3');
            eventName.textContent = event.nome || 'Nome não disponível';

            const eventDescription = document.createElement('p');
            eventDescription.textContent = event.descricao || 'Descrição não disponível';

            const eventPrice = document.createElement('p');
            eventPrice.textContent = `Preço: R$ ${event.preco}`;

            const eventButtonEdit = document.createElement('a');
            eventButtonEdit.href = `editar-evento.html?id=${event.id}`;
            eventButtonEdit.innerHTML = '<button>Editar Evento</button>';

            const eventButtonDelete = document.createElement('button');
            eventButtonDelete.textContent = 'Excluir';
            eventButtonDelete.addEventListener('click', () => {
                if (confirm('Você tem certeza que deseja excluir este evento?')) {
                    fetch(`/api/eventos/${event.id}`, { method: 'DELETE' })
                        .then(response => response.json())
                        .then(data => {
                            if (data.message === 'Evento deletado com sucesso!') {
                                alert('Evento deletado com sucesso!');
                                loadEvents(); // Recarregar eventos
                            } else {
                                alert('Erro ao deletar evento.');
                            }
                        });
                }
            });

            eventDetails.appendChild(eventName);
            eventDetails.appendChild(eventDescription);
            eventDetails.appendChild(eventPrice);
            eventItem.appendChild(eventImage);
            eventItem.appendChild(eventDetails);
            eventItem.appendChild(eventButtonEdit);
            eventItem.appendChild(eventButtonDelete);

            eventList.appendChild(eventItem);
        });
    }

    loadEvents();
});
