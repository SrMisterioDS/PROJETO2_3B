document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('event-list');

    function loadEvents() {
        fetch('/api/eventos')
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

            const eventButton = document.createElement('a');
            eventButton.href = `evento-detalhes.html?id=${event.id}`;
            eventButton.innerHTML = '<button>Saber Mais</button>';

            eventDetails.appendChild(eventName);
            eventDetails.appendChild(eventDescription);
            eventDetails.appendChild(eventButton);
            eventItem.appendChild(eventImage);
            eventItem.appendChild(eventDetails);

            eventList.appendChild(eventItem);
        });
    }

    loadEvents();
});
