// Import scss into webpack entry point
import './index.scss';
import './js/bootstrap/config';
import 'jquery';
import 'knockout';
import './js/maps/initmap';

// Show and hide sidebar
$("#menu-toggle").click(function(e) {
    $("#display").toggleClass("toggled");
    e.preventDefault();
});
