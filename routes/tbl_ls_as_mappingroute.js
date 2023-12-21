const express = require("express");
const Lsasmapping = express.Router();

const {
    getstates,
    getLs,
    getAs
} = require("../controllers/tbl_ls_as_mappingcontroller");

Lsasmapping.post("/getstates" ,  getstates);

Lsasmapping.post("/getLs/:state_code" , getLs);

Lsasmapping.post("/getAs/:state_code/:ls_code" , getAs);




module.exports = { Lsasmapping };