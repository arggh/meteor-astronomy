Tinytest.add('Storage - Document insert', function(test) {
  let id = 'ekfAFb8w5umxaeAPs';
  let storage = new Storage({
    '_id': id,
    'one': {
      'string': 'abc',
      'transient': 'transient'
    },
    'many': [{
      'string': 'abc',
      'transient': 'transient'
    }],
    'numbers': [1, 2, 3],
    'anything': {
      'string': 'abc'
    },
    'string': 'abc',
    'number': 123,
    'boolean': true,
    'date': new Date(2000, 0, 1, 0, 0, 0, 0),
    'transient': 'transient'
  });
  storage.save();

  let expected = {
    '_id': id,
    'one': {
      'string': 'abc'
    },
    'many': [{
      'string': 'abc'
    }],
    'numbers': [1, 2, 3],
    'anything': {
      'string': 'abc',
    },
    'string': 'abc',
    'number': 123,
    'boolean': true,
    'date': new Date(2000, 0, 1, 0, 0, 0, 0)
  };
  test.equal(Storages.findOne(id), expected,
    'Document has not been saved properly'
  );
});
