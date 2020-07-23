import React, { Component } from 'react';
import MyButton from '../util/myButton';
import { Link } from 'react-router-dom';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { likeScream, unlikeScream } from '../redux/actions/dataActions';

class LikeButton extends Component {
  isLiked = () => {
    return (
      this.props.user.likes &&
      this.props.user.likes.find(like => like.screamId === this.props.screamId)
    );
  };

  likeScream = () => {
    this.props.likeScream(this.props.screamId);
  };

  unlikeScream = () => {
    this.props.unlikeScream(this.props.screamId);
  };

  render() {
    const { authenticated } = this.props.user;
    const likeButton = !authenticated ? (
      <Link to="/login">
        <MyButton tip="Like">
          <FavoriteBorder color="primary" />
        </MyButton>
      </Link>
    ) : this.isLiked() ? (
      <MyButton tip="Unlike" onClick={this.unlikeScream}>
        <FavoriteIcon color="primary" />
      </MyButton>
    ) : (
      <MyButton tip="Like" onClick={this.likeScream}>
        <FavoriteBorder color="primary" />
      </MyButton>
    );
    return likeButton;
  }
}

LikeButton.propTypes = {
  user: propTypes.object.isRequired,
  screamId: propTypes.string.isRequired,
  likeScream: propTypes.func.isRequired,
  unlikeScream: propTypes.func.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

const mapActionsToProps = {
  likeScream,
  unlikeScream
};
export default connect(mapStateToProps, mapActionsToProps)(LikeButton);
