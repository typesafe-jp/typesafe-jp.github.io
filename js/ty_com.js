$(function () {
    console.log("ty com js");
    $("#ty_header").load("ty_header.html", function () {
        var matchKey = window.location.pathname;
        menu_active(matchKey);
    });
    $("#ty_footer").load("ty_footer.html", function () {
        var myDate = new Date();
        var myYear = myDate.getFullYear();
        $("#cr_year").text(myYear);
    });
    $('#business_description_more_icon').addClass("glyphicon glyphicon-chevron-down");
    $('#business_description_more_target').css('display', 'none');
});

$(window).load(function () {
    var pageTop = $('#page-top');
    scroll_disaple();
    $(window).scroll(function () {
        scroll_disaple();
    });
    $(document).on('click', '#page-top', function () {
        $('html, body').animate({scrollTop: '0px'}, 600, 'swing');
    });
});

$(window).load(function () {
    var percent = 0,
        interval = 30,//it takes about 6s, interval=20 takes about 4s
        $bar = $('.transition-timer-carousel-progress-bar'),
        $crsl = $('#myCarousel'),
        $progress_bar_color_init = 0;

    $('.carousel-indicators li, .carousel-control').click(function () {
        $bar.css({width: 0.5 + '%'});
    });

    $('#myCarousel').carousel({//initialize
        interval: false,
        pause: true
    }).on('slide.bs.carousel', function () {
        percent = 0;
    });

    //This event fires immediately when the bootstrap slide instance method is invoked.
    function progressBarCarousel() {
        $bar.css({width: percent + '%'});
        percent = percent + 0.5;
        if (percent >= 100) {
            percent = 0;
            $crsl.carousel('next');
            $progress_bar_color_init = $progress_bar_color_init + 1;
            switch ($progress_bar_color_init) {
                case 1:
                    $bar.css({background: "#d17cff"});
                    break;
                case 2:
                    $bar.css({background: "#6fff4c"});
                    break;
                case 3:
                    $bar.css({background: "#5b9aff"});
                    $progress_bar_color_init = 0;
                    break;
            }
        }
    }

    var barInterval = setInterval(progressBarCarousel, interval);//set interval to progressBarCarousel function
    if (!(/Mobi/.test(navigator.userAgent))) {//tests if it isn't mobile
        $crsl.hover(function () {
                clearInterval(barInterval);
            },
            function () {
                barInterval = setInterval(progressBarCarousel, interval);
            }
        );
    }

});

function scroll_disaple() {
    var pageTop = $('#page-top');
    if (300 < $(this).scrollTop()) {
        pageTop.removeClass("page_top_hide").addClass("page_top_show");
        pageTop.fadeIn();
    } else {
        pageTop.removeClass("page_top_show").addClass("page_top_hide");
        pageTop.fadeOut();
    }
}

function menu_active(matchKey) {
    if (matchKey.indexOf("index") > 0 || matchKey.indexOf("html") < 0) {
        $("#myCarousel").show();
        $("#header_image").hide();
    } else {
        $("#myCarousel").hide();
        $("#header_image").show();
    }
    if (matchKey.indexOf("company") > 0) {
        $("#company").addClass("menu_active");
    }
    if (matchKey.indexOf("business") > 0) {
        $("#business").addClass("menu_active");
    }
    if (matchKey.indexOf("recruit") > 0) {
        $("#recruit").addClass("menu_active");
    }
    if (matchKey.indexOf("access") > 0 || matchKey.indexOf("inquire") > 0) {
        $("#access").addClass("menu_active");
    }
    if (matchKey.indexOf("article") > 0) {
        $("#header_image").toggle();
    } else {
        $("#header_top_second_nav_article").toggle();
    }
    if (matchKey.indexOf("inquire") > 0) {
        $("#header_image").toggle();
    } else {
        $("#header_top_second_nav_inquire").toggle();
    }

}

function block_toggle(target, active_icon) {
    $("#" + target).fadeToggle(800);
    $("#" + active_icon).toggleClass("glyphicon glyphicon-chevron-down").toggleClass("glyphicon glyphicon-chevron-up");
}
