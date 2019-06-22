import React from 'react';
import './Rating.css';
import PropTypes from 'prop-types'

export default function Rating(props) {
  const stars = [0, 0, 0, 0, 0].map((_, i) =>
    (i < props.value)
      ? <span key={i}>&#9733; </span>
      : <span key={i}>&#9734; </span>
  );
  return (
    <div className="rating">
      {stars}
    </div>
  );

}

// this sets a default value and is evaluated
// before types are checked by propTypes
Rating.defaultProps = {
  value: 1
}

// here we define the prop type that our code
// is expecting and if the property is required
// other examples of prop types are
// .array, .bool, .func, .object, .string
// Rating.propTypes = {
//   value: PropTypes
//           .oneOf([1, 2, 3, 4, 5])
//           .isRequired
// }

// we may also do a proptype validator logic to 
// further define our proptypes that are to be
// expected

Rating.propTypes = {
  
  value: (props, propName, componentName) => {
    // first get the value of the prop
    const prop = props[propName];

    // since we want this to be required we 
    // check this first
    if (!prop) {
      return new Error(`${propName} is required in ${componentName}. Validation Failed`);
    }

    // the prop has a value let's check the type
    if (typeof prop != 'number') {
      return new Error(`Invalid prop, ${propName} is expected to be a number in ${componentName}. ${typeof prop} found.`);
    }

    // the prop  is a number let us check the range
    if (prop < 1 || prop > 5) {
      return new Error(`Invalid prop, ${propName} should be in range 1 - 5 in ${componentName}.`);
    }
  }
}

