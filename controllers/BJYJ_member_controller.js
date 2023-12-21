const { BJYJMEMBER } = require("../models/BJYJ_member_model");
const { Vender } = require("../models/vendermodel");
const { VenderSession } = require("../models/vender_session_table_model");
const { VenderHistory } = require("../models/vender_history_table_model");
const { Op } = require('sequelize');
const { sequelize } = require("../config/db");

// get member data by pagination on state_code
exports.getMembers = async (req, res) => {
    let ID = req.body.venderId;
    let vender = await Vender.findByPk(ID);
    let role = vender.ROLE
    const state_code = req.params["state_code"];
    const pageNumber = req.params["page"];
    const pageSize = 100;
    const offset = (pageNumber - 1) * pageSize;
    let wherecondition
    if(role == "Admin"){
     wherecondition = { state_code: state_code };
    }else {
        wherecondition = { state_code: state_code , VENDER_ID : ID}
    }
    try {
      let users = await BJYJMEMBER.findAndCountAll({
        where: wherecondition,
        limit: pageSize,
        offset: offset,
      });
      res.status(200).json({success : users});
      
    } catch (error) {
      res.status(500).json({ error: "Something went wrong with the route" });
    }
};

// update member by id
exports.updateMemberbyId = async (req, res) => {
    let id = req.body.venderId;
    let ID = req.params["id"];
    let updateData = req.body;
    let vender = await Vender.findByPk(id);
    let role = vender.ROLE
    let wherecondition
    if( role === "Admin"){
        wherecondition = { id: ID };
    }else{
        wherecondition = { id: ID , VENDER_ID : id }
    }

    
    try {
        let user = await BJYJMEMBER.findOne({ where: wherecondition });

        if(user){
            let updated = await BJYJMEMBER.update(updateData, { where: wherecondition });

        if (updated[0] === 1) {
            let user = await BJYJMEMBER.findOne({ where: wherecondition });
            res.status(200).json({ success: user });
        } else {
            res.status(404).json({ error: "No Member found with the provided ID" });
        }
        }else{
            res.status(404).json({ error: "No Member found with the provided ID or not assigned to this Vender" });
        } 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// gets the member only if the member is assigned to the vender it works globly for admin
exports.getmemberbyId = async (req, res) => {
    let id = req.body.venderId;
    let ID = req.params["id"];
    let vender = await Vender.findByPk(id);
    let role = vender.ROLE
    let wherecondition
    if( role === "Admin"){
        wherecondition = { id: ID };
    }else{
        wherecondition = { id: ID , VENDER_ID : id }
    }
    try {
        let user = await BJYJMEMBER.findOne({ where: wherecondition });
        if (user) {
            res.status(200).json({success : user});
        } else {
            res.status(404).json({ error: "No member found with the provided ID or not assigned to you" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// filter and at the same time get the data
exports.filterbyStatus = async(req,res)=>{
    let id = req.body.venderId;
    let vender = await Vender.findByPk(id);
    const key = req.params["key"];
    const value = req.params["value"];
    const venderStatus = req.params["venderStatus"];
    const state_code = vender.ASSIGN_STATE_CODE;
    const status = req.params['status'];
    const page = req.params['page'];
  
   const whereConditions = {};
   whereConditions.state_code = state_code;
   whereConditions.VENDER_ID = id

   if(status != "0"){
    whereConditions.status = status;
   };

   if(venderStatus != "empty"){
    whereConditions.VENDER_STATUS = venderStatus
   };

    try {
        if(key === "0" && value === "0"){
            console.log(whereConditions)
            const limit = 100;
            const offset = (page - 1) * limit;
            const userRecords = await BJYJMEMBER.findAndCountAll({
              where: whereConditions,
              limit: limit,
              offset: offset,
            });
            res.status(200).json({success : userRecords});
        }else{
            const limit = 100;
            const offset = (page - 1) * limit;
            const lowerCaseValue = value.toLowerCase(); // Convert the query value to lowercase
            const records = await BJYJMEMBER.findAndCountAll({
                where: {
                  ...whereConditions,
                  [Op.or]: [
                    sequelize.where(sequelize.fn("LOWER", sequelize.col(key)), lowerCaseValue),
                    {
                      [key]: {
                        [Op.regexp]: `.*${lowerCaseValue}.*`,
                      },
                    },
                  ],
                },
                limit: limit,
                offset: offset,
              });
              res.status(200).json({success : records});
        }
  
    } catch (error) {
        console.log(error)
        res.status(500).json({error : "filter route is not functioning"});
    }
};

// gives the statics of the members of specific state
exports.getMemberstaticts = async (req, res) => {
    const state_code = req.params["state_code"];
    try {
        const TOTAL_VERIFIED_COUNT = await BJYJMEMBER.count({
            where: {
                [Op.or]: [{ VENDER_STATUS: "VERIFICATION_PASS" }, { VENDER_STATUS: "VERIFICATION_FAILED" }],
                state_code: state_code,
            },
        });
        const VERIFICATION_PENDING_COUNT = await BJYJMEMBER.count({
            where: { VENDER_STATUS: "VERIFICATION_PENDING", state_code: state_code },
        });
        const VERIFICATION_PASS_COUNT = await BJYJMEMBER.count({
            where: { VENDER_STATUS: "VERIFICATION_PASS", state_code: state_code },
        });
        const VERIFICATION_FAILED_COUNT = await BJYJMEMBER.count({
            where: { VENDER_STATUS: "VERIFICATION_FAILED", state_code: state_code },
        });
        const TOTAL_MEMBER_COUNT = await BJYJMEMBER.count({ where: { state_code: state_code } });

        let resobj = {
            TOTAL_VERIFIED_COUNT,
            VERIFICATION_PASS_COUNT,
            VERIFICATION_FAILED_COUNT,
            VERIFICATION_PENDING_COUNT,
            TOTAL_MEMBER_COUNT,
        };

        res.status(200).json({ success: resobj });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong in the getcount route" });
    }
};

// This is used by venders to search the members which are assigned
exports.searchMemberForVender = async (req, res) => {
    const key = req.params["key"];
    const value = req.params["value"];
    const venderId = req.body.venderId;

    try {
        // Validate that key is a valid column name to prevent SQL injection
        const validColumns = ["yuva_user_id", "state_code", "age", "year", "name", "mobile"];
        if (!validColumns.includes(key)) {
            return res.status(400).json({ error: "Invalid search key" });
        }

        const vender = await Vender.findByPk(venderId);

        if (!vender) {
            return res.status(404).json({ error: "Vender not found" });
        }

        const stateCode = vender.ASSIGN_STATE_CODE;
        const lowerCaseValue = value.toLowerCase(); // Convert the query value to lowercase

        const user = await BJYJMEMBER.findAndCountAll({
            where: {
                [Op.and]: [
                    sequelize.where(
                        sequelize.fn("LOWER", sequelize.col(key)),
                        { [Op.like]: `%${lowerCaseValue}%` }
                    ),
                    { VENDER_ID: venderId, state_code: stateCode },
                ],
            },
        });

        if (user.rows.length > 0) {
            res.status(200).json({ success: user });
        } else {
            res.status(404).json({ message: "No matching records found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong in the searchMemberForVender route" });
    }
};

// This is used by admin to search the members which are assigned
exports.adminFindMember = async (req, res) => {
    const key = req.params["key"];
    const value = req.params["value"];
    const venderId = req.body.venderId;
    const page = req.params["page"] || 1;
    const pageSize = 20; // Adjust the page size as needed

    try {
        // Validate that key is a valid column name to prevent SQL injection
        const validColumns = ["yuva_user_id", "state_code", "age", "year", "name", "mobile"];
        if (!validColumns.includes(key)) {
            return res.status(400).json({ error: "Invalid search key" });
        }

        const vender = await Vender.findByPk(venderId);

        if (!vender) {
            return res.status(404).json({ error: "Vender not found" });
        }

        const stateCode = vender.ASSIGN_STATE_CODE;
        const lowerCaseValue = value.toLowerCase(); // Convert the query value to lowercase

        const offset = (page - 1) * pageSize;

        const user = await BJYJMEMBER.findAndCountAll({
            where: {
                [Op.and]: [
                    sequelize.where(
                        sequelize.fn("LOWER", sequelize.col(key)),
                        { [Op.like]: `%${lowerCaseValue}%` }
                    ),
                    {state_code: stateCode },
                ],
            },
            limit: pageSize,
            offset: offset,
        });

        if (user.rows.length > 0) {
            res.status(200).json({ success: user });
        } else {
            res.status(404).json({ message: "No matching records found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong in the searchMemberForVender route" });
    }
};


