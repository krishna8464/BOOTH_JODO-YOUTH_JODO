const { LsAsMapping } = require("../models/tbl_ls_as_mappingmodel");
const { sequelize } = require("../config/db");
const { Sequelize, DataTypes, Op } = require("sequelize");

// GET THE STATES FROM THE DB
exports.getstates = async ( req , res ) => {
    try {
        const distinctStateCodes = await LsAsMapping.findAll({
            attributes: ['STATE_CODE'],
            group: ['STATE_CODE'],
          });

    // Extract state codes from the result
    const stateCodes = distinctStateCodes.map((row) => row.STATE_CODE);
    res.status(200).json({ success : stateCodes });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "states fetch is not working" });
    }
};

//GET THE LOK SABHA FROM THE DB
exports.getLs = async (req, res) => {
    const ST = req.params["state_code"];
    try {
        const lsDetails = await LsAsMapping.findAll({
            attributes: ['LS_CODE', [sequelize.fn('MAX', sequelize.col('LS_NAME')), 'LS_NAME']],
            group: ['LS_CODE'],
            where: {
                STATE_CODE: ST,
            },
        });
        res.status(200).json({ success: lsDetails });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ls fetch is not working" });
    }
};


// GET THE ASSEMBLYS FROM THE DB
exports.getAs = async ( req , res ) => {
    const ST = req.params["state_code"]
    const LS = req.params["ls_code"]
    try {
        const AsDetails = await LsAsMapping.findAll({
            attributes: ['AS_CODE', 'AS_NAME'],
            where: {
              STATE_CODE: ST,
              LS_CODE : LS
            },
          });
          res.status(200).json({success : AsDetails});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "As fetch is not working" });
    }
};


