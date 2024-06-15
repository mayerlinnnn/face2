require('dotenv').config();
const {CLAVESITIO,CLAVESECRETA,PASSWORDAPP,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET} = process.env;
const express = require('express');
const session = require('express-session');
//let handlebars = require('express-handlebars')
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const Controllers = require('./controllers/controllersContacto.js');
const controllers = new Controllers();
const Recaptcha = require('express-recaptcha').RecaptchaV2;
const recaptcha = new Recaptcha(CLAVESITIO,CLAVESECRETA);

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
//configuracion de transporter
/////////////////////////////////////////////////////
const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.use(new GoogleStrategy({
    clientID:GOOGLE_CLIENT_ID,
    clientSecret:GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:5000/google/callback",
    passReqToCallback:true
    //Randy Graterol 
  },
  function(request, accessToken, refreshToken, profile, done) {
      return done(null,profile); 
  }
));

passport.serializeUser(function(user,done){
  done(null,user)
});

passport.deserializeUser(function(user,done){
  done(null,user)
});

/////////////////////////////////////////////////////
function isLoggedIn(req,res,next){
  req.user ? next() : res.sendStatus(401);
}
//////////////////////////////////////////////////////
////////////////////////////////////////////////////////
const app = express();
app.use(cookieParser());
app.use(session({secret:"cats"}));
app.use(passport.initialize());
app.use(passport.session());
//////////////////////////////////////////////

const server = http.createServer(app);
//recursos que se van a cargar en el server 
app.use(express.static(__dirname+'/static'));

//Configuración de las plantillas

app.set('view engine','ejs');//definimos el motor de plantilla con archivos ejs
app.set('views',path.join(__dirname,"./views"));//definimos la ruta del motor de plantilla

app.use(express.urlencoded({extended:false}));//permite recuperar los valores publicados en un request
app.use(express.json());
// Rutas y lógica de tu aplicación


app.get('/', async (req, res) => {
  try {
    res.render('index',{og: {
      title: 'Currículum Vitae',
      description:'Prueba',
      image: 'https://www.pexels.com/es-es/foto/persona-sosteniendo-un-smartphone-android-samsung-blanco-6347724/',
      // Otros metadatos OGP que desees especificar
      }});
  } catch (err) {
    res.status(500).json({error:'Error el en servidor'});
  }
});
//autenticar con oauth....
app.get('/auth/google',
  passport.authenticate('google',{scope:['email','profile']})
);
//////////////////////////////////////////////////////////
app.get('/google/callback',
  passport.authenticate('google',{
  successRedirect:'/protected',
  failureRedirect:'/auth/failure'
  })
);
//////////////////////////////////////////////////////////
app.get('/auth/failure',(req,res)=>{
 res.send('Error al autenticar , ya que ha ingresado un correo electronico que no se encuentra registrado en la configuracion de consentimientos de OAut2 , por lo tanto debes tener en cuenta que esta metodologia se realizo basada en modo prueba , para mayor informacion revise encarecidamente la documentacion de autenticación con OAut , (¡OJO , no se trata de un error!)');
});
//////////////////////////////////////////////////////////
app.get('/protected',isLoggedIn,async (req,res)=>{
const datos = await controllers.obtener();
 res.render('contactos',{datos});
});

app.post('/contacto',async (req,res)=>{
try{
const {nombre,email,comentario} = req.body;
//De esta forma obtenemos la direccion ip que seria ::1 que es la representación de la dirección IP de loopback IPv6 en IPv4 segun randy...
const ip = req.ip;
const respuesta = await controllers.add(nombre,email,comentario,ip);
console.log(`Respuesta de controlador : ${respuesta}`);
res.status(200);
}catch(error){
console.error(error.message);
res.status(500).json({error:'Error en el servidor'});
}

});

// Otros endpoints y lógica de tu aplicación
const port = 5000;
server.listen(port,()=>{
  console.log(`Servidor Express iniciado en el puerto ${port}`);
});

process.on('SIGINT',()=>{
  db.close();
  process.exit();
});