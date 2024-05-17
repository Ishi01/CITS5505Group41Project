function deleteGame(gameName) {
    if (confirm('Are you sure you want to delete this game?')) {
        fetch('/delete_game', {
            method: 'POST',
            body: new URLSearchParams({ 'game_name': gameName })
        })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error('Error:', error));
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch('/delete_user', {
            method: 'POST',
            body: new URLSearchParams({ 'user_id': userId })
        })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error('Error:', error));
    }
}
