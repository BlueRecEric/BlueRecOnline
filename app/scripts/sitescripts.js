/**
 * Created by Eric on 5/7/2015.
 */
'use strict';

$(document).ready(function() {

    $('#nav').affix({
        offset: {
            top: $('header').height()
        }
    });
    $('#nav').on('affix.bs.affix', function () {
        var navHeight = $('.navbar').outerHeight(true);

        $('#nav + .container').css('margin-top', navHeight);
    });
    $('#nav').on('affix-top.bs.affix', function () {
        $('#nav + .container').css('margin-top', 0);
    });


    $('#sidebar').affix({
        offset: {
            top: 17
        }
    });

});