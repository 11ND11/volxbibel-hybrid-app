/**
 * Module: VOLXBIBEL/TextCollection
 */

var textCollection = (function () {

    // settings

    var _defaultConfiguration = {};

    // bind events

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
            book: book,
            chapter: chapter,
            verse: verse,
            creationDate: creationDate,
            highlightColor: '',
            note: ''
        });

        // storedTextCollection.text.sort();
        console.log(storedTextCollection);
        storage.setItem('textCollection', JSON.stringify(storedTextCollection));
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
        console.log(storedTextCollection.text);

        // storedTextCollection.sort();
        storage.setItem('textCollection', JSON.stringify(storedTextCollection));
    }

    /**
     * @public
     *
     * @return void
     */
    function getTextCollectionList($$listContainer) {
        var storedTextCollection = JSON.parse(storage.getItem('textCollection')),
            textList = '';

        if (storedTextCollection === null) {
            storedTextCollection = {
                text: []
            };
        }

        for(var i = 0; i < storedTextCollection.text.length; i++)
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
            // console.log(storedTextCollection.text[i].book + ' index:' + i)
        }

        $$listContainer.html(textList);

        $('[data-remove-text]').on('click', function () {
            removeText($(this).data('remove-text'));
        });
    }

    return {
        addText: addText,
        getTextCollectionList: getTextCollectionList
    }
});