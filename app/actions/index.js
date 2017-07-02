const mb = require('../rest/Musicbrainz');
const discogs = require('../rest/Discogs');
const _ = require('lodash');

export const CREATE_PLUGINS = 'CREATE_PLUGINS';
export const UNIFIED_SEARCH = 'UNIFIED_SEARCH';
export const UNIFIED_SEARCH_START = 'UNIFIED_SEARCH_START';
export const UNIFIED_SEARCH_SUCCESS = 'UNIFIED_SEARCH_SUCCESS';
export const UNIFIED_SEARCH_ERROR = 'UNIFIED_SEARCH_ERROR';

export function createSearchPlugins(pluginClasses) {
  var plugins = {};

  for ( var i=0; i<Object.keys(pluginClasses).length; i++ ) {
    var category = Object.keys(pluginClasses)[i];

    if (plugins[category] == undefined) {
          plugins[category] = [];
    }

    for (var j=0; j<Object.keys(pluginClasses[category]).length; j++) {
      var pluginName = Object.keys(pluginClasses[category])[j];
      var plugin = new pluginClasses[category][pluginName]();
      plugins[category].push(plugin);
    }
  }

  return {
    type: CREATE_PLUGINS,
    plugins: plugins
  };
}

export function sourcesSearch(terms, plugins) {
  var searchResults = {};
  for(var i=0; i<plugins.musicSources.length; i++) {
    Object.assign(searchResults, plugins.musicSources[i].search(terms));
  }

  return {
    type: SOURCES_SEARCH
  }
}

export function unifiedSearchStart() {
  return {
    type: UNIFIED_SEARCH_START,
    payload: null
  }
}

export function unifiedSearch(terms) {
  return (dispatch) => {
    dispatch(unifiedSearchStart());

    var search = [
      discogs.searchArtists(terms, 3),
      discogs.searchReleases(terms, 3)
    ];

    Promise.all(search)
    .then(searchResults => {
      return Promise.all(
        searchResults.map(response => response.json())
      )
    })
    .then(responses => {
      dispatch({
        type: UNIFIED_SEARCH,
        payload: responses
      });
    })
    .catch(error => {
      dispatch({
        type: SEARCH_ERROR,
        payload: error
      });
    });
  }
}

// export function albumInfoSearch(albumId) {
//
//   return _.debounce( (dispatch) => {
//     console.log('dispatched' + new Date());
//     discogs.releaseInfo(albumId)
//     .then(info => {
//       info.json()
//     })
//     .then(albumInfo => {
//       dispatch({
//         type: ALBUM_INFO_SEARCH,
//         payload: albumInfo
//       });
//     });
//
//   }, 1000);
// }
//
// export function artistInfoSearch(artistId) {
//   return (dispatch) => {
//
//     discogs.artistInfo(artistId)
//     .then(info => {
//       info.json()
//     })
//     .then(artistInfo => {
//       dispatch({
//         type: ARTIST_INFO_SEARCH,
//         payload: artistInfo
//       });
//     });
//
//   };
// }
