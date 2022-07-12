
#################################### About #####################################

Modelcollab is an application that lets multiple users collaborate in
real-time on creating simulation models.  This is accomplished using a
React/Typescript/Firebase frontend, and a backend which consists of a
Node server with an endpoint which fetches the simulation data from
Firebase, interprets it into Julia code, then runs a Julia application
to produce results for the model.


################################### Modules ####################################

ModelCollab contains the following modules. Each module has its own
documentation page with additional information.

webui:
    The front-end of the application. This module contains all the
    React code to display the webpage to the user, and interacts with
    the database using the interface provided by the `database` module

database:
    Contains code for interacting with Firebase. The FirebaseDataModel
    and FirebaseManager are the most important classes in this class,
    and the FirebaseComponentModel contains classes representing the
    different React components as they exist within the Firebase
    database.

integration-tests:
    This module contains the integration tests for ModelCollab, which
    are implemented using Selenium WebDriver.

server:
    The back-end of the application. This module contains a Node
    server which performs compute tasks on request from the webui and
    interacts with the database using the interface provided by the
    `database` module.


#################################### Common ####################################

All modules store their config as source code in the main source
directory, usually in a folder called congfig in files called
applicationConfig and firebaseConfig

