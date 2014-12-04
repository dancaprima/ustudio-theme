window.Cues.loadTrack({
  cues: [{
    id: 'important-cue-label',
    start_time: 3,
    end_time: 20,
    data: {
      type: "html",
      html: "<div data-player-cue-onclick='remove,play' class='big-cue'>THIS IS IMPORTANT.</div>"
    }
  },
  {
    id: 'important-cue-pause',
    start_time: 3,
    end_time: 5,
    data: {
      type: "event",
      event: "Player.pause",
      arguments: []
    }
  },
  {
    id: 'outer-page-cue',
    start_time: 1,
    end_time: 5,
    data: {
      type: "event",
      event: "announceToPage",
      arguments: ["This is from inside the player"]
    }
  }
]
});
