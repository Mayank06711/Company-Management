import express from "express"


const app = express()

app.get('/', (req, res) => {
    res.status(201).send('Hello, World!')
})

// hello brother

app.listen(3000,()=>{
    console.log('Server is running on port 3000')
})