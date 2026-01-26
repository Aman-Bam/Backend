class ApiError extends Error {
    constructor(
        ststusCode,
        message = "Something went wrong",
        errors = [],
        statck = ""
    ) {
        super(message);
        this.statusCode = ststusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (statck) {
            this.stack = statck;
        } else {
            Error.captureStackTrace(this, this.construtor);
        }
    }
}

export {ApiError}