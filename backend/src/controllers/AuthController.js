const Authservise = require('../services/AuthService')
const login = async (req,res) =>{
    try {
        const {email,senha} = req.body;

        if(!email || !senha){
            return res.status(400).json({error: 'Email e senha são obrigatorios'});
        }
        const resultado = await Authservise.login(email,senha);
        res.status(200).json(resultado)
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
}

module.exports = {login};