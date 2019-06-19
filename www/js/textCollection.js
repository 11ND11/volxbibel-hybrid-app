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
        console.log('addText');
        var creationDate = today;

        var storedTextCollection = JSON.parse(storage.getItem('textCollection'));

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

        console.log(storedTextCollection);
        storage.setItem('textCollection', JSON.stringify(storedTextCollection));
    }

    /**
     * @public
     *
     * @return void
     */
    function getText(text, book, chapter, verse) {

    }

    /**
     * @public
     *
     * @return void
     */
    function getTextCollectionList($$listContainer) {
        console.log('get collection');
        var storedTextCollection = JSON.parse(storage.getItem('textCollection')),
            textList = '',
            textlistItemMarkupBefore = '<a class="link item-link item-content swipeout-delete" href="/detail/" data-book="Hiob">' +
                '<div class="item-inner swipeout-content">' +
                '<div class="item-title-row">',
            textlistItemMarkupAfter = '</div></div></a>';


        if (storedTextCollection === null) {
            storedTextCollection = {
                text: []
            };
        }

        for(var i = 0; i < storedTextCollection.text.length; i++)
        {
            textList += '<li id="my-vers-' + i + '" class="">' + textlistItemMarkupBefore + '<div class="item-title">' + storedTextCollection.text[i].book + ' ' + storedTextCollection.text[i].chapter + ', ' + storedTextCollection.text[i].verse + '</div></div><div class="item-text">' + storedTextCollection.text[i].content + textlistItemMarkupAfter + '</li>';
        }

        $$listContainer.html(textList);
    }

    return {
        addText: addText,
        getTextCollectionList: getTextCollectionList
    }
});