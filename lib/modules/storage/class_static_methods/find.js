import {
  defaults,
  isFunction,
  isNull,
  map
} from 'lodash';
import wrapTransform from '../utils/wrapTransform';
import transformToClass from '../utils/transformToClass';
import Event from '../../events/event';
import {
  Mongo
}
from 'meteor/mongo';

function createMethod(methodName) {
  return function(selector, options) {
    let Class = this;
    let Collection = Class.getCollection();

    // Get selector from arguments.
    if (arguments.length === 0) {
      selector = {};
    }
    else {
      selector = arguments[0];
    }
    // If selector is null then just proceed to collection's find method.
    if (isNull(selector)) {
      return Collection[methodName](selector, options);
    }
    // Rewrite selector to make it an object.
    selector = Mongo.Collection._rewriteSelector(selector);

    // Set default options.
    options = defaults({}, options, {
      defaults: true,
      children: true,
      // We don't want to clone raw object in the "find" method.
      clone: false
    });

    // Modify selector and options using the "beforeFind" event handlers.
    if (!options.disableEvents) {
      Class.dispatchEvent(new Event('beforeFind', {
        selector,
        options
      }));
    }

    // If it's an inherited class, then get only documents being instances of
    // the subclass.
    const typeField = Class.getTypeField();
    if (typeField) {
      // If a class has child classes then we have to fetch document being
      // instances of the parent and child classes depending on a value of
      // the "children" option.
      const children = Class.getChildren(options.children);
      if (options.children && children.length > 0) {
        children.push(Class);
        selector[typeField] = {
          $in: map(children, (Child) => Child.getName())
        };
      }
      else {
        selector[typeField] = Class.getName();
      }
    }

    const classTransform = Class.getTransform();
    if (options.transform !== null && classTransform !== null) {
      // Wrap the transform function with the "wrapTransform" function, which
      // resolves values.
      options.transform = wrapTransform({
        Class,
        // First, try getting the transform function passed to the "find"
        // method. Later, check if the transform function is defined in the
        // class definition. If none of them contains a transform function, then
        // get the default one.
        transform: options.transform || classTransform || transformToClass({
          Class,
          options
        })
      });
    }

    // Execute the original method.
    let result = Collection[methodName](selector, options);

    // Modify a query result using the "afterFind" event handlers.
    if (!options.disableEvents) {
      Class.dispatchEvent(new Event('afterFind', {
        selector,
        options,
        result
      }));
    }

    return result;
  };
}

const find = createMethod('find');
const findOne = createMethod('findOne');

export { find, findOne };