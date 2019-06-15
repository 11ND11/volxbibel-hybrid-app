/**
 * Module: VOLXBIBEL/Stage
 */

var stage = (function () {

    // cache DOM
    var $$navbarBookTitle = $$('.navbar-book-title'),
        $$openPanelButton = $$('.panel-open');

    // bind events

    // bind page events
    $$(document).on('page:init', '.page[data-name="detail"]', detailPageInit);


    /**
     * @private
     *
     * @return void
     */
    function detailPageInit() {
        var $voxbibelContentContainer = $('.volxbibel-content'),
            $$prevButton = $$('#toolbar-link-prev'),
            $$nextButton = $$('#toolbar-link-next');

        $$navbarBookTitle.hide();

        if (!storage.hideTutorial) {
            showTutorial();
            storage.setItem('hideTutorial', 'true');
        }

        app.request.json("bibleChapterCount.json", function (data) {
            $$prevButton.hide();
            pickerValues = [];
            for (var iterator = 1;
                 iterator <= data[currentBook];
                 iterator++) {
                pickerValues.push('Kapitel ' + iterator);
                lastChapterOfCurrentBook = iterator;
            }

            chapterPicker = createChapterPicker($voxbibelContentContainer, currentBook, lastChapterOfCurrentBook, $$prevButton, $$nextButton);
            updateDetailView($voxbibelContentContainer, currentBook, lastChapterOfCurrentBook, 1, $$prevButton, $$nextButton);
        });

        $$prevButton.on('click', function (e) {
            currentChapter--;
            updateDetailView($voxbibelContentContainer, currentBook, lastChapterOfCurrentBook, currentChapter, $$prevButton, $$nextButton);
        });

        $$nextButton.on('click', function (e) {
            currentChapter++;
            updateDetailView($voxbibelContentContainer, currentBook, lastChapterOfCurrentBook, currentChapter, $$prevButton, $$nextButton);
        });
    }

    /**
     * @private
     *
     * @return void
     */
    function updateDetailView($contentContainer, book, lastChapter, chapter = '1', $$prevButton, $$nextButton) {
        updateWikiText($contentContainer, book, chapter);

        if (chapter > 1) {
            $$prevButton.show();

            if (chapter >= lastChapter) {
                $$nextButton.hide();
            } else {
                $$nextButton.show();
            }
        }

        if (chapter <= 1) {
            $$prevButton.hide();

            if (chapter === lastChapter) {
                $$nextButton.hide();
            }
        }
    }

    /**
     * @private
     *
     * @return void
     */
    function createChapterPicker($voxbibelContentContainer, currentBook, lastChapterOfCurrentBook, $$prevButton, $$nextButton) {
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
                    updateDetailView($voxbibelContentContainer, currentBook, lastChapterOfCurrentBook, selectedChapter, $$prevButton, $$nextButton);
                }
            }
        });
    }

    /**
     * @private
     *
     * @return void
     */
    function updateWikiText($contentContainer, book, chapter = '1') {
        var volxbibelContent;
        var currentWikiUrlJson = 'https://wiki.volxbibel.com/api.php?action=query&prop=revisions&rvlimit=1&rvprop=content&format=json&titles=' + book + '_' + chapter;
        currentWikiUrl = 'https://wiki.volxbibel.com/' + book + '_' + chapter;
        
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
                                startShareAction('Aus der Volxbibel...', $message, 'Teile diesen Vers');
                            });
                        }, 100);
                    }
                }
            });

        }, function (xhr, status) {
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

        /**
         * @private
         *
         * @return void
         */
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

    /**
     * @private
     *
     * @return string
     */
    function getVolxbibelContent(data) {
        var dataPage = Object.keys(data['query']['pages'])[0];
        return data['query']['pages'][dataPage]['revisions'][0]['*'];
    }

    /**
     * @private
     *
     * @return string
     */
    function getVerseOfCurrentDay(data) {
        var today = getTodaysDate();
        return data[1]['dates'][today]['text'] + '<span class="text-of-the-day-verse">' + data[1]['dates'][today]['bibleverses'] + '</span>';
    }

    /**
     * @private
     *
     * @return void
     */
    function removeMetaInfoFromContent(contentString) {
        return contentString.substring(contentString.indexOf("==="), contentString.length);
    }

    /**
     * @private
     *
     * @return void
     */
    function setNavbarTitle(book, chapter) {
        $('.navbar-book-title').text(book + ' ' + chapter);
    }

    /**
     * @public
     *
     * @return void
     */
    function init() {
        if (firstStageInit) {
            $('.ios .page-content').scrollTop(40);
            firstStageInit = false;
        }

        $$('.links-list').find('a').on('click', function (e) {
            currentBook = $(this).data('book');
            currentChapter = 1;
        });

        app.searchbar.create({
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

    /**
     * @public
     *
     * @return void
     */
    function showTutorial() {
        $('.tutorial-overlay').fadeIn();
        $('.tutorial-overlay .button').on('click', function () {
            $('.tutorial-overlay').fadeOut();
        });
    }

    /**
     * @public
     *
     * @return void
     */
    function showTextOfTheDay() {
        app.request.json('https://admin.citychurch.de/twitturgie/volxbibel/json/volxbibellosung.json', function (requestData) {
            $$('.text-of-the-day-content').html(getVerseOfCurrentDay(requestData));

            $('.text-of-the-day').fadeIn();
            $('.text-of-the-day svg').addClass('animate');
        });
    }

    return {
        init: init,
        showTutorial: showTutorial,
        showTextOfTheDay: showTextOfTheDay
    }
});