var TOUR_DATES = [
  {
    'date': '09/14',
    'city': 'Sacremento, CA',
    'venue': 'Aftershock Festival',
    'tickets': 'http://www.aftershockconcert.com/tickets.html'
  },
  {
    'date': '09/17',
    'city': 'Los Angeles, CA',
    'venue': 'The Wiltern',
    'tickets': false
  },
  {
    'date': '09/17',
    'city': 'La Jolla, CA',
    'venue': 'RIMAC Arena',
    'tickets': 'http://www.ticketmaster.com/event/0A004CD1CAAF5D76'
  },
  {
    'date': '09/19',
    'city': 'Oakland, CA',
    'venue': 'Fox Theater',
    'tickets': 'http://www.ticketmaster.com/event/1C004CCCC150AA90'
  },
  {
    'date': '09/21',
    'city': 'Denver, CO',
    'venue': 'Riot Fest Denver',
    'tickets': 'http://www.ticketfly.com/purchase/event/577753'
  },
  {
    'date': '09/22',
    'city': 'Kansas City, MO',
    'venue': 'Uptown Theater',
    'tickets': 'http://www.ticketmaster.com/event/06004CC9F48C3B61'
  },
  {
    'date': '09/23',
    'city': 'St. Louis, MO',
    'venue': 'The Pageant',
    'tickets': 'http://www.ticketmaster.com/event/06004CD0D43B321E'
  },
  {
    'date': '09/25',
    'city': 'Cleveland, OH',
    'venue': 'Jacobs Pavilion',
    'tickets': 'http://www.ticketmaster.com/event/05004CD2C8FC438F'
  },
  {
    'date': '09/26',
    'city': 'New York, NY',
    'venue': 'Best Buy Theater',
    'tickets': false
  },
  {
    'date': '09/26',
    'city': 'Baltimore, MD',
    'venue': 'The Shindig Festival',
    'tickets': true
  },
  {
    'date': '09/27',
    'city': 'Boston, MA',
    'venue': 'House of Blues',
    'tickets': true
  },
  /*
  9/30/2014 Montclair, NJ The Wellmont Theatre  Tickets Touche Amore & Radkey
  10/1/2014 Upper Darby, PA Tower Theatre Tickets Touche Amore & Radkey
  10/3/2014 Atlanta, GA The Tabernacle  Tickets Touche Amore & Radkey
  10/4/2014 Orlando, FL House of Blues Orlando  Tickets Touche Amore & Radkey
  10/5/2014 St. Petersburg, FL  Jannus Live Tickets Touche Amore & Radkey
  */
];

(function() {
  for (var i = 0; i < TOUR_DATES.length; i++) {
    var tour_date = TOUR_DATES[i];
    var tickets = 'sold out';
    if (tour_date.tickets) {
      tickets = '<a href="' + tour_date.tickets + '" target="_blank">tickets</a>';
    }
    $('.tour-dates').append(
      '<li><p class="location"><span class="city">' + tour_date.city + '</span>' +
      '<span class="venue">' + tour_date.venue + '</span></p>' +
      '<p class="details"><span class="date">' + tour_date.date + '</span>' +
      '<span class="tickets">' + tickets + '</span></p></li>'
    );
  }

  $('.close-tour-window').click(function() {
    $('.tour-window').animate({'margin-left': '-110%'});
  });

  $('.social-button.tour').click(function() {
    $('.tour-window').css({'margin-left': '-110%', 'display': 'block'});
    $('.tour-window').animate({'margin-left': '0%'});
  });
})();
