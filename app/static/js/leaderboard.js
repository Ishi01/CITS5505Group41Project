function updateLeaderboard() {
    $.getJSON('/get-rankings', function(data) {
        var leaderboard = $('#leaderboard');
        leaderboard.find('tr:gt(0)').remove(); // Remove all rows except the header
        $.each(data.rankings, function(i, ranking) {
            leaderboard.append('<tr><td>' + ranking.rank + '</td><td>' + ranking.username + '</td><td>' + ranking.score + '</td></tr>');
        });
    });
}

// Update the leaderboard every 5 seconds
setInterval(updateLeaderboard, 5000);