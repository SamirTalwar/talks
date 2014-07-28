function slides() {
    $('head').append('<link rel="stylesheet" href="vendor/reveal.js/css/reveal.min.css">');
    $('head').append('<link rel="stylesheet" href="vendor/reveal.js/css/theme/default.css" id="theme">');
    Reveal.initialize({
        controls: true,
        progress: true,
        history: true,
        center: true,

        theme: Reveal.getQueryHash().theme,
        transition: Reveal.getQueryHash().transition || 'default'
    });
}

$('.enable-slides').click(function() {
    slides();
    $(this).hide();
});
