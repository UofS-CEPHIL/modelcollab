import io from os
import json

FILENAME = ""

def makeModelDataEntry(uuid, data):
    model = data["models"][uuid]
    return {
        "components": model["components"],
        "scenarios": model["scenarios"],
        "substitutions": model["substitutions"],
        "overrides": model["overrides"],
        "loadedModels": model["loadedModels"]
    }

def makeModelMetadataEntry(uuid, data):
    model = data["models"][uuid]
    return {
        "ownerUid": model["ownerUid"],
        "name": model["name"],
        "type": model["modelType"],
        "sharedWith": [],
    }

data = None

with file as io.open(FILENAME, 'r'):
    data = json.load(file)

uids = keys(data['users'])
modelIds = keys(data['models'])

newdata = {
    "models": {id: makeModelDataEntry(id, data) for id in modelIds},
    "modelMeta": {id: makeModelMetadataEntry(id, data) for id in modelIds},
    "users": {}
}

with file as io.open(FILENAME + "-migrated", 'w'):
    json.dump(newdata, file)
