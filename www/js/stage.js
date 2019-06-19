/**
 * Module: VOLXBIBEL/Stage
 */

var stage = (function () {

    // settings

    var _defaultConfiguration = {

    };

    // bind events
    $$(document).on('page:init', '.page[data-name="detail"]', detailPageInit);
    $$(document).on('page:init', '.page[data-name="settings"]', settingsPageInit);
    $$(document).on('page:init', '.page[data-name="bookmarks"]', bookmarksPageInit);

    /**
     * @private
     *
     * @return void
     */
    function detailPageInit() {
        console.log('detail init');
        var $volxbibelContentContainer = $('.volxbibel-content'),
            $$prevButton = $$('#toolbar-link-prev'),
            $$nextButton = $$('#toolbar-link-next');

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

            chapterPicker = createChapterPicker($volxbibelContentContainer, currentBook, lastChapterOfCurrentBook, $$prevButton, $$nextButton);
            renderDetailView($volxbibelContentContainer, currentBook, lastChapterOfCurrentBook, 1, $$prevButton, $$nextButton);
        });

        $$prevButton.on('click', function (e) {
            currentChapter--;
            renderDetailView($volxbibelContentContainer, currentBook, lastChapterOfCurrentBook, currentChapter, $$prevButton, $$nextButton);
        });

        $$nextButton.on('click', function (e) {
            currentChapter++;
            renderDetailView($volxbibelContentContainer, currentBook, lastChapterOfCurrentBook, currentChapter, $$prevButton, $$nextButton);
        });
    }

    /**
     * @private
     *
     * @return void
     */
    function settingsPageInit() {
        console.log('settings init');
        $$('[data-toggle-button]').on ('change', function () {
            console.log($(this));
        });
    }

    /**
     * @private
     *
     * @return void
     */
    function bookmarksPageInit() {
        console.log('bookmarks init');
        textCollection.getTextCollectionList($$('[data-render-text-collection]'));
    }

    /**
     * @private
     *
     * @return void
     */
    function renderDetailView($contentContainer, book, lastChapter, chapter = '1', $$prevButton, $$nextButton) {
        renderWikiText($contentContainer, book, chapter);

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
                    renderDetailView($voxbibelContentContainer, currentBook, lastChapterOfCurrentBook, selectedChapter, $$prevButton, $$nextButton);
                }
            }
        });
    }

    /**
     * @private
     *
     * @return void
     */
    function renderWikiText($contentContainer, book, chapter = '1') {
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

                        $(this).html('<span class="verse" data-verse-number="' + verseStartNumber + '">' + verseStartNumber + '</span>- <span class="verse">' + verseEndNumber + '</span><span class="vb-text">' + paragraph.substring(index, paragraph.length) + '</span>');
                    } else {
                        $(this).html('<span class="verse" data-verse-number="' + verse + '">' + verse + '</span><span class="vb-text">' + paragraph.substring(index, paragraph.length) + '</span>');
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
                    var shareIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>',
                        likeIcon = '<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="heart" class="svg-inline--fa fa-heart fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3zm-23.6 187.5L259.4 430.5c-2.4 2.4-4.4 2.4-6.8 0L77.2 251.8c-36.5-37.2-43.9-107.6 7.3-150.7 38.9-32.7 98.9-27.8 136.5 10.5l35 35.7 35-35.7c37.8-38.5 97.8-43.2 136.5-10.6 51.1 43.1 43.5 113.9 7.3 150.8z"></path></svg>';
                        likeIconActive = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="heart" class="svg-inline--fa fa-heart fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"></path></svg>',
                        verseText = $(this).text().substring(1, $(this).text().length),
                        currentVerse = $(this).siblings('.verse').text();

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
                        $(this).parent().addClass('active').prepend('<a href="" data-action="share" class="link action-button button button-circle">' + shareIcon + '</a><a href="" data-action="like" class="link action-button button button-circle">' + likeIcon + '</a>');

                        setTimeout(function () {
                            $('.action-button[data-action="share"]').addClass('scale').on('click', function (e) {
                                var $message = verseText + ' (' + currentBook + ' ' + currentChapter + ',' + Number.parseInt(currentVerse) + ' | Die Volxbibel)\n' + currentWikiUrl;
                                startShareAction('Aus der Volxbibel...', $message, 'Teile diesen Vers');
                            });
                            $('.action-button[data-action="like"]').addClass('scale').on('click', function (e) {
                                if($(this).parents('p').hasClass('highlight')) {
                                    $(this).html(likeIcon).parents('p').removeClass('highlight');
                                } else {
                                    $(this).html(likeIconActive).parents('p').addClass('highlight');
                                }
                                textCollection.addText(verseText, currentBook, currentChapter, Number.parseInt(currentVerse));
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
        console.log('stage init');
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