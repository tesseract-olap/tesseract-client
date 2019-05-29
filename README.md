# tesseract-olap client

A javascript client to fetch and work with entities from a [tesseract-olap](https://www.tesseract-olap.io/) server.
Heavily inspired by the [mondrian-rest-client](https://github.com/Datawheel/mondrian-rest-client) project, but with some added functionality.

## Building and development use

While this library is in development and not published in npm, you can build it yourself and use it manually.

To build this library, install the dependencies using `npm install`, and then run `npm run build`. You can also test the built files using `npm test`.

To use the built files in another local project, run `npm link` in the root folder of this project, and then run `npm link tesseract-olap-client` in the root folder of the project where you want to use it. The first command will create a symbolic link from this project to the npm global space; the second command will "install" (create a symbolic link) the package from the npm global space to the node_modules folder in your project.
