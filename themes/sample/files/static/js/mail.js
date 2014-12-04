$(function() {

  $('.mail-window .cancel-button').click(function() {
    $('.mail-window').fadeOut();
  });

  $('.mail-window .subscribe-button').click(function() {
    $('.mail-window').fadeOut();
  });

  $('.social-button.mail').click(function() {
    $('.mail-window').fadeIn();
  });

});
