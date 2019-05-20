'use strict';

const axios = require('axios');

function allSettled (promises) {
  const wrappedPromises = promises.map(p => Promise.resolve(p)
    .then(
      val => ({ state: 'fulfilled', value: val }),
      err => ({ state: 'rejected', reason: err })
    )
  );

  return Promise.all(wrappedPromises);
}


module.exports = async healthChecks => {
  const checkPromises = [];

  (healthChecks || []).forEach(healthCheck => {
    let uri = `${healthCheck.protocol}://${healthCheck.host}`;
    let requestmethod = 'GET';
    let requestbody = {};
    let requestheaders = {}

    if (healthCheck.port) {
      uri += `:${healthCheck.port}`;
    }

    uri += healthCheck.path;
    
    if ( healthCheck.requestmethod == 'GET'){
      // console.log( healthCheck.requestmethod )
      checkPromises.push(axios({
        url: uri,
        method:healthCheck.requestmethod,
        headers: healthCheck.headers
      }));
    }

    if ( healthCheck.requestmethod == 'POST'){
      // console.log( "method:",healthCheck.requestmethod )
      // console.log( "body:",healthCheck.body )
      // console.log( "header:",healthCheck.headers )
      checkPromises.push(axios.post(
        uri,
        healthCheck.body,
        {
          headers: healthCheck.headers
        }
      ));
    }
    
  });

  const checkResults = [];

  return allSettled(checkPromises).then(results => {
    results.forEach((result, index) => {
      if (result.state === 'rejected') {
        checkResults.push({
          path: healthChecks[index].path,
          status: 'failed'
        });
      } else {
        checkResults.push({
          path: healthChecks[index].path,
          status: 'ok'
        });
      }
    });

    return checkResults;
  });
};
