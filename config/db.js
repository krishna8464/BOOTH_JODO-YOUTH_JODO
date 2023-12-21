const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("BJYJ","root","Vamshi@111047",{
    host : "localhost", 
    port : 3306,
    dialect : "mysql",
});


sequelize.authenticate()
.then((res)=>{
    console.log("Connection Successfull to db");
})
.catch((err) => {
    console.log("Failed to connect");
});

module.exports={
    sequelize
}