# ModelCollab

## About

ModelCollab is a web-based collaborative modelling application with
the front end in Typescript, React, and Firebase, and the modelling
logic in Julia.

ModelCollab is written by Eric Redekopp, Xiaoyan Li, and Long Pham of the
University of Saskatchewan CEPHIL lab, with support from Dr. Nathaniel
Osgood.

## Design

Modelcollab currently consists of 3 components:
- The React frontend, found in the 'webui' directory
- The server which invokes the Julia code, found in the 'server' directory
- The Firebase database, for which we use the API. Classes describing the database structure are found in the 'database' directory. 

## Build
- webui
  - `npm start` to run a development version of the frontend on localhost:3000
  - `npm run build` to compile an optimized version of the frontend
  - `num test` to run the Jest unit tests
- server
  - `npm run build` to build
  - `npm run start` to start the https server
  - `npm test` to run the Jest unit tests
- database
  - `npm run build` to build
  - No code to run, and no unit tests. 
  - Must be built before running webui or server
