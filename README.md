# Infetti V6
Corrected Google Sheets live-data build.

- Clean hero photograph: no website screenshot/UI baked into image
- Hero wording remains real HTML text
- PNG league/team logos
- Google Sheet live data
- League table calculated from Played fixtures
- Fixtures/results/scorers/POTG/KOTG read from the Sheet

Deploy by replacing the files in the existing GitHub Pages repository with the contents of this ZIP.
Keep the spreadsheet shared as Anyone with the link — Viewer.
Do not rename spreadsheet tabs or headers.

## V7 addition
Completed match results now show goal scorers directly underneath each game.
The website matches GOALS rows to results using MATCH ID, so use the same MATCH ID in GOALS as in FIXTURES.
Example: L001 | League | John Borg | La Famiglia AFC | 2

## V8 fixes
- Goal scorers are matched to completed results using normalized MATCH ID and TEAM values.
- Each completed result shows Matchweek, match date and kickoff time.
- Google Sheet date/time values are normalized for display.

## V9 addition
Completed results also show Player of the Game and Keeper of the Game.
These are read from AWARDS by matching MATCH ID and Competition = League.

## V10
Results redesigned as premium match cards:
- prominent date and kickoff time
- team logos/names and full-time score
- goalscorers under the score
- Player of the Game
- Keeper of the Game
Awards now match by MATCH ID directly.
