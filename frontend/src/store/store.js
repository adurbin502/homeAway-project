// frontend/src/store/store.js
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
import sessionReducer from './session';

const rootReducer = combineReducers({
  session: sessionReducer
});

let enhancer;

if (import.meta.env.MODE !== 'production') {
  const logger = (await import('redux-logger')).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
} else {
  enhancer = applyMiddleware(thunk);
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;