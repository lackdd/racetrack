// setters, getters

// race driver list

class Store {
    constructor() {
        this.data = {};
    }

    set(key, value) {
        this.data[key] = value;
    }

    get(key) {
        return this.data[key];
    }

    remove(key) {
        delete this.data[key];
    }

    getAll() {
        return this.data;
    }

    clear() {
        this.data = {};
    }
}

module.exports = new Store();
