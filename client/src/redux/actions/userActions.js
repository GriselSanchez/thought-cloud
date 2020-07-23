/*The redux-thunk framework is a Redux middleware that lets you 
dispatch a function which may or may not be async. 
The function takes a single parameter, a function dispatch(), 
which lets you dispatch actions. */

import {
  SET_USER,
  SET_ERRORS,
  CLEAR_ERRORS,
  LOADING_UI,
  LOADING_USER,
  SET_UNAUTHENTICATED
} from '../types';
import axios from 'axios';

export const loginUser = (userData, history) => dispatch => {
  //dispatch a type and catch it from the reducer
  dispatch({ type: LOADING_UI });
  axios
    .post('/user/login', userData)
    .then(res => {
      localStorage.setItem('idToken', `Bearer ${res.data.token}`);
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${res.data.token}`;

      dispatch(getUserData());
      dispatch({ type: CLEAR_ERRORS });
      //redirects to home page
      history.push('/');
    })
    .catch(err => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data
      });
    });
};

export const signUpUser = (newUserData, history) => dispatch => {
  //dispatch a type and catch it from the reducer
  dispatch({ type: LOADING_UI });
  axios
    .post('/user/signup', newUserData)
    .then(res => {
      localStorage.setItem('idToken', `Bearer ${res.data.token}`);
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${res.data.token}`;
      dispatch(getUserData());
      dispatch({ type: CLEAR_ERRORS });
      //redirects to home page
      history.push('/');
    })
    .catch(err => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data
      });
    });
};

export const logoutUser = () => dispatch => {
  localStorage.removeItem('idToken');
  delete axios.defaults.headers.common['Authorization'];
  dispatch({ type: SET_UNAUTHENTICATED });
};

export const getUserData = () => dispatch => {
  dispatch({ type: LOADING_USER });
  axios
    .get('/user')
    .then(res => {
      dispatch({
        type: SET_USER,
        payload: res.data
      });
    })
    .catch(err => console.log(err));
};

export const uploadImage = formData => dispatch => {
  dispatch({ type: LOADING_USER });
  axios
    .post('/user/image', formData)
    .then(res => {
      dispatch(getUserData());
    })
    .catch(err => console.log(err));
};

export const editUserDetails = userDetails => dispatch => {
  dispatch({ type: LOADING_USER });
  axios
    .post('/user', userDetails)
    .then(() => {
      dispatch(getUserData());
    })
    .catch(err => console.log(err));
};
