const express = require('express');
const { Post } = require('../db/models');
const Ajv = require('ajv');
const ajv = new Ajv();
const router = express.Router();


router.patch('/:postId', async (req, res, next) => {
  try {
    // Query/Params
    const { postId } = req.params;

    // console.log(authorIds)
    if (postId != undefined) {
      const postIdPromise = await Post.getPostsByUserId(postId);

      // Body
      const inputData = req.body;

      const isInputDataValid = InputValidation(inputData);

      // const isInputDataValid = true;
      if (isInputDataValid) {
        const { authorIds, text, tags } = inputData;

        const isAuthorId = authorIdCheck(authorIds, parseInt(postId));

        if (isAuthorId) {

           postIdPromise.forEach(object => {
        
        object.dataValues["tags"] = tags;
        object.dataValues["text"] = text;
        object.dataValues.authorIds = authorIds;
  
      });
          
 
          res.json({ post: postIdPromise[0] });

        } else {
          res.status(400).json('postId is not in AuthorIds');
        }
      } else {
        res.status(401).json('The input data is invalid!');
      }

    }
  } catch (error) {
    next(error);
  }
});

function InputValidation(inputData) {
  // Schema for validating inputs
  const schema = {
    type: 'object',
    properties: {
      authorIds: { type: 'array', items: { type: 'integer' } },
      tags: { type: 'array', items: { type: 'string' } },
      text: { type: 'string' },
    },
    additionalProperties: false,
  };
  return ajv.validate(schema, inputData);
}

function authorIdCheck(array, id) {
  return array.includes(id);
}

module.exports = router;
