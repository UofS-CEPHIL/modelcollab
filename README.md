# ModelCollab

## About

ModelCollab is a web-based collaborative modelling application with
the front end in Typescript, React, and Firebase, and the modelling
logic in Julia.

ModelCollab is written by Eric Redekopp, Xiaoyan Li, and Long Pham of the
University of Saskatchewan CEPHIL lab, with support from Dr. Nathaniel
Osgood.

The current production version of this application is available for public 
use. See the instructions in [the docs](docs/UserInterface.md) for more 
information.

## Design

Modelcollab currently consists of 3 components:
- The React frontend, found in the 'webui' directory
- The server which invokes the Julia code, found in the 'server' directory
- The Firebase database, which runs on the Firebase servers. The
  "Database" directory still exists for posterity but doesn't include
  anything particularly interesting anymore.

No build instructions for a local development build are included at
this time. If you would like detailed build instructions to run the
software locally, please create an issue requesting them.
