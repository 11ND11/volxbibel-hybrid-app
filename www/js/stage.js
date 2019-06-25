/**
 * Module: VOLXBIBEL/Stage
 */

var stage = (function () {

    // bind events
    $$(document).on('page:init', '.page[data-name="detail"]', detailPageInit);
    $$(document).on('page:init', '.page[data-name="settings"]', settingsPageInit);
    $$(document).on('page:init', '.page[data-name="bookmarks"]', bookmarksPageInit);

    /**
     * @public
     *
     * @return void
     */
    function init() {

        settingsOverride = JSON.parse(storage.getItem('settings'));

        if (typeof settingsOverride === 'undefined' || settingsOverride === null) {
            settingsOverride = settings;
            storage.setItem('settings', JSON.stringify(settingsOverride));
        }

        if (firstStageInit) {
            $('.ios .page-content').scrollTop(40);

            if (settingsOverride.startWithLastText) {
                if (typeof storage.currentBook !== 'undefined') {
                    currentBook = storage.currentBook;
                    currentChapter = storage.currentChapter;
                    mainView.router.navigate('/detail/');
                }
            }

            if (typeof storage.version === 'undefined') {
                storage.setItem('version', '10000');
            }

            if (settingsOverride.version > storage.version) {
                storage.removeItem('hideTutorial');
                storage.setItem('version', settings.version);
            }

            firstStageInit = false;
        }

        $$('[data-bible-list]').find('a').on('click', function (e) {
            currentBook = $(this).data('book');

            if (typeof $(this).data('chapter') === 'undefined') {
                currentChapter = 1;
            } else {
                currentChapter = $(this).data('chapter');
            }
        });

        if (settingsOverride.showNtFirst) {
            $$('.at').insertAfter('.nt');
        }

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
    }

    /**
     * @private
     *
     * @return void
     */
    function detailPageInit() {
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
            console.log(currentChapter);
            chapterPicker = createChapterPicker($volxbibelContentContainer, currentBook, lastChapterOfCurrentBook, $$prevButton, $$nextButton);
            renderDetailView($volxbibelContentContainer, currentBook, lastChapterOfCurrentBook, currentChapter, $$prevButton, $$nextButton);
        });

        saveCurrentBookChapter(currentBook, currentChapter);

        $$prevButton.on('click', function (e) {
            console.log(currentChapter);
            currentChapter--;
            renderDetailView($volxbibelContentContainer, currentBook, lastChapterOfCurrentBook, currentChapter, $$prevButton, $$nextButton);
            saveCurrentBookChapter(currentBook, currentChapter);
        });

        $$nextButton.on('click', function (e) {
            console.log(currentChapter);
            currentChapter++;
            renderDetailView($volxbibelContentContainer, currentBook, lastChapterOfCurrentBook, currentChapter, $$prevButton, $$nextButton);
            saveCurrentBookChapter(currentBook, currentChapter);
        });
    }

    /**
     * @private
     *
     * @return void
     */
    function settingsPageInit() {
        if (settingsOverride.startWithLastText) {
            $('[data-settings="startWithLastText"]').attr('checked', '');
        }

        if (settingsOverride.showNtFirst) {
            $('[data-settings="showNtFirst"]').attr('checked', '');
        }

        $$('[data-toggle-button]').on('change', function () {
            if ($$(this).data('settings') === 'startWithLastText') {
                if ($$(this).prop('checked')) {
                    settingsOverride.startWithLastText = true;
                } else {
                    settingsOverride.startWithLastText = false;
                }
            }

            if ($$(this).data('settings') === 'showNtFirst') {
                if ($$(this).prop('checked')) {
                    settingsOverride.showNtFirst = true;
                } else {
                    settingsOverride.showNtFirst = false;
                }
            }
            console.log('settings before save to storage: ' + settingsOverride);
            storage.setItem('settings', JSON.stringify(settingsOverride));
        });

        $$('[data-button]').on('click', function () {
            storage.removeItem('hideTutorial');
            if (typeof storage.currentBook !== 'undefined') {
                currentBook = storage.currentBook;
                currentChapter = storage.currentChapter;
            } else {
                currentBook = '1.Mose';
            }
            mainView.router.navigate('/detail/');
        })
    }

    /**
     * @private
     *
     * @return void
     */
    function saveCurrentBookChapter(book, chapter) {
        storage.setItem('currentBook', book);
        storage.setItem('currentChapter', chapter);
    }

    /**
     * @private
     *
     * @return void
     */
    function bookmarksPageInit() {
        textCollection.renderBookmarkList($$('[data-render-text-collection]'));
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
                    saveCurrentBookChapter(currentBook, selectedChapter);
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

                        $(this).html('<span class="verse-container"><span class="verse" data-verse-number="' + Number.parseInt(verseStartNumber) + '">' + verseStartNumber + '</span>- <span class="verse">' + verseEndNumber + '</span><span class="vb-text">' + paragraph.substring(index, paragraph.length) + '</span></span>');
                    } else {
                        $(this).html('<span class="verse-container"><span class="verse" data-verse-number="' + Number.parseInt(verse) + '">' + verse + '</span><span class="vb-text">' + paragraph.substring(index, paragraph.length) + '</span></span>');
                    }
                }
            });

            $contentContainer.addClass('content-is-ready');

            textCollection.highlightText(book, chapter, $contentContainer);

            $$('.volxbibel-content .verse-container').on("touchstart", function (e) {
                touchTapWithoutMove = true;
            });
            $$('.volxbibel-content .verse-container').on("touchmove", function () {
                touchTapWithoutMove = false;
            });
            $$('.volxbibel-content .verse-container').on("touchend", function () {
                if (touchTapWithoutMove === true) {
                    var verseText = $(this).text().substring(1, $(this).text().length),
                        currentVerse = $(this).find('.verse').text();

                    if ($(this).find('.verse').length > 1) {
                        currentVerse = '';
                        $(this).find('.verse').each(function () {
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
                        $(this).parent().addClass('active');
                        renderActionButtons($(this).parent(), verseText, currentBook, currentChapter, currentVerse, currentWikiUrl);
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
    }

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

    /**
     * @private
     *
     * @return void
     */
    function renderActionButtons($buttonContainer, verseText, currentBook, currentChapter, currentVerse, currentWikiUrl) {
        console.log('render');
        var shareIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>',
            likeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>',
            unlikeIcon = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><style type="text/css">.st0{fill:none;} .st1{fill:#FFFFFF;}</style><path class="st0" d="M0,0h24v24H0V0z"/><g><path class="st1" d="M14,16.8c-0.6,0.6-1.3,1.2-1.9,1.8L12,18.7l-0.1-0.1C7.1,14.2,4,11.4,4,8.5c0-0.4,0.1-0.8,0.2-1.2L2.7,5.8C2.3,6.6,2,7.5,2,8.5c0,3.8,3.4,6.9,8.5,11.5l1.5,1.3l1.5-1.3c0.7-0.7,1.4-1.3,2-1.9L14,16.8z"/><path class="st1" d="M22,8.5C22,5.4,19.6,3,16.5,3c-1.7,0-3.4,0.8-4.5,2.1C10.9,3.8,9.2,3,7.5,3C6.9,3,6.3,3.1,5.8,3.3L3.6,1.1L2.2,2.6L4,4.3c0,0,0,0,0,0l1.4,1.4c0,0,0,0,0,0l10.1,9.7c0,0,0,0,0,0l1.4,1.4c0,0,0,0,0,0l2.6,2.5l1.4-1.4l-2.6-2.5C20.7,13,22,10.9,22,8.5z M16.9,14L7.6,5c1.5,0,2.9,1,3.5,2.4h1.9C13.5,6,15,5,16.5,5c2,0,3.5,1.5,3.5,3.5C20,10.2,18.9,12,16.9,14z"/></g></svg>';

        if ($buttonContainer.hasClass('highlight')) {
            $buttonContainer.prepend('<a href="" data-action="share" class="link action-button button button-circle">' + shareIcon + '</a>' +
                '<a href="" data-action="unlike" class="link action-button button button-circle">' + unlikeIcon + '</a>');
        } else {
            $buttonContainer.prepend('<a href="" data-action="share" class="link action-button button button-circle">' + shareIcon + '</a>' +
                '<a href="" data-action="like" class="link action-button button button-circle">' + likeIcon + '</a>');
        }

        setTimeout(function () {
            $('.action-button[data-action="share"]').addClass('show').on('click', function (e) {
                var $message = verseText + ' (' + currentBook + ' ' + currentChapter + ',' + Number.parseInt(currentVerse) + ' | Die Volxbibel)\n' + currentWikiUrl;
                startShareAction('Aus der Volxbibel...', $message, 'Teile diesen Vers');
            });
            $('.action-button[data-action="like"]').addClass('show').on('click', function (e) {
                $('.volxbibel-content').find('.action-button').fadeOut('fast', function () {
                    $(this).remove();
                });
                $(this).parents('p').addClass('highlight');

                textCollection.addText(verseText, currentBook, currentChapter, Number.parseInt(currentVerse));
            });
            $('.action-button[data-action="unlike"]').addClass('show').on('click', function (e) {
                $('.volxbibel-content').find('.action-button').fadeOut('fast', function () {
                    $(this).remove();
                });

                $(this).parents('p').removeClass('highlight').removeClass('active');
                textCollection.removeText($(this).parents('p').data('storage-index'));
            });
        }, 100);
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
        return '<div>' + data[1]['dates'][today]['text'] + '</div><div class="text-of-the-day-verse">' + data[1]['dates'][today]['bibleverses'];
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
        $('.navbar-book-title').text(book + ' ' + chapter).wrapInner('<span></span>');
    }

    /**
     * @public
     *
     * @return void
     */
    function showTextOfTheDay() {
        app.request.json('https://admin.citychurch.de/twitturgie/volxbibel/json/volxbibellosung.json', function (requestData) {
            var today = getTodaysDate();
            book = requestData[1]['dates'][today]['book'],
                chapter = requestData[1]['dates'][today]['chapter'],
                verse = requestData[1]['dates'][today]['verse'],
                wikiUrl = 'https://wiki.volxbibel.com/' + book + '_' + chapter;

            $('.text-of-the-day-content').html(getVerseOfCurrentDay(requestData));
            $('.text-of-the-day').fadeIn();
            app.navbar.hide('.navbar');
            $$('.statusbar').addClass('dark');
            $('.text-of-the-day svg').addClass('animate');

            renderActionButtons($('.text-of-the-day'), requestData[1]['dates'][today]['text'], book, chapter, verse, wikiUrl);

            $('.text-of-the-day [data-action="like"]').on('click', function () {
                $('.text-of-the-day').fadeOut();
                app.navbar.show('.navbar');
                $$('.statusbar').removeClass('dark');
            });

            $('.text-of-the-day .button-close').on('click', function () {
                $('.text-of-the-day').fadeOut();
                app.navbar.show('.navbar');
                $$('.statusbar').removeClass('dark');
            });
        });
    }

    /**
     * @public
     *
     * @return void
     */
    function showTutorial() {
        $('.tutorial-overlay').fadeIn();
        setTimeout(function () {
            app.navbar.hide('.navbar');
            $$('.statusbar').addClass('dark');
        }, 100);
        $('.tutorial-overlay .button, .tutorial-overlay .button-close').on('click', function () {
            $('.tutorial-overlay').fadeOut();
            app.navbar.show('.navbar');
            $$('.statusbar').removeClass('dark');
        });
    }

    return {
        init: init,
        showTutorial: showTutorial,
        showTextOfTheDay: showTextOfTheDay
    }
});