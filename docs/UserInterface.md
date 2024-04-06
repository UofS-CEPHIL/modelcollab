# User Interface

This document contains instructions on how to use ModelCollab over the web as an end-user.

## Geting to the website

The website is currently hosted at
[modelcollab.web.app](https://modelcollab.web.app). Since the
application is based on Google Firebase, all authentication is handled
through your Google account. Press the button on the landing page to
sign in with Google.

## Model Selection & Creation

After logging in, you should be sent to the "Model Selection" screen,
which should include "My Models" and "Shared With Me". At the moment,
there is no ownership over models and the "Shared With Me" section
includes every model in the whole database that *doesn't* belong to
you. "My Models", of course, contains all models in the database that
were created by you.

Click on a model name to open it and start editing.

ModelCollab currently supports two types of models: Stock & Flow
models and Causal Loop Diagrams. To create a new model, use the form
at the top of the page to enter a name for the model and select
whether you would like Stock & Flow or Causal Loop.

## Stock & Flow Diagrams

### Components

Stock & Flow diagrams are based on StockFlow.jl. The components include:

- *Stocks*: A state variable representing a quantity at some moment in
  time. These are represented as "boxes" on screen.

- *Flows*: A differential equation representing the flow from one
  stock into another. These are represented as double-lined arrows
  between two objects, and can either connect stocks, or connect
  to/from a "cloud" which represents flowing into/out of the system
  via some infinite stock not considered in the model.

- *Parameters*: A constant numerical value with no dependencies on
  other components.

- *Dynamic Variables*: A variable that may change over time depending
  on the values of other model components.

- *Sum Variables*: A special case of dynamic variables that simply
  takes the sum of one or more stocks.

- *Connections*: An arrow indicating a dependency between two
  components. These arrows *must* be drawn between components and
  their dependencies. For instance, if a flow f has a value of `p \*
  A` for some parameter p and stock A, then there must be connections
  from p and A to f, or else the model will fail to build.

- *Static Models*: Another Stock & Flow model imported from elsewhere
  and whose values cannot be changed after importing. These are
  represented as a group of components contained within a colored
  box. You can connect components from static models with components
  from the outer model or from other static models either by creating
  a flow between them, or by "identifying" them to indicate that they
  should be treated as the exact same component. When components are
  identified, one of the components will be deleted and all of its
  arrows will be rerouted to its identified component.

### Entering Components

The Stock & Flow system has a mode-based UI. To enter or modify a component or
modify, select the appropriate mode for the action and click on
the desired location. Modes are shown in the top-left corner of the
screen, and can be selected either by clicking their icon or by
pressing the key indicated by the letter next to the icon. Hover over
the icons to get a tooltip indicating their mode.

The available modes are:

- **Move mode**: Move, edit, and resize components, with no special
  actions happening when a component or the canvas is clicked. It is
  strongly recommended that you make a habit of switching to this mode
  any time you are not actively entering components, as the other
  modes can become annoying or disorienting (upgrades to the UI are
  upcoming to mitigate this).

- **Stock, Parameter, Dynamic Variable, and Sum Variable modes**: Click
  on the canvas to enter the corresponding component.

- **Flow mode**: Click twice to create a flow. If you click on the
  canvas first and then on a stock, it will create a flow from a
  "cloud" to the selected stock. If you click on a stock first and
  then the canvas, it will create a flow from the selected stock to a
  cloud. Right-click to reset any previous clicks.

- **Connect mode**: Similar to Flow mode: click on two components to
  create a connection between them. Connect mode will not create any
  clouds, and will not allow you to create a connection between
  incompatible components.

- **Identify mode**: Click on two components to identify them. The
  components must be in different models (i.e. two static models, or a
  static model and the outer model). The first component will be
  consumed by the second component, and all of its arrows will be
  redirected to the secomd component.

- **Static Models**: Static models are imported by clicking the "Model
  Actions" button on the toolbar (the "..." button) and selecting the
  "Import Model" item. This will open a menu showing all of the
  available models and prompting you to select one.

### Editing Components

- **Change a component's text**: Double-click the component and start
  typing. Press Enter or click on the canvas to stop editing.

- **Change a component's value**: Open the sidebar using the "sidebar"
  button on the top-right of the screen. Set the mode to "Edit
  Component", and select the desired component. Change the value as
  needed in the corresponding text box. Be sure to press the "Save"
  button when you're done.

- **Undo an identification**: In the same "Edit Component" mode, click
  the "Undo Identifications" button to undo all identifications with
  the selected component.

- **Move a component**: Simply click and drag the component.

- **Resize a component**: Select the component to show its resize
  handles. Click and drag one of the handles to change the component's
  size.

- **Bend a flow or connection arrow**: Select the arrow to show its
  resize handles. Click and drag one of the handles to bend the
  component, or to change its entry/exit point. Sometimes, after
  editing an arrow a lot it will have too many handles and become
  unwieldy. To reset this, move the entry or exit point of the arrow
  slightly.

### Managing Scenarios

Scenarios allow you to change the values of parameters for a
particular model run.

- **Create a new scenario**: Open the sidebar using the "sidebar"
  button on the top-right of the screen. Set the mode to "Edit
  Scenarios", and use the "Add Scenario" text box to create a new
  scenario.

- **Edit a scenario**: In the same "Edit Scenarios" mode, use the text
  boxes to modify the start time, stop time, and any parameter values
  that you'd like to. Be sure to press the "Save" button when you're
  done.

- **Delete a scenario**: In the same "Edit Scenarios" mode, press the
  "Delete Scenario" button.

### Interpreting a Model

"Interpreting" a model means to run it as code. At the moment, this
only includes running it as a system of ODEs as one would normally do
with a Stock & Flow model. However, in the future we plan to add
different modes of execution that aren't so rigidly tied to the ODE
definition of a Stock & Flow model.

- **Run as ODE**: Click the "Run" button in the toolbar (the "play"
  button), and select "ODE" from the menu. The "play" button should
  change to a spinning wheel until the model finishes running, then it
  will automatically download a .png file through your browser showing
  the values of each stock throughout the model run. More
  sophisticated methods of viewing simulation results are planned for
  the future.

- **Get Code**: Click the "Model Actions" button in the toolbar (the
  "..." button), and select "Get Code". This will download a file
  through your browser representing the model as Julia code using the
  StockFlow.jl package. This is the exact code that is executed to
  produce the results with the "Run as ODE" button.

### Saving a Model

All changes to a model are automatically saved in the database as soon
as the action is performed, with no action required on your part. If
you would like to save a snapshot of the model, you can use the "Get
JSON" button in the "Model Actions" menu (the "..." button) to get the
current model state as a .json file. Currently, there is no way to
import a .json file to ModelCollab through the UI, however if you
would really like to reset the state of your model you can contact
Eric at eric.redekopp@usask.ca to have it done manually.

Future plans for the application include the ability to import models
from saved .json files, as well as more sophisticated version-control
schemes inspired by software version-control systems such as Git.


## Causal Loop Diagrams

Causal loop diagrams are in the very early stages of development. They
use a mode-based UI very similar to stock and flow mode and can be
used for building diagrams in small-scale situations mainly on a
"playground" basis.

The most interesting aspect of the CLD mode is that it serves as the
testbed for the new and improved UI. Documentation for this UI mode
will be added in the future, however for now if you'd like to
experiment with it, you can do so by clicking the "..." button on the
toolbar and selecting "Hotkey UI".
