class ApiResponce {
    constructor(status, data, message) {
        this.status = status;
        this.data = data;
        this.message = message;
        this.sucess = statusCode < 400;
    }
}
