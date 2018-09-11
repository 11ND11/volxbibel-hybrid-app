/**
 * @author Andreas Steiger <hallo@andreassteiger.de>
 */

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var currentBook = '',
    currentChapter = 1,
    currentWikiUrl = '',
    lastChapterOfCurrentBook,
    pickerValues = [],
    chapterPicker,
    $voxbibelContentContainer,
    touchTapWithoutMove = false,
    today = new Date(),
    firstPageInit = true;

// Initialize app
var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'My App',
    // App id
    id: 'com.myapp.test',
    // Enable swipe panel
    panel: {
        swipe: 'left',
    },
    // Configure status bar
    statusbar: {
        iosBackgroundColor: '#f68e5d',
        iosTextColor: 'black',
    },
    picker: {
        rotateEffect: true,
        openIn: 'popover',
    },
    // Add default routes
    routes: [
        {
            name: 'detail',
            path: '/detail/',
            url: 'detail.html',
        },
        {
            name: 'about',
            path: '/about/',
            url: 'about.html',
        },
    ],
    on: {
        // each object key means same name event handler
        pageInit: function (page) {
            if (firstPageInit) {
                $('.ios .page-content').scrollTop(40);
                firstPageInit = false;
            }
            $$('.links-list').find('a').on('click', function (e) {
                currentBook = $(this).data('book');
                currentChapter = 1;
            });

            var searchbar = app.searchbar.create({
                el: '.searchbar',
                searchContainer: '.list',
                searchIn: 'a',
                on: {
                    search(sb, query, previousQuery) {
                        // ...
                    }
                }
            });

            $$('[data-action="textoftheday"]').on('click', function () {
                showTextOfTheDay();
            });
            $('.text-of-the-day .button-close').on('click', function () {
                $('.text-of-the-day').fadeOut();
            });
        }
    },
});

var mainView = app.views.create('.view-main');

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
    StatusBar.overlaysWebView(true);
    StatusBar.backgroundColorByHexString('#f68e5d');
    StatusBar.styleLightContent();

    if (window.localStorage.lastAppRun != getTodaysDate()) {
        showTextOfTheDay();
    }
    window.localStorage.setItem('lastAppRun', getTodaysDate());

    // navigator.splashscreen.hide();
});

// Detail page
$$(document).on('page:afterin', '.page[data-name="detail"]', function (e) {
    $$('.navbar-book-title').show();
});

$$(document).on('page:beforeout', '.page[data-name="detail"]', function (e) {
    $$('.navbar-book-title').hide();
});

$$(document).on('page:init', '.page[data-name="detail"]', function (e) {
    $voxbibelContentContainer = $('.volxbibel-content');
    $$('.navbar-book-title').hide();

    if (!window.localStorage.hideTutorial) {
        showTutorial();
        window.localStorage.setItem('hideTutorial', 'true');
    }

    app.request.json("bibleChapterCount.json", function (data) {
        $$('#toolbar-link-prev').hide();
        pickerValues = [];
        for (var iterator = 1;
             iterator <= data[currentBook];
             iterator++) {
            pickerValues.push('Kapitel ' + iterator);
            lastChapterOfCurrentBook = iterator;
        }

        chapterPicker = createChapterPicker();

        updateDetailView($voxbibelContentContainer, currentBook);
    });

    $$('#toolbar-link-prev').on('click', function (e) {
        currentChapter--;
        updateDetailView($voxbibelContentContainer, currentBook, currentChapter);
    });

    $$('#toolbar-link-next').on('click', function (e) {
        currentChapter++;
        updateDetailView($voxbibelContentContainer, currentBook, currentChapter);
    });

    function createChapterPicker() {
        return app.picker.create({
            inputEl: '#picker-chapter',
            cols: [
                {
                    textAlign: 'center',
                    values: pickerValues
                }
            ],
            on: {
                closed: function () {
                    var selectedChapterString = this.value.toString();
                    var selectedChapter = selectedChapterString.replace('Kapitel ', '');
                    updateDetailView($voxbibelContentContainer, currentBook, selectedChapter);
                }
            }
        });
    }

    function updateDetailView($contentContainer, book, chapter = '1') {
        updateWikiText($contentContainer, book, chapter);
        if (currentChapter > 1) {
            $$('#toolbar-link-prev').show();

            if (currentChapter >= lastChapterOfCurrentBook) {
                $$('#toolbar-link-next').hide();
            } else {
                $$('#toolbar-link-next').show();
            }
        }
        if (currentChapter <= 1) {
            $$('#toolbar-link-prev').hide();

            if (currentChapter == lastChapterOfCurrentBook) {
                $$('#toolbar-link-next').hide();
            }
        }

        // pickerDevice.setValue(currentChapter);
    }
});

function updateWikiText($contentContainer, book, chapter = '1') {
    var volxbibelContent;
    var currentWikiUrlJson = 'https://wiki.volxbibel.com/api.php?action=query&prop=revisions&rvlimit=1&rvprop=content&format=json&titles=' + book + '_' + chapter;
    currentWikiUrl = 'https://wiki.volxbibel.com/' + book + '_' + chapter;

    // $$('.volxbibel-content p').unbind("click");
    // show loading spinner
    $contentContainer.html('<div class="spinner"><div class="dot1"></div><div class="dot2"></div></div>');

    currentChapter = chapter;
    setNavbarTitle(book, chapter);

    app.request.json(currentWikiUrlJson, function (requestData) {
        volxbibelContent = getVolxbibelContent(requestData);
        volxbibelContent = removeMetaInfoFromContent(volxbibelContent);
        // todo: hack to beautify "Apostelgeschichte"
        if (book === 'Apostelgeschichte') {
            volxbibelContent = volxbibelContent.replace('[[#fn1|<sup>*</sup>]]', '*');
            volxbibelContent = volxbibelContent.replace('[[#fn2|<sup>**</sup>]]', '**');
            volxbibelContent = volxbibelContent.replace('<sup id="fn1">', '');
            volxbibelContent = volxbibelContent.replace('<sup id="fn2">', '');
        }
        // format wiki text and bring it to the template
        $contentContainer.wikiText(volxbibelContent);
        // wrap verses with span
        $contentContainer.find('p').each(function () {
            var paragraph = $(this).html(),
                index = paragraph.indexOf(' ');

            if (index !== -1) {
                var verse = paragraph.substring(0, index),
                    hyphenIndex = verse.indexOf('–');

                // check if it is verse range
                if (hyphenIndex !== -1) {
                    var verseStartNumber = verse.substring(0, hyphenIndex),
                        verseEndNumber = verse.substring(hyphenIndex + 1, verse.length);

                    $(this).html('<span class="verse">' + verseStartNumber + '</span>- <span class="verse">' + verseEndNumber + '</span><span class="vb-text">' + paragraph.substring(index, paragraph.length) + '</span>');
                } else {
                    $(this).html('<span class="verse">' + verse + '</span><span class="vb-text">' + paragraph.substring(index, paragraph.length) + '</span>');
                }
            }
        });
        $contentContainer.addClass('content-is-ready');
        $$('.volxbibel-content p').on("touchstart", function (e) {
            touchTapWithoutMove = true;
        });
        $$('.volxbibel-content .vb-text').on("touchmove", function () {
            touchTapWithoutMove = false;
        });
        $$('.volxbibel-content .vb-text').on("touchend", function () {
            if (touchTapWithoutMove === true) {
                var shareIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z"/></svg>\n' +
                    '<!--\n' +
                    'Font Awesome Pro 5.2.0 by @fontawesome - https://fontawesome.com\n' +
                    'License - https://fontawesome.com/license (Commercial License)\n' +
                    '-->';
                var verseText = $(this).text().substring(1, $(this).text().length);
                var currentVerse = $(this).siblings('.verse').text();
                if ($(this).siblings('.verse').length > 1) {
                    currentVerse = '';
                    $(this).siblings('.verse').each(function () {
                        currentVerse += $(this).text() + '-'
                    });
                    currentVerse = currentVerse.substring(3, currentVerse.length - 1)
                }

                $(this).parent().removeClass('animated');
                $contentContainer.find('p').removeClass('animated');

                if ($(this).parent().hasClass('active')) {
                    $(this).parent().removeClass('active');
                    $(this).parent().addClass('animated');
                    $contentContainer.find('.action-button').remove();
                } else {
                    $contentContainer.find('p').removeClass('active');
                    $contentContainer.find('.action-button').remove();
                    $(this).parent().addClass('active').prepend('<a href="" data-action="share" class="action-button button button-circle">' + shareIcon + '</a>');

                    setTimeout(function () {
                        $('.action-button[data-action="share"]').addClass('scale').on('click', function (e) {
                            var $message = verseText + ' (' + currentBook + ' ' + currentChapter + ',' + Number.parseInt(currentVerse) + ' | Die Volxbibel)\n' + currentWikiUrl;
                            // alert($message);
                            // console.log($message);
                            startShareAction('Aus der Volxbibel...', $message, 'Teile diesen Vers');
                        });
                    }, 100);
                }
            }
        });

    }, function (xhr, status) {
        // alert(xhr.statusText + 'xxx' + status);
        $contentContainer.html(
            '<span class="connection-error-icon">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"/></svg>\n' +
            '<!--\n' +
            'Font Awesome Pro 5.2.0 by @fontawesome - https://fontawesome.com\n' +
            'License - https://fontawesome.com/license (Commercial License)\n' +
            '-->' +
            '</span>' +
            '<span class="error-text">Die Texte konnten momentan leider nicht geladen werden.<br>Kann es sein, dass du keine Verbindung zum Internet hast?<br>Versuche es einfach noch einmal.</span>'
        );
    });

    function startShareAction($subject, $message, $title) {
        // this is the complete list of currently supported params you can pass to the plugin (all optional)
        var options = {
            message: $message, // not supported on some apps (Facebook, Instagram)
            subject: $subject, // fi. for email
            files: null,
            url: null
            // chooserTitle: $title, // Android only, you can override the default share sheet title,
            // appPackageName: 'de.andreassteiger.volxbibel' // Android only, you can provide id of the App you want to share with
        };

        var onSuccess = function (result) {
            // alert("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
            // console.log("Shared to app: " + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
        };

        var onError = function (msg) {
            // alert("Sharing failed with message: " + msg);
        };

        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    }
}

function getVolxbibelContent(data) {
    var dataPage = Object.keys(data['query']['pages'])[0];
    return data['query']['pages'][dataPage]['revisions'][0]['*'];
}

function getVerseOfCurrentDay(data) {
    var today = getTodaysDate();
    return data[1]['dates'][today]['text'] + '<span class="text-of-the-day-verse">' + data[1]['dates'][today]['bibleverses'] + '</span>';
}

function removeMetaInfoFromContent(contentString) {
    return contentString.substring(contentString.indexOf("==="), contentString.length);
}

function setNavbarTitle(book, chapter) {
    $('.navbar-book-title').text(book + ' ' + chapter);
}

function getTodaysDate() {
    var dd = today.getDate(),
        mm = today.getMonth() + 1, // January is 0!
        yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    console.log(yyyy + '-' + mm + '-' + dd);
    return yyyy + '-' + mm + '-' + dd;
}

function showTutorial() {
    $('.tutorial-overlay').fadeIn();
    $('.tutorial-overlay .button').on('click', function () {
        $('.tutorial-overlay').fadeOut();
    });
}

function showTextOfTheDay() {
    app.request.json('https://admin.citychurch.de/twitturgie/volxbibel/json/volxbibellosung.json', function (requestData) {
        console.log(requestData);
        console.log(getVerseOfCurrentDay(requestData));

        $$('.text-of-the-day-content').html(getVerseOfCurrentDay(requestData));

        $('.text-of-the-day').fadeIn();
        $('.text-of-the-day svg').addClass('animate');
    });
}