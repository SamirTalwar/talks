function reveal() {
    $('head').append('<link rel="stylesheet" href="vendor/reveal.js/css/reveal.min.css">');
    $('head').append('<link rel="stylesheet" href="vendor/reveal.js/css/theme/default.css" id="theme">');

    Reveal.initialize({
        controls: true,
        progress: true,
        history: true,
        center: true,

        theme: Reveal.getQueryHash().theme || 'simple',
        transition: Reveal.getQueryHash().transition || 'linear',

        minScale: 1,
        maxScale: 1
    });
}

$('.enable-slides').click(function() {
    $(this).hide();
    $('.notes').hide();
    $('.slides-only').show();
    reveal();
    $('.slides section').css('margin-top', '400px');
});
