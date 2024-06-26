const express = require('express');
const router = express.Router();
var productModel = require('../model/product')
var BrandModel = require('../model/brand')
var TypeModel = require('../model/type')
var ResHelper = require('../helper/ResponseHelper');
const { query } = require('express');
var checkLogin = require('../middlewares/checklogin')
var checkAuthorize = require('../middlewares/checkauthorize');


//Lấy tất cả

  router.get('/', async function (req, res, next) {
    try {
      
      // Tìm tất cả các sản phẩm không bị xóa
      const undeletedBooks = await productModel.find({ isDeleted: false });
      ResHelper.RenderRes(res, true, undeletedBooks)
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi khi truy xuất thất bại');
    }
  });

//Đối với admin
  router.get('/getproductForAdmin', async function (req, res, next) {
    try {  
      // Tìm tất cả các sản phẩm không bị xóa
      const undeletedBooks = await productModel.find({ isDeleted: false }).limit(8);
      console.log(undeletedBooks);
      ResHelper.RenderRes(res, true, undeletedBooks)
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi khi truy xuất thất bại');
    }

  });

  router.get('/getproductForAdminManage', async function (req, res, next) {
    try {  
      // Tìm tất cả các sản phẩm không bị xóa
      const undeletedBooks = await productModel.find({}).limit(8);
      console.log(undeletedBooks);
      ResHelper.RenderRes(res, true, undeletedBooks)
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi khi truy xuất thất bại');
    }

  });

  router.get('/BPC', async function (req, res, next) {
    try {
      const type = await TypeModel.findOne({ Typeid: "BPC" });
      //Tìm theo loại sản phẩm
      // Tìm tất cả các sản phẩm không bị xóa
      const undeletedBooks = await productModel.find({ isDeleted: false, Typeid: type._id  }).limit(8);
      ResHelper.RenderRes(res, true, undeletedBooks)
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi khi truy xuất thất bại');
    }
  });

  router.get('/CMT', async function (req, res, next) {
    try {
      const type = await TypeModel.findOne({ Typeid: "CMT" });
      //Tìm theo loại sản phẩm
      // Tìm tất cả các sản phẩm không bị xóa
      const undeletedBooks = await productModel.find({ isDeleted: false, Typeid: type._id  }).limit(8);
      ResHelper.RenderRes(res, true, undeletedBooks)
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi khi truy xuất thất bại');
    }
  });

  router.get('/:id', async function (req, res, next) {
    try {
      // Tìm tất cả các sản phẩm không bị xóa
      const detailproduct = await productModel.findOne({ isDeleted: false, productid: req.params.id });
      ResHelper.RenderRes(res, true, detailproduct)
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi khi truy xuất thất bại');
    }
  });

//Tìm kiếm
router.get('/search', async function (req, res, next) {
  console.log(req.query);
  let exclude = ["sort", "page", "limit"];
  //tạo mảng chứa thông tin các object được truy xuất tìm kiếm
  let stringArray = ["name"];
  let queries = {};
  for (const [key, value] of Object.entries(req.query)) {
      if (!exclude.includes(key)) {
      if (stringArray.includes(key)) {
          queries[key] = new RegExp(value.replace(',', "|"), 'i');
      }
      // if(numberArray.includes(key)){
      //     console.log();
      //     var rex = new RegExp('lte|gte|lt|gt','i');
      //     var string = JSON.stringify(req.query[key]);
      //     let index = string.search(rex);
      //     var newvalue = string.slice(0,index)+'$'+string.slice(index);
      //     queries[key] = JSON.parse(newvalue);
      // }

      }
  }
  console.log(queries);

  //Kiểm tra và giới hạn số trang
  let limit = req.query.limit ? req.query.limit : 5;
  let page = req.query.page ? req.query.page : 1;
  let sortQuery = {};
  if (req.query.sort) {
      if (req.query.sort.startsWith('-')) {
      let field = req.query.sort.substring(1, req.query.sort.length);
      sortQuery[field] = -1;
      } else {
      sortQuery[req.query.sort] = 1;
      }
  }

  //Khai báo dữ liệu ra
  let products = await productModel.find(
      queries)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sortQuery)
      .exec();
  ResHelper.RenderRes(res, true, products)
  });

// Tự sinh id
  function GenID(length){
    let source = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      let rand = Math.floor(Math.random()*61);
      result+=source[rand];
    }
    return result;
  }

//Create new product
router.post('/', async function (req, res, next) {
    try {
      console.log(req.body);
      // Kiểm tra xem Brand có tồn tại không
      // const type = await TypeModel.findById(req.body.type );
      // if (!type) {
      //   return res.status(404).json({ message: 'Type not found' });
      // }

      // Lấy ngày tháng hiện tại
      const currentDate = new Date();

      // Định dạng ngày tháng và thời gian theo DMYHIMS
      const formattedDateTime = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

      var newproduct = new productModel({
        productid: formattedDateTime + GenID(5),
        name: req.body.name,
        image: req.body.image,
        title: req.body.title,
        SLT: req.body.SLT,
        price: req.body.price,
        Typeid: req.body.type
      })
      await newproduct.save();
      ResHelper.RenderRes(res, true, newproduct)
    } catch (error) {
      ResHelper.RenderRes(res, false, error)
    }
  });

  router.delete('/:id', checkLogin, checkAuthorize("admin"), async function (req, res, next) {
    try {
      let product = await productModel.findByIdAndUpdate
        (req.params.id, {
          isDeleted: true
        }, {
          new: true
        }).exec()
      ResHelper.RenderRes(res, true, product);
    } catch (error) {
      ResHelper.RenderRes(res, false, error)
    }
  });

  router.put('/restore/:id', checkLogin, checkAuthorize("admin"), async function (req, res, next) {
    try {
      let product = await productModel.findByIdAndUpdate
        (req.params.id, {
          isDeleted: false
        }, {
          new: true
        }).exec()
      ResHelper.RenderRes(res, true, product);
    } catch (error) {
      ResHelper.RenderRes(res, false, error)
    }
  });

  router.put('/:id', checkLogin, checkAuthorize("admin"), async function (req, res, next) {
    try {
      let product = await productModel.findByIdAndUpdate
        (req.params.id, req.body, {
          new: true
        }).exec()
      ResHelper.RenderRes(res, true, product);
    } catch (error) {
      ResHelper.RenderRes(res, false, error)
    }
  });

module.exports = router;