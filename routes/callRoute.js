const express = require('express')
const path = require('path')
const multer = require('multer')
const router = express.Router()
const db = require('../db')



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const uploaded = multer({ storage: storage })



router.value = (req, res) => {
    const sqlTotalCalls = 'SELECT COUNT(*) AS totalCalls FROM callstatus.calldetails';
    const sqlOpenCalls = 'SELECT COUNT(*) AS openCalls FROM callstatus.calldetails WHERE status = "open"';
    const sqlClosedCalls = 'SELECT COUNT(*) AS closedCalls FROM callstatus.calldetails WHERE status = "closed"';

    // Execute all queries in parallel
    db.query(sqlTotalCalls, (err, totalCallsResult) => {
        if (err) return res.status(500).send('Server error');


        db.query(sqlOpenCalls, (err, openCallsResult) => {
            if (err) return res.status(500).send('Server error');


            db.query(sqlClosedCalls, (err, closedCallsResult) => {
                if (err) return res.status(500).send('Server error');


                // Prepare counts
                const totalCalls = totalCallsResult[0].totalCalls;
                const openCalls = openCallsResult[0].openCalls;
                const closedCalls = closedCallsResult[0].closedCalls;
                var sql = 'select * from callstatus.calldetails'
                db.query(sql, (err, result) => {
                    if (err) throw err
                    res.render('index', {
                        title: "Macsoft | Call_Status",
                        db: result,
                        // status:statusCounts
                        totalCalls,
                        openCalls,
                        closedCalls
                    })
                })

            })
        })
    })
}


router.postAddCall = (req, res) => {
    uploaded.single('attachment')(req, res, (err) => {
        if (err) {
            return res.status(500).send(err.message)
        }
        const attachment = req.file ? req.file.filename : null;

        var { customerid, company, phone, controllerno, date, productname, itemtype, state, issue, solution, status } = req.body;
        var sql = `INSERT INTO callstatus.calldetails (customerid,company,phone,controllerno, date, productname,itemtype, state, issue, solution,attachment, status) VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?,?,?)`;
        db.query(sql, [customerid, company, phone, controllerno, date, productname, itemtype, state, issue, solution, attachment, status], (err, result) => {
            if (err) throw err;
            res.redirect('/')
            console.log("Value is inserted");
        });
    })
}


router.getEditCall = (req, res) => {
    var { controllerno } = req.params
    var sql = 'select * from callstatus.calldetails where controllerno=?'
    db.query(sql, [controllerno], (err, result) => {
        if (err) throw err
        res.render('editcall', {
            value: result[0]
        })
    })
}


// router.postEditCall=(req,res)=>{
//     // var {controllerno}=req.params
//     // var {company,phone,controllerno, date, productname,itemtype, state, issue, solution, status}=req.body
//     // var sql='update callstatus.calldetails set company=?, phone=?,date=?,productname=?,itemtype=?,state=?,issue=?,solution=?,status=? where controllerno=?'
//     // db.query(sql,[company,phone, date, productname,itemtype,state, issue, solution, status,controllerno],(err,result)=>{
//     //     if (err) throw err
//     //     res.redirect('/')
//     // })
//     const { controllerno } = req.params;
//     uploaded.single('attachment')(req, res, (err) => {
//         if (err) return res.status(500).send(err.message);
//         const attachment = req.file ? req.file.filename : null ;
//         const { company, phone, date, productname, itemtype, state, issue, solution, status } = req.body;
//         const sql = 'UPDATE callstatus.calldetails SET company = ?, phone = ?, date = ?, productname = ?, itemtype = ?, state = ?, issue = ?, solution = ?, status = ?, attachment = ? WHERE controllerno = ?';
//         db.query(sql, [company, phone, date, productname, itemtype, state, issue, solution, status, attachment, controllerno], (err, result) => {
//             if (err) return res.status(500).send('Server error'+err);
//             res.redirect('/');
//         });
//     });
// }


router.postEditCall = (req, res) => {
    const { controllerno } = req.params;

    // Handle the file upload
    uploaded.single('attachment')(req, res, (err) => {
        if (err) return res.status(500).send(err.message);

        const attachment = req.file ? req.file.filename : null;
        const { company, phone, date, productname, itemtype, state, issue, solution, status } = req.body;

        // Query to get the current attachment if no new file is uploaded
        const getCurrentAttachment = `SELECT attachment FROM callstatus.calldetails WHERE controllerno = ?`;

        db.query(getCurrentAttachment, [controllerno], (err, result) => {
            if (err) return res.status(500).send('Server error ' + err);

            const currentAttachment = result[0]?.attachment;

            // Use the current attachment if no new file is uploaded
            const finalAttachment = attachment || currentAttachment;

            const sql = `UPDATE callstatus.calldetails 
                         SET company = ?, phone = ?, date = ?, productname = ?, itemtype = ?, state = ?, issue = ?, solution = ?, status = ?, attachment = ? 
                         WHERE controllerno = ?`;

            db.query(sql, [company, phone, date, productname, itemtype, state, issue, solution, status, finalAttachment, controllerno], (err, result) => {
                if (err) return res.status(500).send('Server error ' + err);
                res.redirect('/');
            });
        });
    });
};


router.deleteCall = (req, res) => {
    var { controllerno } = req.params
    var sql = 'delete from callstatus.calldetails where controllerno=?'
    db.query(sql, [controllerno], (err, result) => {
        if (err) throw err
        res.redirect('/')
        console.log("data is deleted")
    })
}


module.exports = router