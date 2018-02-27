// Import scss into webpack entry point
import './index.scss';
import 'jquery';
import './js/bootstrap/config';
import 'knockout';

// Show and hide sidebar
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#display").toggleClass("toggled");
});
