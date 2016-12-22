import {
  defaults
}
from 'lodash';
import wrapTransform from './wrapTransform';
import castToClass from '../../fields/utils/castToClass';
import resolveValues from '../../fields/utils/resolveValues';

function transformToClass(args = {}) {
  const {
    Class,
    options = {}
  } = args;

  // When fetching document from collection we don't want to clone raw document
  // and we want default values to be set.
  defaults(options, {
    defaults: true,
    clone: false,
    cast: false
  });

  return function(rawDoc) {
    const doc = castToClass({
      Class,
      rawDoc,
      options
    });
    return doc;
  }
};

export default transformToClass;