Logger = function (name) {
    this.name = name;

    this.debug = (message) => {
        console.log(`${this.name} - DEBUG - ${message} `);
    }

    this.info = (message) => {
        console.log(`${this.name} - INFO - ${message} `);
    }

    this.error = (message) => {
        console.log(`${this.name} - ERROR - ${message} `);
    }
}


export default Logger;

