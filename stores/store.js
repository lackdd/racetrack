// setters, getters

// race driver list

class Store {
    constructor() {
        this.data = {};
    }

    set(key, value) {
        if (typeof value === 'object') {
            this.data[key] = JSON.stringify(value);
        } else {
            this.data[key] = value;
        }
    }

    get(key) {
        const value = this.data[key];
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }

    remove(key) {
        delete this.data[key];
    }

    getAll() {
        const allData = {};
        for (let key in this.data) {
            allData[key] = this.get(key);
        }
        return allData;
    }

    clear() {
        this.data = {};
    }
}

module.exports = new Store();
