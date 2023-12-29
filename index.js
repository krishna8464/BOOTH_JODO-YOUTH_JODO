const express = require("express");
const cors = require("cors");
const fileUpload = require('express-fileupload');

const app = express();
const PORT = 5000;

const { Lsasmapping } = require("./routes/tbl_ls_as_mappingroute");
const { Venderroute } = require("./routes/venderRoute");
const { Memberroute } = require("./routes/BJYJ_memberRoute")
const { sequelize } = require("./config/db");
const { errorHandler } = require("./middleware/errorhandler");
const { logger } = require("./middleware/logger");


app.use(fileUpload());
app.use(express.json());
app.use(logger);
app.use(errorHandler);
app.use(cors({
    origin : "*"
}));
app.use((req, res, next) => {
    const clientIp =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
  
    console.log('Client IP Address:', clientIp);
    
    next();
});


app.get("/BJYJ",(req,res) => {
    res.status(200).json({"Gretting" : "Welcome to Booth Jodo Youth Jodo"})
});

app.use("/BJYJ/ls_as_mapping" , Lsasmapping);
app.use("/BJYJ/vender", Venderroute );
app.use("/BJYJ/Member" , Memberroute);

// Handle invalid routes
app.use(logger,(req, res) => {
    let msg = { error: 'Not found' }
    res.status(404).json(msg);
});





app.listen(PORT, async() => {
    try {
        await sequelize;
        console.log("Server connected successfull");
    } catch (error) {
        console.log(error.message);
        console.log("Server connection failed");
    };
    console.log(`server is running over ${PORT}`);
});
