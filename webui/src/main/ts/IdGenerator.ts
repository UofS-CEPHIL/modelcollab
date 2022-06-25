export default class IdGenerator {

    // TODO: generate random number. If that number is not already in
    // use, reserve it by adding an object for that ID filled with
    // arbitrary data (can we do this atomically? Otherwise could lead
    // to invalid state though unlikely). If it is in use, restart.
    
    generateSessionId() {
        return 1;
    }

    generateComponentId() {
        return Math.floor(Math.random() * 100);
    }
}
