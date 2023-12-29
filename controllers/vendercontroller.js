const { Vender } = require("../models/vendermodel");
const { VenderSession } = require("../models/vender_session_table_model");
const { VenderHistory } = require("../models/vender_history_table_model");
const { BJYJMEMBER } = require("../models/BJYJ_member_model");
const { atob } = require('atob');
const { Op } = require('sequelize');
const { sequelize } = require("../config/db");
const axios = require("axios");
const moment = require('moment-timezone');
const jwt = require('jsonwebtoken');


// createVender controller is used to create vender with validations unique key are mobile and email
exports.createVender = async (req, res) => {
    try {
       // Validate input data
    const { FIRST_NAME, MOBILE, EMAIL, ROLE , ASSIGN_STATE_CODE } = req.body;

    if (!FIRST_NAME || !MOBILE || !EMAIL || !ROLE || !ASSIGN_STATE_CODE) {
      return res.status(400).json({ error:'Missing required fields' });
    }

    // Create a new Vender
    const newVender = await Vender.create({
      FIRST_NAME,
      LAST_NAME: req.body.LAST_NAME || null,
      MOBILE,
      EMAIL,
      PHOTO_LINK: req.body.PHOTO_LINK || null,
      HOME_STATE_NAME: req.body.HOME_STATE_NAME || null,
      HOME_STATE_CODE: req.body.HOME_STATE_CODE || null,
      STATUS: req.body.STATUS || 'ACTIVE',
      ROLE,
      LOGIN_STATUS: req.body.LOGIN_STATUS || 'OFFLINE',
      CURRENT_IP: req.body.CURRENT_IP || null,
      PINCODE: req.body.PINCODE || null,
      HOME_ADDRESS: req.body.HOME_ADDRESS || null,
      ASSIGN_STATE_CODE
    });
    res.status(201).json({ success: newVender });
    } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        // Handle unique constraint violation
        return res.status(409).json({ error: 'Mobile number or email is already in use' });
    }
    console.error(error);
    res.status(500).json({ error:'Internal Server Error' });
    }
};

// getOTP controlelr is used to sent otp to the registerd users
exports.getOTP = async (req, res) => {
    let { number } = req.body;
    try {
      let venderData = await Vender.findOne({ where: { MOBILE: number } });
      let body = [venderData];
      console.log(venderData.STATUS);
      if (venderData && venderData.STATUS === "INACTIVE") {
        res.status(403).json({ error: "Vender is not AUTHORIZED" }); // 403 Forbidden
      } else {
        if (!body[0]) {
          res.status(404).json({ error: "Vender not found" }); // 404 Not Found
        } else {
          let binaryData = `[{"V":"1.5","ORG":"IYC","SESSION_ID":"cMjRQINXQPv9IydiTGFLHOAfIjOW4rhv2zfPWzrLBkhzXjscBO4xBDs9Up0IIwAi","DEVICE_ID":"cdbbed0a-1989-4fa7-859f-fc47dab6992a","USER_ID":"LTUveILGz+jqFIeLu3sD3g==","LATITUDE":"","LONGITUDE":"","STATE_CODE":"","MOBILE":${number}}]`;
          const base64Encoded = Buffer.from(binaryData).toString("base64");
          // console.log(base64Encoded);
  
          const url =
            "https://api.ycea.in/ycea/ycea-api/service/iyc/api/v1.0/auth/getOTP.php";
          const token = "72c831476bfc479d:4efb65f092ac72c83147";
  
          const dataToSend = base64Encoded;
  
          const headers = {
            "Content-Type": "text/plain",
            Authorization: `Bearer ${token}`,
            Token:
              "TGMJGnhY5jhiqNHwjwuH/+2LbKrt0oc1j1zlGbbXXotzXjscBO4xBDs9Up0IIwAi",
          };
  
          const response = await axios.post(url, dataToSend, { headers });
  
          let base64Dncoded = response.data;
          const decodedText = atob(base64Dncoded);
          const jsonObject = JSON.parse(decodedText);
          // console.log(jsonObject)
          if (jsonObject.status == "SUCCESS") {
            res.status(200).json({ success : "OTP Sent to the mobile" });
          } else {
            res.status(500).json({ error: "Send OTP is not working" });
          }
        }
      }
    } catch (error) {
      console.log(error);
      res.status(401).json({ error: 'Internal Server Error' });
    }
};

// validateOTP controller is used to validate the otp 
exports.validateOTP = async (req, res) => {
    let { number, otp , IP_ADDRESS , LONGITUDE , LATITUDE } = req.body;
  
    try {
      let venderData = await Vender.findOne({ where: { MOBILE: number } });
      let id = venderData ? venderData.ID : null;
  
      if (!venderData) {
        return res.status(404).json({ error: "Vender not found" }); // 404 Not Found
      }
  
      let binaryData = `[{"V":"1.5","ORG":"IYC","SESSION_ID":"cMjRQINXQPv9IydiTGFLHOAfIjOW4rhv2zfPWzrLBkhzXjscBO4xBDs9Up0IIwAi","DEVICE_ID":"cdbbed0a-1989-4fa7-859f-fc47dab6992a","USER_ID":"LTUveILGz+jqFIeLu3sD3g==","LATITUDE":"3.989234383434343","LONGITUDE":"9.034342423423","STATE_CODE":"KA","MOBILE":${number},"OTP":${otp}}]`;
      const base64Encoded = Buffer.from(binaryData).toString("base64");
  
      const url = "https://api.ycea.in/ycea/ycea-api/service/iyc/api/v1.0/auth/validateOTP.php";
      const tokens = "72c831476bfc479d:4efb65f092ac72c83147";
  
      const dataToSend = base64Encoded;
  
      const headers = {
        "Content-Type": "text/plain",
        Authorization: `Bearer ${tokens}`,
        Token: "TGMJGnhY5jhiqNHwjwuH/+2LbKrt0oc1j1zlGbbXXotzXjscBO4xBDs9Up0IIwAi",
      };
  
      const response = await axios.post(url, dataToSend, { headers });
  
      let base64Dncoded = response.data;
      const decodedText = atob(base64Dncoded);
      const jsonObject = JSON.parse(decodedText);
  
      if (jsonObject.status == "SUCCESS") {
        const venderSession = await VenderSession.findOne({
            where: { VENDER_ID : id , STATUS: 'ACTIVE'}
        });
        if(venderSession){
            let date =  moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss a')
            await VenderSession.update({ STATUS: 'INACTIVE', LOGOUT_TIME : date },{where: { VENDER_ID: id, STATUS: 'ACTIVE' }});
            await Vender.update({"LOGIN_STATUS" : "OFFLINE"}, {where: { ID : id }});
        };

        const token = jwt.sign({ venderid: id }, "BJYJ");

        let sessiondata = { VENDER_ID : venderData.ID , TOKEN : token, IP_ADDRESS , LONGITUDE , LATITUDE }
        await VenderSession.create(sessiondata);

        let updateQuery = { "LOGIN_STATUS" : "ONLINE" , CURRENT_IP : sessiondata.IP_ADDRESS};
        await Vender.update(updateQuery, {where: { ID : id }});

        let venderbody = await Vender.findByPk(id)

        return res.status(200).json({
          success: {
            Access_Token: token,
            venderdata: venderbody,
          },
        }); // 200 OK
      } else {
        return res.status(401).json({ error: "Wrong OTP entered" }); // 401 Unauthorized
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" }); // 500 Internal Server Error
    }
};

// updateVenderbyid controller is used to update the vender on his id
exports.updateVenderbyid = async (req, res) => {
    try {
        
      let date =  moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss a');
      const venderid = req.params["id"];
      const adminId = req.body.venderId;
      delete req.body.venderId;
      const updateData = req.body;
  
      // Validate venderId
      if (!venderid) {
        return res.status(400).json({ error: "Vender ID is required to update" });
      }
  
      // Validate updateData (you can add more specific validations based on your requirements)
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No update data provided" });
      }
  
      // Check if the vender with the given ID exists
      const vender = await Vender.findByPk(venderid);
      if (!vender) {
        return res.status(404).json({ error: "Vender not found" });
      }

      if (updateData.STATUS === "INACTIVE") {
         updateData.LOGIN_STATUS = "OFFLINE";
         const venderSessions = await VenderSession.findOne({
            where: { VENDER_ID : venderid , STATUS: 'ACTIVE'}
         });
         if(venderSessions){
         await VenderSession.update({ STATUS: 'INACTIVE', LOGOUT_TIME : date },{where: { VENDER_ID: venderid, STATUS: 'ACTIVE' }});
         };
      };
      console.log(req.body.ASSIGN_STATE_CODE);


      if(updateData.ASSIGN_STATE_CODE !== undefined && updateData.ASSIGN_STATE_CODE !== vender.ASSIGN_STATE_CODE){
        console.log("came to state change")
        let historyupdate1 = { VENDER_ID : venderid , STATE_CODE : vender.ASSIGN_STATE_CODE , ADMIN_ID : adminId , ACTION_TYPE : "CHANGE STATE CODE" , ACTION_INFO : `changed from ${vender.ASSIGN_STATE_CODE} to ${updateData.ASSIGN_STATE_CODE}`};
        let historyupdate2 = { VENDER_ID : venderid , STATE_CODE : updateData.ASSIGN_STATE_CODE , ADMIN_ID : adminId , ACTION_TYPE : "CHANGE STATE CODE" , ACTION_INFO : `changed from ${vender.ASSIGN_STATE_CODE} to ${updateData.ASSIGN_STATE_CODE}`};
        await VenderHistory.create(historyupdate1);
        await VenderHistory.create(historyupdate2);
      }
 
      updateData.UPDATED_ON = date
      // Perform the update
      const [rowsAffected] = await Vender.update(updateData, { where: { id: venderid } });
  
      if (rowsAffected === 1) {
        const updatedVender = await Vender.findByPk(venderid);
        return res.status(200).json({success : updatedVender});
      } else {
        return res.status(400).json({ error: "No vender updated" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
};

// updateVenderbyauth controller is used to update the vender by auth
exports.updateVenderbyauth = async (req, res) => {
  try {
      
    let date =  moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss a');
    const venderid = req.body.venderId;
    delete req.body.venderId;
    const updateData = req.body;

    // Validate venderId
    if (!venderid) {
      return res.status(400).json({ error: "Vender ID is required to update" });
    }

    // Validate updateData (you can add more specific validations based on your requirements)
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

    // Check if the vender with the given ID exists
    const vender = await Vender.findByPk(venderid);
    if (!vender) {
      return res.status(404).json({ error: "Vender not found" });
    }

    if (updateData.STATUS === "INACTIVE") {
       updateData.LOGIN_STATUS = "OFFLINE";
       const venderSessions = await VenderSession.findOne({
          where: { VENDER_ID : venderid , STATUS: 'ACTIVE'}
       });
       if(venderSessions){
       await VenderSession.update({ STATUS: 'INACTIVE', LOGOUT_TIME : date },{where: { VENDER_ID: venderid, STATUS: 'ACTIVE' }});
       };
    };
    console.log(req.body.ASSIGN_STATE_CODE);


    if(updateData.ASSIGN_STATE_CODE !== undefined && updateData.ASSIGN_STATE_CODE !== vender.ASSIGN_STATE_CODE){
      console.log("came to state change")
      let historyupdate1 = { VENDER_ID : venderid , STATE_CODE : vender.ASSIGN_STATE_CODE , ADMIN_ID : venderid , ACTION_TYPE : "CHANGE STATE CODE" , ACTION_INFO : `changed from ${vender.ASSIGN_STATE_CODE} to ${updateData.ASSIGN_STATE_CODE}`};
      let historyupdate2 = { VENDER_ID : venderid , STATE_CODE : updateData.ASSIGN_STATE_CODE , ADMIN_ID : venderid , ACTION_TYPE : "CHANGE STATE CODE" , ACTION_INFO : `changed from ${vender.ASSIGN_STATE_CODE} to ${updateData.ASSIGN_STATE_CODE}`};
      await VenderHistory.create(historyupdate1);
      await VenderHistory.create(historyupdate2);
    }

    updateData.UPDATED_ON = date
    // Perform the update
    const [rowsAffected] = await Vender.update(updateData, { where: { id: venderid } });

    if (rowsAffected === 1) {
      const updatedVender = await Vender.findByPk(venderid);
      return res.status(200).json({success : updatedVender});
    } else {
      return res.status(400).json({ error: "No vender updated" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//getvenderHistorybyid controller is used to get the history of vender history
exports.getvenderHistorybyid = async (req, res) => {
  let ID = req.params["id"];
  const page = req.params["page"] || 1;
  const pageSize = 20; 
  try {
    // Validate ID
    if (!ID || isNaN(ID)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }

    // Validate page
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ error: 'Invalid page parameter' });
    }

    // Find Vender by primary key
    const vender = await Vender.findByPk(ID);

    // Check if Vender exists
    if (!vender) {
      return res.status(404).json({ error: 'Vender not found' });
    }


    const result = await VenderHistory.findAndCountAll({
      where: {
        VENDER_ID : ID,
        state_code: vender.ASSIGN_STATE_CODE,
      },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    res.status(200).json({ success: result });
  } catch (error) {
    console.error('Error fetching vender history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//getvenderHistorybyauth controller is used to get the history of vender history
exports.getvenderHistorybyauth = async (req, res) => {
  let ID = req.body.venderId;
  const page = req.params["page"] || 1;
  const pageSize = 20; 
  try {
    // Validate ID
    if (!ID || isNaN(ID)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }

    // Validate page
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ error: 'Invalid page parameter' });
    }

    // Find Vender by primary key
    const vender = await Vender.findByPk(ID);

    // Check if Vender exists
    if (!vender) {
      return res.status(404).json({ error: 'Vender not found' });
    }


    const result = await VenderHistory.findAndCountAll({
      where: {
        VENDER_ID : ID,
        state_code: vender.ASSIGN_STATE_CODE,
      },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    res.status(200).json({ success: result });
  } catch (error) {
    console.error('Error fetching vender history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// getoneVenderbyid controlelr is used to get vender by id
exports.getoneVenderbyid = async (req, res) => {
  let ID = req.params["id"];
  try {
    let vender = await Vender.findByPk(ID);
    res.status(200).json({success : vender});
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "vender getonebyid route is not functioning" });
  }
};

//// getoneVenderbyauth controlelr is used to get vender by auth
exports.getoneVenderbyauth = async (req, res) => {
  let ID = req.body.venderId;
  try {
    let vender = await Vender.findByPk(ID);
    res.status(200).json({success : vender});
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "vender getonebyauth route is not functioning" });
  }
};

// getallVenders controller is used to get all venders and admins(not include asiigned_state_code for admin)
exports.getallVenders = async (req, res) => {
  const state_code = req.params["state_code"];
  try {
    let venders = await Vender.findAndCountAll({
      where: {
        [Op.or]: [
          { ROLE: 'admin' },
          { 
            ROLE: 'vender',
            ASSIGN_STATE_CODE: state_code,
          },
        ],
      },
      order: [['ROLE', 'DESC']],
    });

    for (const vender of venders.rows) {
      const VENDER_ID = vender.ID;

      // Count verification pass records
      const VERIFICATION_PASS_COUNT = await BJYJMEMBER.count({
        where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_PASS", state_code: state_code },
      });

      // Count verification failed records
      const VERIFICATION_FAILED_COUNT = await BJYJMEMBER.count({
        where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_FAILED", state_code: state_code },
      });

      // Count total verified records
      const TOTAL_VERIFIED_COUNT = await BJYJMEMBER.count({
        where: {
          [Op.or]: [{ VENDER_STATUS: "VERIFICATION_PASS" }, { VENDER_STATUS: "VERIFICATION_FAILED" }],
          state_code: state_code,
          VENDER_ID,
        },
      });

      // Count verification pending records
      const VERIFICATION_PENDING_COUNT = await BJYJMEMBER.count({
        where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_PENDING", state_code: state_code },
      });

      const plainVender = vender.get({ plain: true });

      plainVender.VERIFICATION_PASS_COUNT = VERIFICATION_PASS_COUNT;
      plainVender.VERIFICATION_FAILED_COUNT = VERIFICATION_FAILED_COUNT;
      plainVender.TOTAL_VERIFIED_COUNT = TOTAL_VERIFIED_COUNT;
      plainVender.VERIFICATION_PENDING_COUNT = VERIFICATION_PENDING_COUNT;
      plainVender.TOTAL_ASSIGNED_COUNT = TOTAL_VERIFIED_COUNT + VERIFICATION_PENDING_COUNT;

      vender.set(plainVender);
    }
    // console.log(venders)

    res.status(201).json({success : venders});
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "something went wrong with the route" });
  }
};

// venderLogout controller is used to logout and inactive the access tocken
exports.venderLogout = async (req, res) => {
  try {
    let ID = req.body.venderId;
    let date =  moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss a')
    await VenderSession.update({ STATUS: 'INACTIVE', LOGOUT_TIME : date },{where: { VENDER_ID: ID, STATUS: 'ACTIVE' }});
    await Vender.update({"LOGIN_STATUS" : "OFFLINE"}, {where: { ID : ID }});
    res.status(200).json({success : "Logout successfully"});
  } catch (error) {
    res
      .status(500)
      .json({ message: "vender logout route not functioning" });
  }
};

// Assigning member records to the venders including admins
exports.assignMemberstovender = async (req, res) => {
  let adminId = req.body.venderId;
  const venderid = req.params["venderid"];
  const recordcount = Number(req.params["recordcount"]);
  const state_code = req.params["state_code"];

  try {
      let vendor;
      const rolecheck = await Vender.findByPk(venderid);
      if (rolecheck && rolecheck.ROLE === "Admin") {
          vendor = await Vender.findOne({
              where: {
                  ID: venderid,
                  ROLE: "Admin",
              },
          });
      } else if (rolecheck && rolecheck.ROLE === "Vender" && rolecheck.ASSIGN_STATE_CODE === state_code) {
          vendor = await Vender.findOne({
              where: {
                  ID: venderid,
                  ROLE: "Vender",
                  ASSIGN_STATE_CODE: state_code,
              },
          });
      }
      if (vendor) {
          const count = await BJYJMEMBER.count({
              where: {
                  VENDER_STATUS: "VERIFICATION_PENDING",
                  VENDER_ID: 0,
                  state_code: state_code,
              },
          });

          if (count >= recordcount) {
              const [updatedRowCount] = await BJYJMEMBER.update(
                  { VENDER_ID: venderid },
                  {
                      where: {
                          VENDER_STATUS: "VERIFICATION_PENDING",
                          VENDER_ID: 0,
                          state_code: state_code,
                      },
                      limit: recordcount,
                  }
              );

              let historyupdate1 = {
                  VENDER_ID: venderid,
                  STATE_CODE: state_code,
                  ADMIN_ID: adminId,
                  ACTION_TYPE: "MEMBERS ASSIGNED",
                  ACTION_INFO: `${recordcount} RECORDS ASSIGNED FOR VERIFICATION`,
              };

              await VenderHistory.create(historyupdate1);

              res.status(200).json({ success: `${recordcount} Members assigned successfully` });
          } else {
              res.status(400).json({ error: `There are only ${count} records left to assign` });
          }
      } else {
          res.status(404).json({ error: "No vender found with this id or they are not assigned to this state" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong with the assigninspector route" });
  }
};

// Releasing member records from teh vender including admins
exports.releaseMemberfromvender = async (req, res) => {
  let adminId = req.body.venderId;
  const venderid = req.params["venderid"];
  const recordcount = Number(req.params["recordcount"]);
  const state_code = req.params["state_code"];

  try {
      let vendor;
      const rolecheck = await Vender.findByPk(venderid);

      if (rolecheck && rolecheck.ROLE === "Admin") {
          vendor = await Vender.findOne({
              where: {
                  ID: venderid,
                  ROLE: "Admin",
              },
          });
      } else if (rolecheck && rolecheck.ROLE === "Vender" && rolecheck.ASSIGN_STATE_CODE === state_code) {
          vendor = await Vender.findOne({
              where: {
                  ID: venderid,
                  ROLE: "Vender",
                  ASSIGN_STATE_CODE: state_code,
              },
          });
      }

      if (vendor) {
          const count = await BJYJMEMBER.count({
              where: {
                  VENDER_STATUS: "VERIFICATION_PENDING",
                  VENDER_ID: venderid,
                  state_code: state_code,
              },
          });

          if (count >= recordcount) {
              const [updatedRowCount] = await BJYJMEMBER.update(
                  { VENDER_ID: 0 },
                  {
                      where: {
                          VENDER_STATUS: "VERIFICATION_PENDING",
                          VENDER_ID: venderid,
                          state_code: state_code,
                      },
                      limit: recordcount,
                  }
              );

              let historyupdate1 = {
                  VENDER_ID: venderid,
                  STATE_CODE: state_code,
                  ADMIN_ID: adminId,
                  ACTION_TYPE: "MEMBERS RELEASED",
                  ACTION_INFO: `${recordcount} RECORDS RELEASED`,
              };

              await VenderHistory.create(historyupdate1);

              res.status(200).json({ success: `${recordcount} Members Released successfully` });
          } else {
              res.status(400).json({ error: `There are only ${count} records left to Release` });
          }
      } else {
          res.status(404).json({ error: "No vender found with this id or they are not a Vender or not assigned to this state" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong with the releavevender route" });
  }
};

// vender report for the specific state
exports.venderReport = async (req, res) => {
  const state_code = req.params["state_code"];
  try {
    // Get all venders with the role "inspector" and assigned to the specified state
    const venders = await Vender.findAll({
      where: {
        ROLE: "Vender",
        ASSIGN_STATE_CODE: state_code,
      },
    });

    // Validate that venders exist
    if (!venders || venders.length === 0) {
      return res.status(404).json({ message: "No venders found for the specified state" });
    }

    // Create an array to store vender data
    const venderData = [];

    // Fetch and store data for each vender
    for (const vender of venders) {
      const VENDER_ID = vender.ID;
      const VENDER_NAME = `${vender.FIRST_NAME} ${vender.LAST_NAME}`;
      const VENDER_NUMBER = vender.MOBILE;

      // Count verification pass records
      const VERIFICATION_PASS_COUNT = await BJYJMEMBER.count({
        where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_PASS", state_code: state_code },
      });

      // Count verification failed records
      const VERIFICATION_FAILED_COUNT = await BJYJMEMBER.count({
        where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_FAILED", state_code: state_code },
      });

      // Count total verified records
      const TOTAL_VERIFIED_COUNT = await BJYJMEMBER.count({
        where: {
          [Op.or]: [{ VENDER_STATUS: "VERIFICATION_PASS" }, { VENDER_STATUS: "VERIFICATION_FAILED" }],
          state_code: state_code,
          VENDER_ID,
        },
      });

      // Count verification pending records
      const VERIFICATION_PENDING_COUNT = await BJYJMEMBER.count({
        where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_PENDING", state_code: state_code },
      });

      // Count total assigned records
      const TOTAL_ASSIGNED_COUNT = await BJYJMEMBER.count({
        where: { VENDER_ID, state_code },
      });

      venderData.push({
        VENDER_ID,
        VENDER_NAME,
        VENDER_NUMBER,
        VERIFICATION_PASS_COUNT,
        VERIFICATION_FAILED_COUNT,
        VERIFICATION_PENDING_COUNT,
        TOTAL_VERIFIED_COUNT,
        TOTAL_ASSIGNED_COUNT,
      });
    }

    // Sort vender data by total verified count in descending order
    venderData.sort((a, b) => b.TOTAL_VERIFIED_COUNT - a.TOTAL_VERIFIED_COUNT);

    res.status(200).json({ success: venderData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong with the venderReport route" });
  }
};

// get statistics for specific vender by id
exports.getStatisticsbyvenderid = async (req, res) => {
  const VENDER_ID = req.params["venderid"];
  const state_code = req.params["state_code"];

  try {
    // Validate that VENDER_ID is a valid number
    if (isNaN(VENDER_ID) || parseInt(VENDER_ID) <= 0) {
      return res.status(400).json({ error: "Invalid VENDER_ID parameter" });
    }

    // Validate that state_code is provided
    if (!state_code) {
      return res.status(400).json({ error: "state_code parameter is required" });
    }

    // Count verification pass records
    const VERIFICATION_PASS_COUNT = await BJYJMEMBER.count({
      where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_PASS", state_code: state_code },
    });

    // Count verification failed records
    const VERIFICATION_FAILED_COUNT = await BJYJMEMBER.count({
      where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_FAILED", state_code: state_code },
    });

    // Count total verified records
    const TOTAL_VERIFIED_COUNT = await BJYJMEMBER.count({
      where: {
        [Op.or]: [{ VENDER_STATUS: "VERIFICATION_PASS" }, { VENDER_STATUS: "VERIFICATION_FAILED" }],
        state_code: state_code,
        VENDER_ID,
      },
    });

    // Count verification pending records
    const VERIFICATION_PENDING_COUNT = await BJYJMEMBER.count({
      where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_PENDING", state_code: state_code },
    });

    res.status(200).json({success : {
      VERIFICATION_PASS_COUNT,
      VERIFICATION_FAILED_COUNT,
      TOTAL_VERIFIED_COUNT,
      VERIFICATION_PENDING_COUNT,
    }});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong with the getStatisticsbyvenderid route" });
  }
};

// get statistics for specific vender by auth
exports.getStatisticsbyvenderauth = async (req, res) => {
  const VENDER_ID = req.body.venderId;
  const state_code = req.params["state_code"];

  try {
    // Validate that VENDER_ID is a valid number
    if (isNaN(VENDER_ID) || parseInt(VENDER_ID) <= 0) {
      return res.status(400).json({ error: "Invalid VENDER_ID parameter" });
    }

    // Validate that state_code is provided
    if (!state_code) {
      return res.status(400).json({ error: "state_code parameter is required" });
    }

    // Count verification pass records
    const VERIFICATION_PASS_COUNT = await BJYJMEMBER.count({
      where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_PASS", state_code: state_code },
    });

    // Count verification failed records
    const VERIFICATION_FAILED_COUNT = await BJYJMEMBER.count({
      where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_FAILED", state_code: state_code },
    });

    // Count total verified records
    const TOTAL_VERIFIED_COUNT = await BJYJMEMBER.count({
      where: {
        [Op.or]: [{ VENDER_STATUS: "VERIFICATION_PASS" }, { VENDER_STATUS: "VERIFICATION_FAILED" }],
        state_code: state_code,
        VENDER_ID,
      },
    });

    // Count verification pending records
    const VERIFICATION_PENDING_COUNT = await BJYJMEMBER.count({
      where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_PENDING", state_code: state_code },
    });

    res.status(200).json({success : {
      VERIFICATION_PASS_COUNT,
      VERIFICATION_FAILED_COUNT,
      TOTAL_VERIFIED_COUNT,
      VERIFICATION_PENDING_COUNT,
    }});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong with the getStatisticsbyvenderid route" });
  }
};

// filter vender route
exports.filterforvender = async(req,res)=>{
  let id = req.body.venderId;
  let vender = await Vender.findByPk(id);
  const key = req.params["key"];
  const value = req.params["value"];
  const role = req.params["role"];
  const loginstatus = req.params["loginstatus"];
  const state_code = vender.ASSIGN_STATE_CODE;
  const status = req.params['status'];
  const page = req.params['page'] || 1;

 const whereConditions = {};
 whereConditions.ASSIGN_STATE_CODE = state_code;

 if(status != "0"){
  whereConditions.STATUS = status;
 };

 if(role != "0"){
  whereConditions.ROLE = role
 };

 if(loginstatus != "0"){
  whereConditions.LOGIN_STATUS = loginstatus
 };

  try {
      if(key === "0" && value === "0"){
          const limit = 100;
          const offset = (page - 1) * limit;
          const userRecords = await Vender.findAndCountAll({
            where: whereConditions,
            limit: limit,
            offset: offset,
          });
          for (const vender of userRecords.rows) {
               
            const VENDER_ID = vender.ID;
      
            // Count verification pass records
            const VERIFICATION_PASS_COUNT = await BJYJMEMBER.count({
              where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_PASS", state_code: state_code },
            });
      
            // Count verification failed records
            const VERIFICATION_FAILED_COUNT = await BJYJMEMBER.count({
              where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_FAILED", state_code: state_code },
            });
      
            // Count total verified records
            const TOTAL_VERIFIED_COUNT = await BJYJMEMBER.count({
              where: {
                [Op.or]: [{ VENDER_STATUS: "VERIFICATION_PASS" }, { VENDER_STATUS: "VERIFICATION_FAILED" }],
                state_code: state_code,
                VENDER_ID,
              },
            });
            
            // Count verification pending records
            const VERIFICATION_PENDING_COUNT = await BJYJMEMBER.count({
              where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_PENDING", state_code: state_code },
            });
      
            const plainVender = vender.get({ plain: true });
      
            plainVender.VERIFICATION_PASS_COUNT = VERIFICATION_PASS_COUNT;
            plainVender.VERIFICATION_FAILED_COUNT = VERIFICATION_FAILED_COUNT;
            plainVender.TOTAL_VERIFIED_COUNT = TOTAL_VERIFIED_COUNT;
            plainVender.VERIFICATION_PENDING_COUNT = VERIFICATION_PENDING_COUNT;
            plainVender.TOTAL_ASSIGNED_COUNT = TOTAL_VERIFIED_COUNT + VERIFICATION_PENDING_COUNT;
      
            vender.set(plainVender);
          }
          res.status(200).json({success : userRecords});
      }else{
          const limit = 100;
          const offset = (page - 1) * limit;
          const lowerCaseValue = value.toLowerCase(); // Convert the query value to lowercase
          const records = await Vender.findAndCountAll({
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

            for (const vender of records.rows) {
               
              const VENDER_ID = vender.ID;
        
              // Count verification pass records
              const VERIFICATION_PASS_COUNT = await BJYJMEMBER.count({
                where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_PASS", state_code: state_code },
              });
        
              // Count verification failed records
              const VERIFICATION_FAILED_COUNT = await BJYJMEMBER.count({
                where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_FAILED", state_code: state_code },
              });
        
              // Count total verified records
              const TOTAL_VERIFIED_COUNT = await BJYJMEMBER.count({
                where: {
                  [Op.or]: [{ VENDER_STATUS: "VERIFICATION_PASS" }, { VENDER_STATUS: "VERIFICATION_FAILED" }],
                  state_code: state_code,
                  VENDER_ID,
                },
              });
              
              // Count verification pending records
              const VERIFICATION_PENDING_COUNT = await BJYJMEMBER.count({
                where: { VENDER_ID, VENDER_STATUS: "VERIFICATION_PENDING", state_code: state_code },
              });
        
              const plainVender = vender.get({ plain: true });
        
              plainVender.VERIFICATION_PASS_COUNT = VERIFICATION_PASS_COUNT;
              plainVender.VERIFICATION_FAILED_COUNT = VERIFICATION_FAILED_COUNT;
              plainVender.TOTAL_VERIFIED_COUNT = TOTAL_VERIFIED_COUNT;
              plainVender.VERIFICATION_PENDING_COUNT = VERIFICATION_PENDING_COUNT;
              plainVender.TOTAL_ASSIGNED_COUNT = TOTAL_VERIFIED_COUNT + VERIFICATION_PENDING_COUNT;
        
              vender.set(plainVender);
            }
            res.status(200).json({success : records});
      }

  } catch (error) {
      console.log(error)
      res.status(500).json({error : "filter route is not functioning"});
  }
};

// History filter get by admin id
exports.Venderhistoryfilter = async ( req , res ) => {
  console.log("came here")
  try {
    let id = req.body.venderId;
  let vender = await Vender.findByPk(id);
  const state_code = vender.ASSIGN_STATE_CODE;
  const admin_id = req.params["admin_id"];
  const action_type = req.params["action_type"];
  const datefrom = req.params["datefrom"];
  const dateto = req.params["dateto"];
  const page = req.params['page'] || 1;

  const whereConditions = {};
  whereConditions.STATE_CODE = state_code;
 
  if(admin_id !== "0"){
    whereConditions.ADMIN_ID = admin_id;
  }
  if(action_type !== "0"){
    whereConditions.ACTION_TYPE = action_type;
  }
  if(datefrom !== "0" && dateto !== "0" ){
    const createdAtFilter = {
      [Op.gte]: new Date(datefrom),
      [Op.lte]: new Date(dateto + " 23:59:59"),
    };
    whereConditions.CREATED_ON = createdAtFilter;
  }
  console.log(whereConditions)

  const venderHistory = await VenderHistory.findAndCountAll( {
    where: whereConditions,
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * 50, 
    limit: 50, 
  });

  res.status(200).json({success : venderHistory});
    
  } catch (error) {
    console.log(error)
    res.status(500).json({error : "filter route is not functioning"});
  }
}

