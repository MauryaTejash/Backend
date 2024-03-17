class ApiError extends Error{
    constructor(
        statusCode,
        message='Something went wrong',
        errors=[],
        stack=""
    )
    {
        // to override the above data values we use 'super' keywords
        super(message)
        this.statusCode = statusCode,
        this.message = message,
        this.data = null,
        this.success = false,
        this.errors = errors

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructure)
        }
    }
}

export {ApiError}