const jwt = require('jsonwebtoken');
const privateKey = process.env.JWT_KEY;

const controller = {}

controller.verify = async function(req, res, next){
    const token = req.headers['authorization'];
    if(!token) return res.status(401).json({ message: "Access denied. No token provided." });
    try{
        const decoded = jwt.verify(token, privateKey, { algorithms: ['HS256'] });
        next();
    }catch(err){
        return [false, "Invalid token"];
    }
}

controller.sign = async (req) => {
    const passwordUser = req.body.password;
    try{
        const token = jwt.sign({ data: passwordUser }, privateKey, { algorithm: 'HS256', expiresIn: '1h' });
        return [true, token];
    }
    catch(err){
        return [false, 'Something went wrong while signing token...']
    }
}

module.exports = controller