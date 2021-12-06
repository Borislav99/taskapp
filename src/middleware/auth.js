// jwt library
const jwt = require("jsonwebtoken")
// pronalaz korisnika
const User = require("../models/user")
const auth = async (req, res, next)=>{
    try {
        // kako dobiti vrijednost iz headera (authorization)
        let token = req.header('Authorization')
        // potrebno je dobiti jwt iz tokena (ukloni Bearer)
        token = token.replace("Bearer ", "")
        // dekodirana vrijednost _id i iat(vrijeme nastanka tokena)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // pretraga na osnovu id i vrijednosti tokena
        const user = await User.findOne({_id:decoded._id, 'tokens.token':token})
        // ako nema korisnika
        if(!user) {
            // ovo ce triggerovati catch
            throw new Error()
        }
        // route handleru cemo dati pristup korisniku koga smo nasli iz baze, dodajemo novi property na req
        req.user = user
        req.token = token
        // ako korisnik postoji mora se pokrenuti route handler
        next()
    } 
    // ako se korisnik ne autentikuje poslacemo gresku nazad
    catch(err) {
        res.status(401).send({error:'please authenticate'})
    }
}
module.exports = auth