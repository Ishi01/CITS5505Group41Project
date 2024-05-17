$(document).ready(function() {
  function updateLeaderboard() {
    // Retrieve the base URL from the data attribute
    var userProfileBaseUrl = $("#leaderboard-container").data("user-profile-base-url");

    $.getJSON("/get-rankings", function (data) {
      var leaderboardContainer = $("#leaderboard-container");
      leaderboardContainer.empty(); // Clear existing content

      $.each(data, function (game_name, entries) {
        // Create a new div for each game leaderboard
        var leaderboardDiv = $("<div>").addClass("leaderboard");

        // Create a new table for each game
        var table = $("<table>").addClass("table table-striped");
        var thead = $("<thead>");
        var tbody = $("<tbody>");
        
        thead.append(
          "<tr><th scope='col'>Rank</th><th scope='col'>Username</th><th scope='col'>Correct Answers</th><th scope='col'>Attempts</th><th scope='col'>Completion Time</th></tr>"
        );
        table.append(thead);

        $.each(entries, function (i, entry) {
          // Construct the profile URL using the base URL
          var profileUrl = userProfileBaseUrl + entry.username;
          tbody.append(
            "<tr><td>" +
            (i + 1) +
            "</td><td><a href='" + profileUrl + "'>" + entry.username + "</a></td><td>" +
            entry.correct_answers +
            "</td><td>" +
            entry.attempts +
            "</td><td>" +
            entry.completion_time +
            "</td></tr>"
          );
        });

        table.append(tbody);
        leaderboardDiv.append("<h3>" + game_name + "</h3>").append(table);
        leaderboardContainer.append(leaderboardDiv);
      });
    });
  }

  // Initial update
  updateLeaderboard();
});
