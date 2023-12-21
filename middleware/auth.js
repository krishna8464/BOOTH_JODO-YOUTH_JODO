const jwt = require("jsonwebtoken");
const { VenderSession } = require("../models/vender_session_table_model");

// to give the user authentication to access the routes
const authMiddleware = async (req, res, next) => {

  if(req.headers.authorization){
    let [tokenSyn, token] = req.headers.authorization.trim().split(" ");
  
    try {
      if (tokenSyn=="Bearer") {

        const result = await VenderSession.findOne({
          where: { TOKEN: token }, // Replace columnName and desiredValue with your specific column name and value
        });

        // let black= await client.SISMEMBER('blackTokens', token);
        if(result.STATUS==="INACTIVE"){
            res.status(400).json({error:"Please Login Again"})
        }else{
            const decodedToken = jwt.verify(token, "BJYJ");
            req.body.venderId = decodedToken.venderid;
            next();
        }
      } else {
        res.status.json({error : "Token not authorized."});
        return;
      }
    } catch (e) {
      res.status(500).json({error : "Token not authorized."});
    }
  }
  };

  module.exports = { authMiddleware }

  