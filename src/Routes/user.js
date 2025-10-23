const { Router } = require('express')
const router = Router()
const { getUsers, createUser, getUser, updateUser, deleteUser, getProfile, updateProfile, createToken } = require('../Controllers/userControllers')
const { verify } = require('../jwt')

router.route('/')
    .get(getUsers)
    .post(createUser)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }))

router.route('/:idUser')
    .get(verify, getUser)
    .put(verify, updateUser)
    .delete(verify, deleteUser)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }))

router.route('/:idUser/jwt')
    .post(createToken)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }))

router.route('/:idUser/:idProfile')
    .get(verify, getProfile)
    .put(verify, updateProfile)
    .all((req, res) => res.status(405).send({ message: 'Method Not Allowed' }))

router.use((req, res) => {
    res.status(404).send({ 
        message: 'Not Found', 
        path: req.originalUrl 
    });
});

module.exports = router