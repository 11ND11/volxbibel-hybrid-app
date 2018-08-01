// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var currentBook = '';
var currentChapter = 1;
var $voxbibelContentContainer;

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
    // Add default routes
    routes: [
        {
            name: 'detail',
            path: '/detail/',
            url: 'detail.html',
        },
    ],
    on: {
        // each object key means same name event handler
        pageInit: function (page) {
            if (page.name === 'detail') {
                $voxbibelContentContainer = $('.volxbibel-content');
                console.log(currentBook);

                updateWikiText($voxbibelContentContainer, currentBook);
            }

            $$('.links-list').find('a').on('click', function (e) {
                currentBook = $(this).data('book');
            });

            $$('#toolbar-link-prev').on('click', function (e) {
                currentChapter--;
                updateWikiText($voxbibelContentContainer, currentBook, currentChapter);
            });

            $$('#toolbar-link-next').on('click', function (e) {
                console.log(currentBook);
                currentChapter++;
                updateWikiText($voxbibelContentContainer, currentBook, currentChapter);
            });
        },
        popupOpen: function (popup) {
            // do something on popup open
        },
    },
});

var mainView = app.views.create('.view-main');

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
    console.log("Device is ready!");
    StatusBar.styleBlackOpaque();
});



// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
// app.on('PageInit', function (page) {
//
// });

function updateWikiText($contentContainer, book = '1.Mose', chapter = '1') {
    var url = 'https://wiki.volxbibel.com/api.php?action=query&prop=revisions&rvlimit=1&rvprop=content&format=json&titles=',
        volxbibelContent;

    $('.navbar-book-title').text(currentBook + ' ' + currentChapter);

    app.request.json(url + book + '_' + chapter, function (requestData) {
        console.log(requestData);

        volxbibelContent = getVolxbibelContent(requestData);
        volxbibelContent = removeMetaInfoFromContent(volxbibelContent);
        // format wiki text an bring it to the template
        $contentContainer.wikiText(volxbibelContent);
    });
}

function getVolxbibelContent(data) {
    var dataPage = Object.keys(data['query']['pages'])[0];
    console.log(dataPage);
    return data['query']['pages'][dataPage]['revisions'][0]['*'];
}

function removeMetaInfoFromContent(contentString) {
    return contentString.substring(contentString.indexOf("==="), contentString.length);
}
