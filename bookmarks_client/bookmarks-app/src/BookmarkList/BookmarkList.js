import React, { Component } from 'react';
import BookmarksContext from '../BookmarksContext';
import BookmarkItem from '../BookmarkItem/BookmarkItem';
import PropTypes from 'prop-types'
import './BookmarkList.css'

class BookmarkList extends Component {
  static defaultProps = {
    bookmarks: []
  };
  static contextType = BookmarksContext;

  render() {
    const { bookmarks } = this.context;
    return (
      <section className='BookmarkList'>
        <h2>Your bookmarks</h2>
        <ul className='BookmarkList__list' aria-live='polite'>
          {bookmarks.map(bookmark =>
            <BookmarkItem
              key={bookmark.id}
              {...bookmark}
            />
          )}
        </ul>
      </section>
    );
  }
}

export default BookmarkList;

// This establishes exactly the prop type that
// our code expects
BookmarkList.propTypes = {

  // proptypes.shape({}) allows us to define the 
  // shape that our code expects to receive
  bookmarks: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    rating: PropTypes.number,
    description: PropTypes.string
  }))
}
