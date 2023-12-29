const express = require("express");
const Venderroute = express.Router();


const { authMiddleware } = require("../middleware/auth");

const {
    createVender,
    getOTP,
    validateOTP,
    updateVenderbyid,
    updateVenderbyauth,
    getvenderHistorybyid,
    getvenderHistorybyauth,
    getoneVenderbyid,
    getoneVenderbyauth,
    getallVenders,
    venderLogout,
    assignMemberstovender,
    releaseMemberfromvender,
    venderReport,
    getStatisticsbyvenderid,
    getStatisticsbyvenderauth,
    filterforvender,
    Venderhistoryfilterforadmin,
    Venderhistoryfilterforvenderwithauth,
} = require("../controllers/vendercontroller");

Venderroute.post("/createVender" , createVender);

Venderroute.post("/getOTP" , getOTP);

Venderroute.post("/validateOTP" , validateOTP);

Venderroute.post("/updateVenderbyid/:id" , authMiddleware , updateVenderbyid);

Venderroute.post("/updateVenderbyauth" , authMiddleware , updateVenderbyauth);

Venderroute.post("/getvenderHistorybyid/:id/:page" , authMiddleware , getvenderHistorybyid);

Venderroute.post("/getvenderHistorybyauth/:page" , authMiddleware , getvenderHistorybyauth);

Venderroute.post("/getoneVenderbyid/:id" , authMiddleware , getoneVenderbyid);

Venderroute.post("/getoneVenderbyauth" , authMiddleware , getoneVenderbyauth);

Venderroute.post("/getallVenders/:state_code" , authMiddleware , getallVenders);

Venderroute.post("/venderLogout" , authMiddleware , venderLogout);

Venderroute.post("/assignMemberstovender/:venderid/:state_code/:recordcount" , authMiddleware , assignMemberstovender );

Venderroute.post("/releaseMemberfromvender/:venderid/:state_code/:recordcount" , authMiddleware , releaseMemberfromvender);

Venderroute.post("/venderReport/:state_code" , authMiddleware , venderReport);

Venderroute.post("/getStatisticsbyvenderid/:venderid/:state_code" , authMiddleware , getStatisticsbyvenderid );

Venderroute.post("/getStatisticsbyvenderauth/:state_code" , authMiddleware , getStatisticsbyvenderauth);

Venderroute.post("/filterforvender/:key/:value/:status/:role/:loginstatus/:page" , authMiddleware , filterforvender );

Venderroute.post("/Venderhistoryfilter/:admin_id/:action_type/:datefrom/:dateto/:page" , authMiddleware , Venderhistoryfilterforadmin);

Venderroute.post("/Venderhistoryfilterforvenderwithauth/:action_type/:datefrom/:dateto/:page" , authMiddleware , Venderhistoryfilterforvenderwithauth);


module.exports = { Venderroute }