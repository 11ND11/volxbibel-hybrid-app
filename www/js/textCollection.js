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
            creationDate: creationDate
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
            textList = '';

        if (storedTextCollection === null) {
            storedTextCollection = {
                text: []
            };
        }

        for(var i = 0; i < storedTextCollection.text.length; i++)
        {
            textList += '<li id="my-vers-' + i + '">' + storedTextCollection.text[i].book + ' ' + storedTextCollection.text[i].chapter + ', ' + storedTextCollection.text[i].verse + ':'+storedTextCollection.text[i].content + '</li>';
        }

        $$listContainer.html(textList);
    }

    return {
        addText: addText,
        getTextCollectionList: getTextCollectionList
    }
});