import $ from 'jquery';

$(document).ready(function(){

  $(document).on('click', '#main-logo', function() {
    $('html, body').animate({
        scrollTop: $('.home-container').offset().top
    }, 1000);
  });
});

$(document).ready(function(){
  $(document).on('click', '.how-it-works a', function(event) {
    if (this.hash !== "") {
      event.preventDefault();
      var hash = this.hash;
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 800, function(){
        window.location.hash = hash;
      });
    }
  });
});
