(function() {
    var revealed = false;

    function reveal() {
        $('head').append('<link rel="stylesheet" href="vendor/reveal.js/css/reveal.min.css">');
        $('head').append('<link rel="stylesheet" href="vendor/reveal.js/css/theme/default.css" id="theme">');

        $('.title-slide').append($('header')[0]);

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

        $('.slides section').css('margin-top', '400px');

        revealed = true;
    }

    $('.action.show-essay').click(function(event) {
        event.preventDefault();
        $('body')
            .addClass('essay')
            .removeClass('presentation')
            .removeClass('video');

        if (revealed) {
            document.location.reload();
        }
    });

    $('.action.show-presentation').click(function(event) {
        event.preventDefault();
        $('body')
            .addClass('presentation')
            .removeClass('essay')
            .removeClass('video');
        reveal();
    });

    $('.action.show-video').click(function(event) {
        event.preventDefault();
        $('body')
            .addClass('video')
            .removeClass('essay')
            .removeClass('presentation');
    });
}());
