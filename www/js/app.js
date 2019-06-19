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
    touchTapWithoutMove = false,
    today = new Date(),
    firstStageInit = true,
    storage = window.localStorage;

var textCollection = new textCollection;
var stage = new stage;

var app = new Framework7({
    root: '#app',
    name: 'Volxbibel',
    id: 'de.andreassteiger.volxbibel',
    panel: {
        swipe: 'right',
    },
    navbar: {
        hideOnPageScroll: true,
    },
    statusbar: {
        iosBackgroundColor: '#ffffff',
        iosTextColor: 'black',
    },
    picker: {
        rotateEffect: true,
        openIn: 'popover',
    },
    routes: [
        {
            name: 'home',
            path: '/',
            url: './index.html',
        },
        {
            name: 'detail',
            path: '/detail/',
            url: 'pages/detail.html',
        },
        {
            name: 'settings',
            path: '/settings/',
            url: 'pages/settings.html',
        },
        {
            name: 'videos',
            path: '/videos/',
            url: 'pages/videos.html',
        },
        {
            name: 'podcasts',
            path: '/podcasts/',
            url: 'pages/podcasts.html',
        },
        {
            name: 'bookmarks',
            path: '/bookmarks/',
            url: 'pages/bookmarks.html',
        },
    ],
    on: {
        // each object key means same name event handler
        pageInit: stage.init
    },
});

// create view
var mainView = app.views.create('.view-main');

// handle Cordova device ready event
$$(document).on('deviceready', function () {
    StatusBar.overlaysWebView(true);
    StatusBar.backgroundColorByHexString('#ffffff');

    if (storage.lastAppRun != getTodaysDate()) {
        stage.showTextOfTheDay();
    }
    storage.setItem('lastAppRun', getTodaysDate());
});

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
    return yyyy + '-' + mm + '-' + dd;
}