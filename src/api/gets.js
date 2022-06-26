const express = require('express');
const { Post } = require('../db/models');
const Ajv = require('ajv');
const ajv = new Ajv();

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    
    // Schema for validating inputs
    const schema = {
      type: "object",
      properties: {
        authorIds: {type: "string"},
        sortBy: {type: "string", default: "id", enum: ["id", "reads", "likes", "popularity"]},
        direction: {type: "string", default: "asc", enum: ["asc", "desc"]},
      },
      required: ["authorIds"],
      additionalProperties: false,
    };
    
    // Query/Params
    const {authorIds} = req.query;
  
    if(authorIds != undefined){
      const authorPostsPromise = await Post.getPostsByUserId(authorIds);

      authorPostsPromise.forEach(object => {
        object.dataValues["tags"] = object.dataValues["tags"].split(',')
      })

      res.json( {posts: authorPostsPromise});
    }


    // Body JSON
    const inputData = req.body;
    const isInputDataValid = ajv.validate(schema, inputData);
    
    if(isInputDataValid){
      console.log("valid");
    
    const {authorIds, sortBy, direction} = inputData;  
    var authorIdsArray = authorIds.split(',');

    let promises = [];
    let result = [];

    authorIdsArray.forEach((element) => {
      promises.push(Post.getPostsByUserId(element));
    });

    const data = await Promise.all(promises);
    data.forEach((d) => { // d is [{},{}],[{}],[]
      d.forEach((r) => { // r is {}
        result.push(r);
      });
    });
    
    
    
    // Remove duplicate from list
    const uniqueResult = removeDuplicate(result);
    
    
    // For setBy likes, popularity, id and it will sort ascending
    if(sortBy !== undefined){
      uniqueResult.sort((a,b) =>  { return a.dataValues[sortBy] - b.dataValues[sortBy]});
      
    }
    
    // sorting descending
    if(direction !== undefined && direction === "desc" ){
      uniqueResult.reverse();
    }


    res.status(200).json({ posts: uniqueResult });

    }else{
      res.status(401).json("The input data is invalid! No empty values or uppercase");

    }// if Body row
    

  } catch (error) {
    next(error);
  }
});

// Remove duplicates for array of objects
function removeDuplicate(array){
  const uniqueIds = [];
  const unique = array.filter(element => {
    const isDuplicate = uniqueIds.includes(element.id);
    if(!isDuplicate){
      uniqueIds.push(element.id);
      return true;
    }else
      return false;
  });
  
  return unique;
  
}


module.exports = router;
