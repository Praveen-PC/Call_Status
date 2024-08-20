const express=require('express')
const mysql=require('mysql2')

const con=mysql.createConnection({
    host:"localhost",
    password:"@Root123",
    user:"root",
    database:"callstatus"
})

con.connect((err,data)=>{
    if (err) throw err
    console.log("connected")
})


module.exports=con