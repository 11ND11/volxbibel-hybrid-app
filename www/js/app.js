/**
 * @author Andreas Steiger <hallo@andreassteiger.de>
 */

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var currentBook = '',
    currentChapter = 1,
    lastChapterOfCurrentBook,
    pickerValues = [],
    $voxbibelContentContainer;

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
            $$('.links-list').find('a').on('click', function (e) {
                currentBook = $(this).data('book');
                currentChapter = 1;
            });
        }
    },
});

var mainView = app.views.create('.view-main');

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
    console.log("Device is ready!");
});

// Detail page
$$(document).on('page:afterin', '.page[data-name="detail"]', function (e) {
    $$('.navbar-book-title').show();
});

$$(document).on('page:beforeout', '.page[data-name="detail"]', function (e) {
    $$('.navbar-book-title').hide();
});

$$(document).on('page:init', '.page[data-name="detail"]', function (e) {
    app.request.json("bibleChapterCount.json", function (data) {
        $$('#toolbar-link-prev').hide();
        pickerValues = [];
        for (var iterator = 1;
             iterator <= data[currentBook];
             iterator++) {
            pickerValues.push('Kapitel ' + iterator);
            lastChapterOfCurrentBook = iterator;
        }

        var pickerDevice = app.picker.create({
            inputEl: '#picker-chapter',
            cols: [
                {
                    textAlign: 'center',
                    values: pickerValues,
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

    });

    $voxbibelContentContainer = $('.volxbibel-content');
    $$('.navbar-book-title').hide();

    updateDetailView($voxbibelContentContainer, currentBook);

    $$('#toolbar-link-prev').on('click', function (e) {
        currentChapter--;
        updateDetailView($voxbibelContentContainer, currentBook, currentChapter);
    });

    $$('#toolbar-link-next').on('click', function (e) {
        currentChapter++;
        updateDetailView($voxbibelContentContainer, currentBook, currentChapter);
    });

    function updateDetailView($contentContainer, book, chapter = '1') {
        updateWikiText($contentContainer, book, chapter);

        if (currentChapter > 1) {
            $$('#toolbar-link-prev').show();

            if (currentChapter >= lastChapterOfCurrentBook) {
                console.log('ende!');
                $$('#toolbar-link-next').hide();
            } else {
                $$('#toolbar-link-next').show();
            }
        }
        if (currentChapter <= 1) {
            $$('#toolbar-link-prev').hide();
        }

        // pickerDevice.setValue(currentChapter);
    }
});

// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
// app.on('PageInit', function (page) {
//
// });


function updateWikiText($contentContainer, book, chapter = '1') {
    var url = 'https://wiki.volxbibel.com/api.php?action=query&prop=revisions&rvlimit=1&rvprop=content&format=json&titles=',
        volxbibelContent;
    $contentContainer.html('<div class="spinner"><div class="dot1"></div><div class="dot2"></div></div>');

    currentChapter = chapter;

    setNavbarTitle(book, chapter);
    app.request.json(url + book + '_' + chapter, function (requestData) {
        console.log(requestData);

        volxbibelContent = getVolxbibelContent(requestData);
        volxbibelContent = removeMetaInfoFromContent(volxbibelContent);
        // format wiki text an bring it to the template
        $contentContainer.wikiText(volxbibelContent);
    }, function (error, status) {
        alert(error + 'xxx' + status);
    });
}

function getVolxbibelContent(data) {
    var dataPage = Object.keys(data['query']['pages'])[0];
    console.log('page: ' + dataPage);
    return data['query']['pages'][dataPage]['revisions'][0]['*'];
}

function removeMetaInfoFromContent(contentString) {
    return contentString.substring(contentString.indexOf("==="), contentString.length);
}

function setNavbarTitle(book, chapter) {
    $('.navbar-book-title').text(book + ' ' + chapter);
}