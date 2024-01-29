const books = [];
const RENDER_EVENT = 'render-book';

const PRINT_SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

document.addEventListener('DOMContentLoaded', function () {
    const submitBookForm = document.getElementById('inputBook');
    const searchBookForm = document.getElementById('searchBook');

    submitBookForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });
    searchBookForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const bookTitle = document.getElementById("searchBookTitle").value;

        // trigger event and filter buku
        document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: bookTitle }));
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(PRINT_SAVED_EVENT, function (event) {
    console.log(localStorage.getItem(STORAGE_KEY));
    console.log(event.detail);
});

document.addEventListener(RENDER_EVENT, function (event) {
    const uncompletedBOOKList = document.getElementById('incompleteBookshelfList');
    uncompletedBOOKList.innerHTML = '';

    const completedBOOKList = document.getElementById('completeBookshelfList');
    completedBOOKList.innerHTML = '';

    for (const bookItem of books) {
        if (event.detail !== undefined) {
            if (bookItem.bookTitle.includes(event.detail)) {
                const bookElement = makeBook(bookItem);

                if (!bookItem.isCompleted) {
                    uncompletedBOOKList.append(bookElement);
                }
                else
                    completedBOOKList.append(bookElement);
            }
        }
        else {
            const bookElement = makeBook(bookItem);

            if (!bookItem.isCompleted) {
                uncompletedBOOKList.append(bookElement);
            }
            else
                completedBOOKList.append(bookElement);
        }
    }
});

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);   // dapatkan books sesuai key yang dipakai
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const IsCompleted = document.getElementById('inputBookIsComplete').checked;


    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, IsCompleted);

    books.push(bookObject);
    saveDataToLocal('buku berhasil ditambahkan');

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, bookTitle, bookAuthor, bookYear, isCompleted) {
    return {
        id,
        bookTitle,
        bookAuthor,
        bookYear,
        isCompleted
    }
}


function saveDataToLocal(message) {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new CustomEvent(PRINT_SAVED_EVENT, { detail: message }));
    }
}

function makeBook(bookObject) {
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = bookObject.bookTitle;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = bookObject.bookAuthor;

    const bookYear = document.createElement('p');
    bookYear.innerText = bookObject.bookYear;

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(bookTitle, bookAuthor);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');

    if (bookObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('green');
        undoButton.innerHTML = "Belum selesai di Baca"

        undoButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerHTML = "Hapus Buku"

        trashButton.addEventListener('click', function () {
            if (confirm("Do you want to delete this book?"))
                removeBook(bookObject.id);
        });

        buttonContainer.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('green');
        checkButton.innerHTML = "Selesai Dibaca"

        checkButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerHTML = "Hapus Buku"

        trashButton.addEventListener('click', function () {
            if (confirm("Do you want to delete this book?"))
                removeBook(bookObject.id);
        });

        buttonContainer.append(checkButton, trashButton);
    }
    container.append(buttonContainer);

    return container;
}

function addBookToCompleted(bookId) {
    // make sure book is not empty
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isCompleted = true;      // change status to complete

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocal('buku berhasil diselesaikan');
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeBook(bookId) {
    // make sure book id is not empty
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;

    // remove book based on id
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocal('buku berhasil dihapus');
}


function undoBookFromCompleted(bookId) {
    // make sure book is not empty
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isCompleted = false;     // change status to complete
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocal('buku berhasil diundo');
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}