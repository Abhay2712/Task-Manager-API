const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})

// mongodb+srv://Abhay:KpnaegRITb4g5KMZ@cluster0.wqshe.mongodb.net/task-manager-api?retryWrites=true&w=majority //connecting to mongodb cluster online(mongodb compass)
//mongodb://127.0.0.1:27017/task-manager-api //connecting to mongodb local