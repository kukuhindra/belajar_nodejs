const express = require('express');
const databaseMysql = require('./mysql');
const app = express();
const port = 3030;

var validator = require('validator');

// untuk mendapatkan data dari post form html 
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) 

// set view template untuk ejs di express 
app.set('view engine', 'ejs');
app.use(express.static('public'));

// index list page
app
  .get('/', function(req, res) {
    let sql = `SELECT title, content, slug_id FROM post`;

    databaseMysql.query(sql, (error, results, fields) => {
      if (error){
        console.log(error);
        return res.render('pages/index', {
          error: true, 
          messages: "Ada masalah koneksi Nodejs ke Mysql"    
        }); 
      } else {

        console.log(results);

        return res.render('pages/index', {
          error: false,
          posts: results
        });
      }
    });

  });

// Create page
app
  .get('/create', function(req, res) {
    res.render('pages/create_post');
  })
  .post('/create', function(req, res) {
    if (validator.isEmpty(req.body.content) || validator.isEmpty(req.body.title)) {
      return res.render('pages/create_post', {
          error: true, 
          messages: "Data title atau content tidak boleh kosong"
        }); 
    }

    let {title, content} = req.body;

    // membuat slug dari title
    slug_id = title.toString().toLowerCase()
      .replace(/^-+/, '')
      .replace(/-+$/, '')
      .replace(/\s+/g, '-')
      .replace(/\-\-+/g, '-')
      .replace(/[^\w\-]+/g, '');
    
    // query mysql insert data content mysql
    let sql = `INSERT INTO post SET ?`;

    // prepared insert data content mysql
    let data = {title, content, slug_id};

    databaseMysql.query(sql, data, (error, results, fields) => {
      if (error){
        console.log(error);
        return res.render('pages/create_post', {
          error: true, 
          messages: "Ada masalah koneksi Nodejs ke Mysql"    
        }); 
      }
    });

    return res.render('pages/create_post', {
      error: false, 
      messages: "Data post berhasil ditambahkan"    
    }); 
});

// Read single post page
app
  .get('/read/:slug_id', function(req, res) {
    let sql = `SELECT * FROM post WHERE slug_id = ? LIMIT 1`;
    let slug_id = req.params.slug_id;

    databaseMysql.query(sql, slug_id, (error, results, fields) => {
      if (error){
        console.log(error);
        return res.render('pages/read_post', {
          error: true, 
          messages: "Postingan tidak ditemukan di Mysql"    
        }); 

      } else {        
        console.log( results[0]);
        return res.render('pages/read_post', {
          error: false,
          result: results[0]
        });

      }
    });

  });

// Update post page
app
  .get('/update', function(req, res) {
    let sql = `SELECT id, title, slug_id FROM post`;

    databaseMysql.query(sql, (error, results, fields) => {
      if (error){
        console.log(error);
        return res.render('pages/update_post', {
          error: true, 
          messages: "Ada masalah koneksi Nodejs ke Mysql"    
        }); 
      } else {

        console.log(results);

        return res.render('pages/update_post', {
          error: false,
          posts: results
        });
      }
    });

  })
  .get('/update/:slug_id', function(req, res) {
    let sql = `SELECT * FROM post WHERE slug_id = ? LIMIT 1`;
    let slug_id = req.params.slug_id;

    databaseMysql.query(sql, slug_id, (error, results, fields) => {
      if (error){
        console.log(error);
        return res.render('pages/update_post', {
          error: true, 
          messages: "Postingan tidak ditemukan di Mysql"    
        }); 

      } else {        
        return res.render('pages/edit_post', {
          error: false,
          result: results[0]
        });

      }
    });

  })
  .post('/update/:slug_id', function(req, res) {
    let {title, content} = req.body;
    let sql = `SELECT * FROM post WHERE slug_id = ? LIMIT 1`;
    let slug_id = req.params.slug_id;

    databaseMysql.query(sql, slug_id, (error, results, fields) => {
      if (error){
        console.log(error);
        return res.render('pages/update_post', {
          error: true, 
          messages: "Postingan tidak ditemukan di Mysql"    
        });

      }
    });

    sql = "UPDATE post SET title = ?, content = ? WHERE slug_id = ?";
    databaseMysql.query(sql, [title, content, slug_id], (error, results, fields) => {
      if (error){
        console.log(error);
        return res.render('pages/update_post', {
          error: true, 
          messages: "Ada masalah koneksi Nodejs ke Mysql"    
        }); 

      }
    });

    sql = `SELECT * FROM post WHERE slug_id = ? LIMIT 1`;
    databaseMysql.query(sql, slug_id, (error, results, fields) => {
      if (error){
        console.log(error);
        return res.render('pages/update_post', {
          error: true, 
          messages: "Ada masalah koneksi Nodejs ke Mysql"    
        }); 

      } else {
        return res.render('pages/edit_post', {
          error: false,
          messages: "Data post berhasil diupdate di Mysql",
          result: results[0]
        });

      }
    });
  });

// Delete page page
app
  .get('/delete/:slug_id', function(req, res) {
    
    let sql     = "DELETE FROM post WHERE slug_id = ?";
    let slug_id = req.params.slug_id;

    databaseMysql.query(sql, slug_id, (error, results, fields) => {
      if (error){
        console.log(error);
        return res.render('pages/delete_post', {
          error: true, 
          messages: "Ada masalah koneksi Nodejs ke Mysql"    
        }); 

      } else {
        return res.render('pages/delete_post', {
          error: false,
          messages: "Data post berhasil didelete di Mysql",
        });

      }
    });
    
  });

app
  .listen(port, () => console.log(
    `App listening to port http://localhost:${port}, Running at: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`
    ));