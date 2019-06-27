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
    storage = window.localStorage,
    settingsOverride,
    iOSDevice = false;

// default settings
// will be override by custom settings in local storage
var settings = {
    version : '2002', // 2.0.02
    startWithLastText : true,
    showNtFirst: true,
};

var textCollection = new textCollection;
var stage = new stage;

var app = new Framework7({
    root: '#app',
    name: 'Volxbibel',
    id: 'de.andreassteiger.volxbibel',
    panel: {
        swipe: '',
    },
    navbar: {
        hideOnPageScroll: true,
    },
    statusbar: {
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
        {
            name: 'support',
            path: '/support/',
            url: 'pages/support.html',
        },
    ],
    on: {
        // each object key means same name event handler
        pageInit: stage.init
    },
});

// create view
var mainView = app.views.create('.view-main');

// notification
var notificationAddText = app.notification.create({
        icon: '<img src="assets/icon.png" width="20"/>',
        title: 'DIE VOLXBIBEL',
        titleRightText: 'now',
        subtitle: 'Gespeichert',
        text: 'Zu "Meine Sprüche" hinzugefügt.',
        closeOnClick: true,
        closeTimeout: 3000
    }),
    notificationRemoveText = app.notification.create({
        icon: '<img src="assets/icon.png" width="20"/>',
        title: 'DIE VOLXBIBEL',
        titleRightText: 'now',
        subtitle: 'Weg damit',
        text: 'von "Meine Sprüche" entfernt.',
        closeOnClick: true,
        closeTimeout: 3000
    });

// handle Cordova device ready event
$$(document).on('deviceready', function () {
    StatusBar.overlaysWebView(false);
    StatusBar.styleDefault();
    StatusBar.backgroundColorByHexString("#FFFFFF");

    if (storage.lastAppRun != getTodaysDate()) {
        stage.showTextOfTheDay();
    }
    storage.setItem('lastAppRun', getTodaysDate());

    if (device.platform === 'iOS') {
        iOSDevice = true;
    }

    // Register the event listener
    document.addEventListener("backbutton", onBackKeyDown, false);
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

// Handle the back button
//
function onBackKeyDown() {
    mainView.router.back();
}