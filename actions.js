(function() {
    var revealed = false,
        theme = 'white',
        modeActions = {
            essay: function() { unreveal(); },
            presentation: function() { reveal(); },
            video: function() { unreveal(); }
        };

    function show(mode) {
        $('body')
            .removeClass('essay')
            .removeClass('presentation')
            .removeClass('video')
            .addClass(mode);
        modeActions[mode]();
    }

    function switchTo(mode) {
        return function(event) {
            event.preventDefault();
            history.pushState({mode: mode}, '', '?mode=' + mode);
            show(mode);
        };
    }

    function reveal() {
        $('head').append('<link rel="stylesheet" href="vendor/reveal.js/css/reveal.css">');
        $('head').append('<link rel="stylesheet" href="vendor/reveal.js/css/theme/' + theme + '.css" id="theme">');

        $('.title-slide').append($('header')[0]);

        Reveal.initialize({
            controls: true,
            progress: true,
            history: true,
            center: true,

            theme: Reveal.getQueryHash().theme || theme,
            transition: Reveal.getQueryHash().transition || 'linear',

            minScale: 1,
            maxScale: 1
        });

        revealed = true;
    }

    function unreveal() {
        if (revealed) {
            document.location.reload();
        }
    }

    $('.action.show-essay').click(switchTo('essay'));
    $('.action.show-presentation').click(switchTo('presentation'));
    $('.action.show-video').click(switchTo('video'));

    $(window).on('popstate', function(event) {
        if (event.originalEvent.state && event.originalEvent.state.mode) {
            show(event.originalEvent.state.mode);
        }
    });

    $(document).ready(function() {
        var mode = Reveal.getQueryHash().mode;
        if (mode) {
            show(mode);
        }
    });
}());
