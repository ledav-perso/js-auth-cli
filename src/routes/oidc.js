import express from 'express';
const oidcRouter = express.Router();

oidcRouter.get('/', (req, res) => {
    if (req.oidc.isAuthenticated()) {
        /*const user = {
            name: 'Alice',
            email: 'alice@example.com',
            age: 30
        };*/
        res.render('oidc', { user });
    }
    else {

    }
        ? 
        : `<h2>Non connecté</h2><a href="/login">Login</a>`);



});

export default oidcRouter;
