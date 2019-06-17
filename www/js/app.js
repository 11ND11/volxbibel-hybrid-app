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

var stage = new stage();

var app = new Framework7({
    root: '#app',
    name: 'Volxbibel',
    id: 'de.andreassteiger.volxbibel',
    panel: {
        swipe: 'left',
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
            name: 'detail',
            path: '/detail/',
            url: 'detail.html',
        },
        {
            name: 'settings',
            path: '/settings/',
            url: 'settings.html',
        },
        {
            name: 'videos',
            path: '/videos/',
            url: 'videos.html',
        },
        {
            name: 'podcasts',
            path: '/podcasts/',
            url: 'podcasts.html',
        },
        {
            name: 'bookmarks',
            path: '/bookmarks/',
            url: 'bookmarks.html',
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
    StatusBar.styleLightContent();

    if (window.localStorage.lastAppRun != getTodaysDate()) {
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