/**
 * @author Andreas Steiger <hallo@andreassteiger.de>
 */

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

// initialize app
var app = new Framework7({
    // app root element
    root: '#app',
    // app Name
    name: 'Volxbibel',
    // app id
    id: 'de.andreassteiger.volxbibel',
    // enable swipe panel
    panel: {
        swipe: 'left',
    },
    // configure status bar
    statusbar: {
        iosBackgroundColor: '#f68e5d',
        iosTextColor: 'black',
    },
    picker: {
        rotateEffect: true,
        openIn: 'popover',
    },
    // add default routes
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

// handle Cordova device ready event
$$(document).on('deviceready', function () {
    StatusBar.overlaysWebView(true);
    StatusBar.backgroundColorByHexString('#f68e5d');
    StatusBar.styleLightContent();

    if (window.localStorage.lastAppRun != getTodaysDate()) {
        showTextOfTheDay();
    }
    window.localStorage.setItem('lastAppRun', getTodaysDate());
});