const fs = require('fs');
const {join} = require('path');
const http = require('http');
const static = require('node-static');

function renderDirectoryList(dir, url, callback) {
  fs.readdir(join(dir, url), (error, files = []) => {
    callback(`
      <html>
        <body>
          <ul>
            ${files.map(a => `<li><a href="${join(url,a)}">${a}</a></li>`).join('')}
          </ul>
        </body>
      </html>`
    );
  });
}

function startServer(dir, port, notFoundHandler = ()=>{}) {
  console.log('Starting server...');
  var fileServer = new static.Server(dir);

  return http.createServer((request, response) => {
    request.addListener('end', function () {
      fileServer.serve(request, response, err => err && notFoundHandler(request, response, dir));
    }).resume();
  }).listen(port, () => console.log('Server started on port ' + port));
}

function directoryListing({url}, response, dir) {
  fs.stat(join(dir, url), (error, stats) => {
    if(!error && stats && stats.isDirectory()) {
      response.writeHead(200, {'Content-Type': 'text/html'});
      renderDirectoryList(dir, url, html => response.end(html));
    } else {
      response.writeHead(404, {'Content-Type': 'text/plain'});
      response.end('Not found')
    }
  });
}

exports.start = startServer;
exports.directoryListing = directoryListing;
