/**
 * @author Andreas Steiger <hallo@andreassteiger.de>
 */

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var currentBook = '',
    currentChapter = 1,
    lastChapterOfCurrentBook,
    pickerValues = [],
    chapterPicker,
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
    $voxbibelContentContainer = $('.volxbibel-content');
    $$('.navbar-book-title').hide();

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

    function createChapterPicker()  {
        return app.picker.create({
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
    }

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

            if (currentChapter == lastChapterOfCurrentBook) {
                $$('#toolbar-link-next').hide();
            }
        }

        // pickerDevice.setValue(currentChapter);
    }
});

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
        $contentContainer.find('p').each(function() {
            var paragraph = $(this).html(),
                index = paragraph.indexOf(' ');

            if(index !== -1) {
                var verse = paragraph.substring(0, index),
                    hyphenIndex = verse.indexOf('–');

                // check if it is verse range
                if(hyphenIndex !== -1) {
                    var verseStartNumber = verse.substring(0, hyphenIndex),
                        verseEndNumber =  verse.substring(hyphenIndex + 1, verse.length);

                    $(this).html('<span class="verse">' + verseStartNumber + '</span>- <span class="verse">' + verseEndNumber + '</span>' + paragraph.substring(index, paragraph.length));
                } else {
                    $(this).html('<span class="verse">' + verse + '</span>' + paragraph.substring(index, paragraph.length));
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