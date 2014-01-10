
function fetch(cb) {
    var $wrap = $(".wrap");
    autoindex("http://i.johnweis.com/instagram/", function(err, imgs) {
        imgs.files.forEach(function(file) {
            $("<img />")
                .addClass('img scale')
                .attr('src', file.url)
                .attr('cross-origin', 'anonymous')
                .attr('crossOrigin', 'anonymous')
                .appendTo($wrap);
        });
        cb()
    });
}

function bind_click() {
    $(".wrap .img").click(function() {
        var $this = $(this);
        if (!$this.hasClass('zoom')) {
            lift($this);
        } else {
            drop($this);
        }
    });

    $(".background").click(function() {
        drop($(".wrap .img.zoom"));
    });
}

function lift($elem) {
    $(".wrap .img").not($elem).removeClass('zoom');
    $elem.addClass('zoom');

    var color = $elem.data('abColor');
    if (!color) color = "rgb(255,255,255)";
    $(".background").css('background-color', color).addClass('zoom');
}

function drop($elem) {
    $elem.removeClass('zoom');
    $('.background').removeClass('zoom').addClass('zooming');
    setTimeout(function() {
        $('.background').removeClass('zooming');
    }, 150);
}


function find_colors() {
    $.adaptiveBackground.run({
        selector: ".wrap .img",
        parent: false
    });
}

$(function() {
    fetch(function() {
        bind_click();
        find_colors();
    });
});