exports['ping-server'] = {
  description: 'Simple function to check if requests are working',
  handler:     'lambda-functions/ping-server/index.handler',

  events: [
    { http: { path: 'ping', method: 'ANY', cors: { origin: '*' } } },
  ],
};
