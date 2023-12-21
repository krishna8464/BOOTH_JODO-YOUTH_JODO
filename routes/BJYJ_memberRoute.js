const express = require("express");
const Memberroute = express.Router();

const { authMiddleware } = require("../middleware/auth");

const {
    getMembers,
    updateMemberbyId,
    getmemberbyId,
    filterbyStatus,
    getMemberstaticts,
    searchMemberForVender,
    adminFindMember
} = require("../controllers/BJYJ_member_controller");

Memberroute.post("/getMembers/:state_code/:page" , authMiddleware , getMembers);

Memberroute.post("/updateMemberbyId/:id" , authMiddleware , updateMemberbyId);

Memberroute.post("/getmemberbyId/:id" , authMiddleware , getmemberbyId);

Memberroute.post("/filter/:key/:value/:status/:venderStatus/:page" , authMiddleware , filterbyStatus);

Memberroute.post("/getMemberstaticts/:state_code" , authMiddleware , getMemberstaticts);

Memberroute.post("/searchMemberforvender/:key/:value" , authMiddleware , searchMemberForVender );

Memberroute.post("/adminFindMember/:key/:value/:page" , authMiddleware , adminFindMember)




module.exports = { Memberroute };