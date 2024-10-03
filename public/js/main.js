document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('event-list');

    function loadEvents() {
        fetch('/api/eventos') // Chame sua API para obter os eventos
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

            const eventDate = document.createElement('p');
            const date = event.data ? new Date(event.data).toLocaleDateString('pt-BR') : 'Data não disponível';
            eventDate.textContent = `Data: ${date}`;

            const eventButton = document.createElement('a');
            eventButton.href = `compra.html?id=${event.id}`; // Link para a página de compra
            eventButton.innerHTML = '<button>Saber Mais</button>'; // Botão para saber mais

            eventDetails.appendChild(eventName);
            eventDetails.appendChild(eventDescription);
            eventDetails.appendChild(eventDate);
            eventDetails.appendChild(eventButton);
            eventItem.appendChild(eventImage);
            eventItem.appendChild(eventDetails);

            eventList.appendChild(eventItem);
        });
    }

    loadEvents();
});
