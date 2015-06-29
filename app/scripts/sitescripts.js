/**
 * Created by Eric on 5/7/2015.
 */
'use strict';

$(document).ready(function () {

    var menu = $('.bluerecnav');
     var origOffsetY = menu.offset().top + 0;

     //console.log('Offset:' + origOffsetY);

     function scroll() {
     if ($(window).scrollTop() > origOffsetY) {
     $('.bluerecnavhidden').addClass('bluerecnavhidden2');

     } else {
     $('.bluerecnavhidden').removeClass('bluerecnavhidden2');
     }

     }

     document.onscroll = scroll;

});
