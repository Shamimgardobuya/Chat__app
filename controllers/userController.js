const node_env = process.env.DEV_ENV || development
const knex = require('knex')(require('../knexfile').node_env)
const json = require('jsonwebtoken')
const bcrypt = require('bcrypt')


const  createUser = async (req, res ) => {
    try {
        let {username, email , password } = req.body

        if (!req.body.password) {
            return res.json({ message: " Password is required" })
    
        }
        const salt = await bcrypt.genSalt();
    
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
         await knex('users')
                  .insert({
                    username : username,
                    email: email, 
                    password : hashedPassword
                  })
        return res.status(201).json(
            {message: 'user created successfully'}
        )
        
    } catch (error) {
        console.log(error)
        return res.json({
            message: 'An error occurred , user not created successfully', error
        })
        
    }


 

}
const userLogin = async (req, res) => {
    try {
        request = req.body
        console.log(request)
        const email = req.body.email
        const password = req.body.password
        const check_user = await knex('users')
                                    .where(
                                        {
                                            email : email
                                        }
                                    ).first();
        const confirmPassword = await bcrypt.compare(password, check_user.password);
        req.session.user = { id: check_user.id, username: check_user.username };
        
        if (check_user && confirmPassword) {
            console.log('passes');
            // return res.redirect('/')
            return res.status(200).json(
                {
                message: 'User logged in successfully', 
                user: req.session.user,
                redirectUrl : '/'
            })
        }
    } catch (error) {
    
        console.log(error)
        return res.status(401).json({
                message: 'unauthorized access '
            })
    }

}

module.exports = {
    createUser,
    userLogin
}