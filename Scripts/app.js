var ViewModel = function () {
    var self = this;
    self.books = ko.observableArray();
    self.error = ko.observable();
    self.detail = ko.observable();
    self.authors = ko.observableArray();
    self.newBook = {
        Id: ko.observable(),
        Author: ko.observable(),
        Genre: ko.observable(),
        Price: ko.observable(),
        Title: ko.observable(),
        Year: ko.observable()
    }

    // URLs
    var authorsUri = '/api/authors/';
    var booksUri = '/api/books/';

    // Common Ajax Function
    function ajaxHelper(uri, method, data) {
        self.error('');
        return $.ajax({
            url: uri,
            type: method,
            data: data ? JSON.stringify(data) : null,
            dataType: 'json',
            contentType: 'application/json',
            statusCode: {
                400: function (data) {
                    if (typeof data.responseJSON.ModelState !== 'undefined') {
                        $.each(data.responseJSON.ModelState, function (key, errors) {
                            $.each(errors, function (index, error) {
                                switch (key) {
                                    case 'book.Title':
                                        self.error(error);
                                        break;
                                    default:
                                        self.error(key + error);
                                        break;
                                };
                            });
                        });
                    }
                    else {
                        self.error(data.responseJSON.Message);
                    };
                },
                500: function (data) {
                    self.error(data.statusText + '. Please try again.');
                }
            }
        });
    }

    // Initialize Data
    function getAuthors() {
        ajaxHelper(authorsUri, 'GET').done(function (data) {
            self.authors(data);
        });
    }
    function getAllBooks() {
        ajaxHelper(booksUri, 'GET').done(function (data) {
            self.books(data);
        });
    }

    // Fetch the initial data.
    getAllBooks();
    getAuthors();

    // For Clear Button
    self.clearFields = function clearFields() {
        self.newBook.Id('');
        self.newBook.Genre('');
        self.newBook.Price('');
        self.newBook.Title('');
        self.newBook.Year('');
    }
    // For Cancel Button
    self.cancel = function () {
        self.clearFields();
        getAuthors()

        $('#Save').show();
        $('#CreateTitle').show();
        $('#Clear').show();

        $('#Update').hide();
        $('#UpdateTitle').hide();
        $('#Cancel').hide();
    }
    // Detail Button
    self.getBookDetail = function (item) {
        ajaxHelper(booksUri + item.Id, 'GET').done(function (data) {
            self.detail(data);
        });
    }
    // Add
    self.addBook = function (formElement) {
        var book = {
            AuthorId: self.newBook.Author().Id,
            Genre: self.newBook.Genre(),
            Price: self.newBook.Price(),
            Title: self.newBook.Title(),
            Year: self.newBook.Year()
        };  
        ajaxHelper(booksUri, 'POST', book).done(function (item) {
            self.books.push(item);
            self.clearFields();
            getAuthors();
            //Show Details of the newly added book.
            ajaxHelper(booksUri + item.Id, 'GET').done(function (data) {
                self.detail(data);
            });
        });

    }
    // Populate Edit Form
    self.getBookDetailForm = function (item) {
        ajaxHelper(authorsUri, 'GET').done(function (data) {
            var authors = data;
            var index = authors.findIndex(v => v.Name === item.AuthorName);
            arraymove(authors, index, 0);
            self.authors(authors);
        });
        ajaxHelper(booksUri + item.Id, 'GET').done(function (data) {
            self.newBook.Id(item.Id);
            self.newBook.Genre(data.Genre);
            self.newBook.Price(data.Price);
            self.newBook.Title(data.Title);
            self.newBook.Year(data.Year);
        });
        // Change Button Layout Between Create and Update
        $('#Save').hide();
        $('#CreateTitle').hide();
        $('#Clear').hide();
        $('#Update').show();
        $('#UpdateTitle').show();
        $('#Cancel').show();
    }
    // Update
    self.updateBook = function (formElement) {
        var book = {
            Id: self.newBook.Id(),
            AuthorId: self.newBook.Author().Id,
            Genre: self.newBook.Genre(),
            Price: self.newBook.Price(),
            Title: self.newBook.Title(),
            Year: self.newBook.Year()
        };
        ajaxHelper(booksUri + self.newBook.Id(), 'PUT', book).done(function (item) {
            getAllBooks();
            self.clearFields();
            getAuthors();
        });
        // Show Detail of the updated book.
        ajaxHelper(booksUri + self.newBook.Id(), 'GET').done(function (data) {
            self.detail(data);
        });
    }
    // Delete
    self.deleteBook = function (item) {
        ajaxHelper(booksUri + item.Id, 'DELETE').done(function (data) {
            self.books.pop(item);
            // Remove the Detail Screen if the deleted item detail is being shown.
            if (self.detail) {
                if (self.detail().Id == item.Id) {
                    self.detail('');
                }
            }
            // Remove the populated edit form if the deleted item is populated there.
            if (self.newBook) {
                if (self.newBook.Id() == item.Id) {
                    self.cancel();
                }
            }
            alert('Book Deleted Successfully');
        });
    }

    // Extra Functions
    function arraymove(arr, fromIndex, toIndex) {
        var element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    }
};

ko.applyBindings(new ViewModel());