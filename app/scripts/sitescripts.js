/**
 * Created by Eric on 5/7/2015.
 */
'use strict';

$(document).ready(function () {

  var menu = $('.bluerecnav');
  var origOffsetY = menu.offset().top + 150;

  //console.log('Offset:' + origOffsetY);

  function scroll() {
    if ($(window).scrollTop() >= origOffsetY) {
      $('.bluerecnav').addClass('navbar-fixed-top');
      $('.maincontent').addClass('menu-padding');
    } else {
      $('.bluerecnav').removeClass('navbar-fixed-top');
      $('.maincontent').removeClass('menu-padding');
    }


  }

  document.onscroll = scroll;

});
