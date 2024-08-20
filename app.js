const express=require('express')
const bodyparser=require('body-parser')
const router=require('./routes/callRoute')
const db=require('./db')
const path=require('path')


var app=express()
app.set('view engine','ejs')
app.use(bodyparser.urlencoded({extended:false}))
app.use(express.static('public'));
 app.use('/images', express.static(path.join(__dirname, 'public/images')));
 app.use('/upload',express.static(path.join(__dirname,'upload')))
 




app.get('/',router.value)
app.post('/',router.postAddCall) 
app.get('/edit/:controllerno',router.getEditCall)
app.post('/edit/:controllerno',router.postEditCall)
app.get('/delete/:controllerno',router.deleteCall)



const PORT=8080
app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
})