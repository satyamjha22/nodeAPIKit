const express = require('express');
const cors = require('cors');
const helmet  = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authRouter = require('./routers/authRouter');
const postsRouter = require('./routers/postsRouter');

const app = express();


app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Database connection established !');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);

app.get('/',(req, res )=>{
    res.json({message: 'Hello from server!'});
})


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

module.exports = app;