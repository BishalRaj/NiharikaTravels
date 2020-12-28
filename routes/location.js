"use strict";
const express = require("express");
const router = express.Router();

const LocationModal = require("../modal/locationModal");

// route for locations
router
.get("/filter", async (req, res) => {
  var regex = new RegExp(req.query["term"],'i');
  var locationFilter=LocationModal.find({location:regex},{'location':1}).sort({"updated_at":-1}).sort({"created_at":-1}).limit(25);

  locationFilter.exec((err,data)=>{
    var result=[];
  if(!err){
    if(data && data.length && data.length>0){
      data.forEach(location=>{
        let obj={
          label:location.location
        };
        result.push(obj);
      });
    }
  }
  res.jsonp(result);

  })

})



module.exports = router;
