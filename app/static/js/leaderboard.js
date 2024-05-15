function updateLeaderboard() {
  $.getJSON("/get-rankings", function (data) {
    var leaderboard = $("#leaderboard tbody");
    // leaderboard.empty(); // Clear existing rows

    $.each(data.rank_list, function (i, entry) {
      leaderboard.append(
        "<tr><td>" +
          (i + 1) +
          "</td><td>" +
          entry.username +
          "</td><td>" +
          entry.total_score +
          "</td></tr>"
      );
    });
  });
}

// Initial update
updateLeaderboard();
