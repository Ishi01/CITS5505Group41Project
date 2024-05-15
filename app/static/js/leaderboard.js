function updateLeaderboard() {
  $.getJSON("/get-rankings", function (data) {
    var leaderboard = $("#leaderboard tbody");
    leaderboard.find("tr").remove(); // Remove all rows
    $.each(data.rankings, function (i, ranking) {
      leaderboard.append(
        "<tr><td>" +
          (i + 1) +
          "</td><td>" +
          ranking.username +
          "</td><td>" +
          ranking.total_score +
          "</td></tr>"
      );
    });
  });
}

// Update the leaderboard every 5 seconds
setInterval(updateLeaderboard, 5000);

// Initial update
updateLeaderboard();
