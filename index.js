const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const {nanoid} = require('nanoid');
const monk = require('monk');

const app = express();
require('dotenv').config();
const db = monk(process.env.MONGODB_URI)


const notFoundPath = path.join(__dirname, 'public/404.html');

const urls = db.get('urls');  
urls.createIndex('name');

const schema = yup.object().shape({
    slug: yup.string().trim().matches(/[\w\-]/i),
    url:yup.string()
        .matches(
            /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
            'Enter correct url!'
        )
        .required('Please enter website')
    // url: yup.string().trim().url().required(),

})
  
app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

app.use(express.static('./public'));

app.get('/',(req,res,next) => {
    res.json({
        message: "🌝"
    });

})
app.get('/:id', async (req, res, next) => {
    const { id: slug } = req.params;
    try {
      const url = await urls.findOne({ slug });
      if (url) {
        return res.redirect(url.url);
      }
      return res.status(404).sendFile(notFoundPath);
    } catch (error) {
      return res.status(404).sendFile(notFoundPath);
    }
  });
  
app.get('/url/:id', async (req,res,next) => {
    // Get URL of slug.
    const {id:slug} = req.params;
    const url = await urls.findOne({slug});
    try {
        if(url) 
        {
            // Found URL for slug, send it on back.
            res.json( {
                mesage:`URL ${url.url} for slug ${slug}`,
                
            })
            
        }
        
    }
    catch(error) 
    {
        next(error);
    }
})

app.post('/url',async (req,res,next) => {
   //Create short url.
 let {slug,url} = req.body;
 try {
    await schema.validate(
        { slug,   
            url
        });
     if(!slug)
     {
         slug = nanoid(5);
     }
     else {
         const existing = await urls.findOne({slug});
         if(existing)
         {
            
             throw new Error('Slug in use.');
         }

     } 
     slug = slug.toLowerCase();
     const newUrl = {
         url,
         slug,
         
     };
     const created = await urls.insert(newUrl);
     res.json(created);
    
    
 } catch (error) {
   next(error);  
 }

});

app.use((req, res, next) => {
    res.status(404).sendFile(notFoundPath);
  });
  
app.use((error,req,res,next) => {
    if (error.status) {
        res.status(error.status);
    }
    else {
        res.status(500); 
    }
        res.json({
            message: error.message,
            stack: process.env.NODE_ENV === 'production'  ? 'pancake' : error.stack

         })
});


const port = process.env.PORT || 1337;
app.listen(port,() => {
    console.log("Listening!");
}) 