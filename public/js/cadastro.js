// No seu JavaScript (cadastro.js)
document.getElementById('cadastroeventoform').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar o envio padrão do formulário

    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;

    });

        fetch('/api/cadastrar_evento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {            
            if (result.redirect) {
                window.location.href = result.redirect;
            } else {
                alert(result.error || 'Erro desconhecido.'); // Mostrar erro se ocorrer
                window.location.href = '/dashboard-fornecedor.html'; // Redireciona
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao cadastrar. Tente novamente mais tarde.');
        });
    });

