const express = require('express');
const dbconnection = require('./db');
const router = express.Router();
// user login route
router.post('/login', (request, respose) => {
    const { username, password } = request.body;

    dbconnection.query('SELECT * FROM members WHERE username = ? OR email = ?', [username, username], (err, results) => {
        if (err || results.length === 0) return respose.status(401).send('Invalid username or email');
        
        const user = results[0];
        if (password === user.password) {  // here is direct comparision betweeen user passord and actual password
            request.session.user = { id: user.id, username: user.username }; 
            respose.send('Login successful');
        } else {
            respose.status(401).send('Invalid Password');
        }  });
});
// user profile view route
router.get('/profile', (request, respose) => {
    if (!request.session.user) return respose.status(403).send('user is not logged in ');
    dbconnection.query(
        'SELECT first_name, last_name, phone, email FROM members WHERE id = ?',
        [request.session.user.id],
        (err, results) => {
            if (err) return respose.status(500).send('Error in fetching profile..');
            respose.json(results[0]);
        });
});
// user update profile route
router.put('/profile', (request, respose) => {
    const { first_name, last_name, phone, email } = request.body;
    dbconnection.query(
        'UPDATE members SET first_name = ?, last_name = ?, phone = ?, email = ? WHERE id = ?',
        [first_name, last_name, phone, email, request.session.user.id],
        (err) => {
            if (err) return respose.status(500).send('eror in updating profile');
            respose.send('profile has been update successfully');
        });
});
//update password route
router.put('/profile/password', (request, respose) => {
    const { new_password } = request.body;
    dbconnection.query(
        'UPDATE members SET password = ? WHERE id = ?',
        [new_password, request.session.user.id],
        (err) => {
            if (err) {
                console.error('Database Error:', err); 
                return respose.status(500).send('Error updating password');
            }
            respose.send('Password updated successfully');
        }
    );
});
//user add task route
router.post('/tasks', (request, respose) => {
    const { task, start_date, end_date } = request.body;
    dbconnection.query(
        'INSERT INTO activities (member_id,task,start_date,end_date) VALUES (?, ?, ?, ?)',
        [request.session.user.id, task, start_date, end_date],
        (err) => {
            if (err) return respose.status(500).send('not able to add task');
            respose.send('task added successfully');
        }
    );
});
module.exports = router; 
