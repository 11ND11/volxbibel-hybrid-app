/**
 * Module: VOLXBIBEL/TextCollection
 */

var textCollection = (function () {

    /**
     * @public
     *
     * @return void
     */
    function addText(text, book, chapter, verse) {
        var creationDate = today,
            storedTextCollection = JSON.parse(storage.getItem('textCollection')),
            textId = book + chapter + verse;

        if (storedTextCollection === null) {
            storedTextCollection = {
                text: []
            };
        }

        storedTextCollection.text.push({
            content: text,
            book: book.replace(" ", ""),
            chapter: Number.parseInt(chapter),
            verse: verse,
            creationDate: creationDate,
            highlightColor: '',
            note: ''
        });

        storage.setItem('textCollection', JSON.stringify(storedTextCollection));
        notificationAddText.open();
        setTimeout(function () {
            $$('.notification').on('click', function () {
                mainView.router.navigate('/bookmarks/');
            });
        }, 100);
    }

    /**
     * @public
     *
     * @return void
     */
    function removeText(index) {
        var storedTextCollection = JSON.parse(storage.getItem('textCollection'));

        if (storedTextCollection === null) {
            storedTextCollection = {
                text: []
            };
        }

        // remove item
        storedTextCollection.text.splice(index, 1);

        storage.setItem('textCollection', JSON.stringify(storedTextCollection));
        notificationRemoveText.open();
        setTimeout(function () {
            $$('.notification').on('click', function () {
                mainView.router.navigate('/bookmarks/');
            });
        }, 100);
    }

    /**
     * @public
     *
     * @return void
     */
    function renderBookmarkList($$listContainer) {
        var storedTextCollection = JSON.parse(storage.getItem('textCollection')),
            textList = '';

        if (storedTextCollection === null) {
            storedTextCollection = {
                text: []
            };
        }
        for(var i = storedTextCollection.text.length - 1; i >= 0; i--)
        {
            textList += '<li id="my-vers-' + i + '" class="swipeout">' +
                    '<a class="link item-link item-content swipeout-content" href="/detail/" data-book="' + storedTextCollection.text[i].book + '" data-chapter="' +storedTextCollection.text[i].chapter + '">' +
                        '<div class="item-inner swipeout-content">' +
                            '<div class="item-title-row">' +
                                    '<div class="item-title">' +
                                        storedTextCollection.text[i].book + ' ' + storedTextCollection.text[i].chapter + ', ' + storedTextCollection.text[i].verse +
                                    '</div>' +
                                '</div>' +
                                '<div class="item-text">' + storedTextCollection.text[i].content +
                            '</div>' +
                        '</div>' +
                    '</a>' +
                    '<div class="swipeout-actions-right">' +
                        '<a class="swipeout-delete" href="#" data-remove-text="' + i + '">weg damit!</a>' +
                    '</div>' +
                '</li>';
        }
        $$listContainer.html(textList);

        $('[data-remove-text]').on('click', function () {
            removeText($(this).data('remove-text'));
        });
    }

    /**
     * @public
     *
     * @return void
     */
    function highlightText(book, chapter, textContainer) {
        var storedTextCollection = JSON.parse(storage.getItem('textCollection'));

        if (storedTextCollection === null) {
            storedTextCollection = {
                text: []
            };
        }

        for(var i = 0; i < storedTextCollection.text.length; i++)
        {
            if(storedTextCollection.text[i].book === book && storedTextCollection.text[i].chapter === chapter) {
                textContainer.find('[data-verse-number="' + storedTextCollection.text[i].verse + '"]').parents('p').addClass('highlight').attr('data-storage-index', i);
            }
        }
    }

    return {
        addText: addText,
        removeText: removeText,
        renderBookmarkList: renderBookmarkList,
        highlightText: highlightText
    }
});