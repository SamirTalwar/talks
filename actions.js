(function() {
    var revealed = false,
        modeActions = {
            essay: function() { unreveal(); },
            presentation: function() { reveal(); },
            video: function() { unreveal(); }
        };

    function show(mode) {
        history.pushState({mode: mode}, '', '?mode=' + mode);
        $('body')
            .removeClass('essay')
            .removeClass('presentation')
            .removeClass('video')
            .addClass(mode);
        modeActions[mode]();
    }

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

    function unreveal() {
        if (revealed) {
            document.location.reload();
        }
    }

    function switchTo(mode) {
        return function(event) {
            event.preventDefault();
            show(mode);
        };
    }

    $('.action.show-essay').click(switchTo('essay'));
    $('.action.show-presentation').click(switchTo('presentation'));
    $('.action.show-video').click(switchTo('video'));

    $(document).ready(function() {
        var mode = Reveal.getQueryHash().mode;
        if (mode) {
            show(mode);
        }
    });
}());
